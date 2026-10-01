"""
Tests for cms/oauth.py. Run with: uv run --with pytest pytest tests/

The server is exercised through a bare Starlette app, so no CMS or database is needed.
"""

import base64
import hashlib
from urllib.parse import parse_qs, urlsplit

import pytest
from starlette.applications import Starlette
from starlette.testclient import TestClient
from starlette_cms.session import generate_session_token

from cms import oauth
from cms.oauth import (
    CLAUDE_REDIRECT_URI,
    OAuthSettings,
    TokenType,
    build_oauth_routes,
    sign_claims,
    verify_claims,
)

CLIENT_ID = "claude-connector"
CLIENT_SECRET = "client-secret"
ISSUER = "https://cms.example.com"
SESSION_SECRET = "session-secret"
SIGNING_SECRET = "signing-secret"
VERIFIER = "v" * 43


@pytest.fixture
def settings() -> OAuthSettings:
    return OAuthSettings(
        client_id=CLIENT_ID,
        client_secret=CLIENT_SECRET,
        issuer=ISSUER,
        session_secret=SESSION_SECRET,
        signing_secret=SIGNING_SECRET,
    )


@pytest.fixture
def client(settings: OAuthSettings) -> TestClient:
    return TestClient(Starlette(routes=build_oauth_routes(settings)), follow_redirects=False)


@pytest.fixture
def signed_in(client: TestClient) -> TestClient:
    client.cookies.set("cms_session", generate_session_token("joel", SESSION_SECRET))
    return client


def _challenge(verifier: str = VERIFIER) -> str:
    return base64.urlsafe_b64encode(hashlib.sha256(verifier.encode()).digest()).rstrip(b"=").decode()


def _authorize_params(**overrides: str) -> dict[str, str]:
    params = {
        "client_id": CLIENT_ID,
        "code_challenge": _challenge(),
        "code_challenge_method": "S256",
        "redirect_uri": CLAUDE_REDIRECT_URI,
        "resource": f"{ISSUER}/mcp",
        "response_type": "code",
        "state": "xyz",
    }
    return {**params, **overrides}


def _query(response) -> dict[str, str]:
    return {key: values[0] for key, values in parse_qs(urlsplit(response.headers["location"]).query).items()}


def _approve(client: TestClient, **overrides: str) -> str:
    """Run authorize (signed in) and approve; return the authorization code."""
    page = client.get("/oauth/authorize", params=_authorize_params(**overrides))
    assert page.status_code == 200
    req = page.text.split('name="req" value="')[1].split('"')[0]
    approved = client.post("/oauth/authorize", data={"decision": "approve", "req": req})
    assert approved.status_code == 302
    return _query(approved)["code"]


def _token(client: TestClient, **form: str):
    return client.post("/oauth/token", data=form, auth=(CLIENT_ID, CLIENT_SECRET))


def _exchange(client: TestClient, code: str, **overrides: str):
    form = {
        "code": code,
        "code_verifier": VERIFIER,
        "grant_type": "authorization_code",
        "redirect_uri": CLAUDE_REDIRECT_URI,
    }
    return _token(client, **{**form, **overrides})


def _verify(client: TestClient, token: str, path: str = "/mcp"):
    return client.get("/oauth/verify", headers={"Authorization": f"Bearer {token}", "X-Forwarded-Uri": path})


def test_authorization_server_metadata(client: TestClient) -> None:
    body = client.get("/.well-known/oauth-authorization-server").json()

    assert body["issuer"] == ISSUER
    assert body["authorization_endpoint"] == f"{ISSUER}/oauth/authorize"
    assert body["token_endpoint"] == f"{ISSUER}/oauth/token"
    assert body["code_challenge_methods_supported"] == ["S256"]


@pytest.mark.parametrize(
    ("path", "resource"),
    [
        ("/.well-known/oauth-protected-resource", f"{ISSUER}/mcp"),
        ("/.well-known/oauth-protected-resource/mcp", f"{ISSUER}/mcp"),
        ("/.well-known/oauth-protected-resource/mcp/gateway", f"{ISSUER}/mcp/gateway"),
    ],
)
def test_protected_resource_metadata(client: TestClient, path: str, resource: str) -> None:
    body = client.get(path).json()

    assert body["resource"] == resource
    assert body["authorization_servers"] == [ISSUER]


def test_authorize_sends_signed_out_users_to_the_cms_login(client: TestClient) -> None:
    response = client.get("/oauth/authorize", params=_authorize_params())

    assert response.status_code == 302
    location = urlsplit(response.headers["location"])
    assert location.path == "/api/auth/login"
    next_url = urlsplit(parse_qs(location.query)["next"][0])
    assert next_url.path == "/oauth/authorize"
    assert "req" in parse_qs(next_url.query)


def test_authorize_login_round_trip_reaches_the_consent_page(client: TestClient) -> None:
    first = client.get("/oauth/authorize", params=_authorize_params())
    next_url = parse_qs(urlsplit(first.headers["location"]).query)["next"][0]
    client.cookies.set("cms_session", generate_session_token("joel", SESSION_SECRET))

    page = client.get(next_url)

    assert page.status_code == 200
    assert "Allow" in page.text


@pytest.mark.parametrize(
    "overrides",
    [{"client_id": "someone-else"}, {"redirect_uri": "https://evil.example.com/callback"}],
)
def test_authorize_rejects_unknown_client_or_redirect_without_redirecting(
    signed_in: TestClient, overrides: dict[str, str]
) -> None:
    response = signed_in.get("/oauth/authorize", params=_authorize_params(**overrides))

    assert response.status_code == 400
    assert "location" not in response.headers


@pytest.mark.parametrize(
    ("overrides", "error"),
    [
        ({"code_challenge_method": "plain"}, "invalid_request"),
        ({"resource": "https://other.example.com/mcp"}, "invalid_target"),
        ({"response_type": "token"}, "unsupported_response_type"),
    ],
)
def test_authorize_reports_request_errors_to_the_client(
    signed_in: TestClient, overrides: dict[str, str], error: str
) -> None:
    response = signed_in.get("/oauth/authorize", params=_authorize_params(**overrides))

    assert response.status_code == 302
    query = _query(response)
    assert query["error"] == error
    assert query["state"] == "xyz"
    assert query["iss"] == ISSUER


def test_authorize_deny_returns_access_denied(signed_in: TestClient) -> None:
    page = signed_in.get("/oauth/authorize", params=_authorize_params())
    req = page.text.split('name="req" value="')[1].split('"')[0]

    response = signed_in.post("/oauth/authorize", data={"decision": "deny", "req": req})

    assert _query(response)["error"] == "access_denied"


def test_full_flow_issues_a_token_that_verifies_for_its_resource(signed_in: TestClient) -> None:
    code = _approve(signed_in)

    response = _exchange(signed_in, code)

    assert response.status_code == 200
    tokens = response.json()
    assert tokens["token_type"] == "Bearer"
    verified = _verify(signed_in, tokens["access_token"], "/mcp")
    assert verified.status_code == 200
    assert verified.headers["x-auth-user"] == "joel"


def test_token_is_bound_to_the_resource_it_was_issued_for(signed_in: TestClient) -> None:
    tokens = _exchange(signed_in, _approve(signed_in)).json()

    assert _verify(signed_in, tokens["access_token"], "/mcp/gateway").status_code == 401


def test_token_without_a_resource_works_for_both_servers(signed_in: TestClient) -> None:
    params = _authorize_params()
    del params["resource"]
    page = signed_in.get("/oauth/authorize", params=params)
    req = page.text.split('name="req" value="')[1].split('"')[0]
    code = _query(signed_in.post("/oauth/authorize", data={"decision": "approve", "req": req}))["code"]

    tokens = _exchange(signed_in, code).json()

    assert _verify(signed_in, tokens["access_token"], "/mcp").status_code == 200
    assert _verify(signed_in, tokens["access_token"], "/mcp/gateway").status_code == 200


def test_code_cannot_be_replayed(signed_in: TestClient) -> None:
    code = _approve(signed_in)

    assert _exchange(signed_in, code).status_code == 200
    replay = _exchange(signed_in, code)

    assert replay.status_code == 400
    assert replay.json()["error"] == "invalid_grant"


def test_wrong_pkce_verifier_is_rejected(signed_in: TestClient) -> None:
    response = _exchange(signed_in, _approve(signed_in), code_verifier="w" * 43)

    assert response.json()["error"] == "invalid_grant"


def test_redirect_uri_must_match_at_the_token_endpoint(signed_in: TestClient) -> None:
    response = _exchange(signed_in, _approve(signed_in), redirect_uri="https://evil.example.com/callback")

    assert response.json()["error"] == "invalid_grant"


def test_expired_code_is_rejected(signed_in: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    code = _approve(signed_in)
    later = oauth._now() + oauth.CODE_TTL_SECONDS + 1
    monkeypatch.setattr(oauth, "_now", lambda: later)

    assert _exchange(signed_in, code).json()["error"] == "invalid_grant"


def test_wrong_client_secret_is_rejected(signed_in: TestClient) -> None:
    code = _approve(signed_in)

    response = signed_in.post(
        "/oauth/token",
        data={"code": code, "code_verifier": VERIFIER, "grant_type": "authorization_code"},
        auth=(CLIENT_ID, "wrong"),
    )

    assert response.status_code == 401
    assert response.json()["error"] == "invalid_client"


def test_client_credentials_can_be_sent_in_the_form(signed_in: TestClient) -> None:
    code = _approve(signed_in)

    response = signed_in.post(
        "/oauth/token",
        data={
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "code": code,
            "code_verifier": VERIFIER,
            "grant_type": "authorization_code",
            "redirect_uri": CLAUDE_REDIRECT_URI,
        },
    )

    assert response.status_code == 200


def test_refresh_token_issues_a_new_working_access_token(signed_in: TestClient) -> None:
    tokens = _exchange(signed_in, _approve(signed_in)).json()

    refreshed = _token(signed_in, grant_type="refresh_token", refresh_token=tokens["refresh_token"])

    assert refreshed.status_code == 200
    assert _verify(signed_in, refreshed.json()["access_token"], "/mcp").status_code == 200


def test_refresh_token_is_not_accepted_as_an_access_token(signed_in: TestClient) -> None:
    tokens = _exchange(signed_in, _approve(signed_in)).json()

    assert _verify(signed_in, tokens["refresh_token"], "/mcp").status_code == 401


def test_access_token_is_not_accepted_as_a_refresh_token(signed_in: TestClient) -> None:
    tokens = _exchange(signed_in, _approve(signed_in)).json()

    response = _token(signed_in, grant_type="refresh_token", refresh_token=tokens["access_token"])

    assert response.json()["error"] == "invalid_grant"


def test_verify_without_a_token_points_at_the_metadata(client: TestClient) -> None:
    response = client.get("/oauth/verify", headers={"X-Forwarded-Uri": "/mcp/gateway"})

    assert response.status_code == 401
    assert response.headers["www-authenticate"] == (
        f'Bearer resource_metadata="{ISSUER}/.well-known/oauth-protected-resource/mcp/gateway"'
    )


def test_verify_flags_an_invalid_token(client: TestClient) -> None:
    response = _verify(client, "garbage")

    assert response.status_code == 401
    assert 'error="invalid_token"' in response.headers["www-authenticate"]


def test_tampered_token_is_rejected(settings: OAuthSettings) -> None:
    claims = oauth.Claims(client_id=CLIENT_ID, exp=oauth._now() + 60, jti="a", typ=TokenType.ACCESS)
    token = sign_claims(claims, SIGNING_SECRET)
    payload, signature = token.split(".")

    assert verify_claims(token, SIGNING_SECRET, TokenType.ACCESS) is not None
    assert verify_claims(f"{payload}.{signature[:-2]}AA", SIGNING_SECRET, TokenType.ACCESS) is None
    assert verify_claims(token, "another-secret", TokenType.ACCESS) is None
    assert verify_claims("not-a-token", SIGNING_SECRET, TokenType.ACCESS) is None
