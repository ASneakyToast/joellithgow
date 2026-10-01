"""
OAuth 2.1 authorization server for the MCP connectors.

Claude's mobile connector form has no field for a bearer token, only OAuth
client details, so /mcp and /mcp/gateway also accept OAuth access tokens issued
here. This is a deliberately small server for one user:

- One pre-registered client (the Claude connector), so no client registration.
- The "who are you" step reuses the CMS login: /oauth/authorize sends you to
  /api/auth/login and back, then asks you to approve the connector.
- Everything is a stateless HMAC-signed token, like the CMS session cookie.
  Revoke everything by rotating OAUTH_SIGNING_SECRET. The one piece of state is
  the set of used authorization codes, held in memory (single replica).

Caddy (jlithgow-ops mcp-proxy) calls /oauth/verify before proxying /mcp*, and
the 401 it returns tells Claude where to find the metadata below.

Spec: https://modelcontextprotocol.io/specification/draft/basic/authorization
"""

from __future__ import annotations

import base64
import hashlib
import hmac
import secrets
import time
from enum import StrEnum
from html import escape
from urllib.parse import urlencode, urlsplit

from pydantic import BaseModel, ConfigDict, ValidationError
from starlette.datastructures import FormData, QueryParams
from starlette.requests import Request
from starlette.responses import HTMLResponse, JSONResponse, RedirectResponse, Response
from starlette.routing import Route
from starlette_cms.session import validate_session_token

AS_METADATA_PATH = "/.well-known/oauth-authorization-server"
AUTHORIZE_PATH = "/oauth/authorize"
CLAUDE_REDIRECT_URI = "https://claude.ai/api/mcp/auth_callback"
GATEWAY_PATH = "/mcp/gateway"
LOGIN_PATH = "/api/auth/login"
MCP_PATH = "/mcp"
PKCE_METHOD = "S256"
PROTECTED_RESOURCE_PATH = "/.well-known/oauth-protected-resource"
SESSION_COOKIE = "cms_session"  # matches starlette_cms.api.auth._SESSION_COOKIE
TOKEN_PATH = "/oauth/token"
VERIFY_PATH = "/oauth/verify"

ACCESS_TTL_SECONDS = 3600
CODE_TTL_SECONDS = 60
REFRESH_TTL_SECONDS = 30 * 24 * 3600
REQUEST_TTL_SECONDS = 600


class Decision(StrEnum):
    APPROVE = "approve"
    DENY = "deny"


class GrantType(StrEnum):
    AUTHORIZATION_CODE = "authorization_code"
    REFRESH_TOKEN = "refresh_token"


class OAuthError(StrEnum):
    ACCESS_DENIED = "access_denied"
    INVALID_CLIENT = "invalid_client"
    INVALID_GRANT = "invalid_grant"
    INVALID_REQUEST = "invalid_request"
    INVALID_TARGET = "invalid_target"
    INVALID_TOKEN = "invalid_token"
    UNSUPPORTED_GRANT_TYPE = "unsupported_grant_type"
    UNSUPPORTED_RESPONSE_TYPE = "unsupported_response_type"


class TokenType(StrEnum):
    ACCESS = "access"
    CODE = "code"
    REFRESH = "refresh"
    REQUEST = "request"


class AuthorizationServerMetadata(BaseModel):
    authorization_endpoint: str
    authorization_response_iss_parameter_supported: bool = True
    code_challenge_methods_supported: list[str] = [PKCE_METHOD]
    grant_types_supported: list[str] = [GrantType.AUTHORIZATION_CODE, GrantType.REFRESH_TOKEN]
    issuer: str
    response_types_supported: list[str] = ["code"]
    token_endpoint: str
    token_endpoint_auth_methods_supported: list[str] = ["client_secret_basic", "client_secret_post"]


class Claims(BaseModel):
    """The payload of every signed value: pending request, code, access and refresh tokens."""

    client_id: str
    code_challenge: str | None = None
    exp: int
    jti: str
    redirect_uri: str | None = None
    resource: str | None = None  # None means valid for every MCP resource
    state: str | None = None
    sub: str | None = None
    typ: TokenType


class OAuthSettings(BaseModel):
    model_config = ConfigDict(frozen=True)

    client_id: str
    client_secret: str
    issuer: str = "https://cms.joellithgow.com"
    redirect_uris: tuple[str, ...] = (CLAUDE_REDIRECT_URI,)
    session_secret: str
    signing_secret: str

    @property
    def resources(self) -> tuple[str, ...]:
        return (self.issuer + MCP_PATH, self.issuer + GATEWAY_PATH)

    def resource_for_path(self, path: str) -> str:
        if path == GATEWAY_PATH or path.startswith(GATEWAY_PATH + "/"):
            return self.issuer + GATEWAY_PATH
        return self.issuer + MCP_PATH


class ProtectedResourceMetadata(BaseModel):
    authorization_servers: list[str]
    bearer_methods_supported: list[str] = ["header"]
    resource: str


class TokenResponse(BaseModel):
    access_token: str
    expires_in: int
    refresh_token: str
    token_type: str = "Bearer"


def _b64(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def _unb64(value: str) -> bytes:
    return base64.urlsafe_b64decode(value + "=" * (-len(value) % 4))


def _equal(a: str, b: str) -> bool:
    return hmac.compare_digest(a.encode(), b.encode())


def _now() -> int:
    return int(time.time())


def sign_claims(claims: Claims, secret: str) -> str:
    payload = claims.model_dump_json(exclude_none=True).encode()
    signature = hmac.new(secret.encode(), payload, hashlib.sha256).digest()
    return f"{_b64(payload)}.{_b64(signature)}"


def verify_claims(token: str, secret: str, typ: TokenType) -> Claims | None:
    """Return the claims if the token is signed by us, unexpired and of the given type."""
    try:
        payload_b64, signature_b64 = token.split(".")
        payload = _unb64(payload_b64)
        signature = _unb64(signature_b64)
    except ValueError:
        return None

    expected = hmac.new(secret.encode(), payload, hashlib.sha256).digest()
    if not hmac.compare_digest(signature, expected):
        return None

    try:
        claims = Claims.model_validate_json(payload)
    except ValidationError:
        return None

    if claims.typ != typ or claims.exp <= _now():
        return None
    return claims


def _bad_request(message: str) -> HTMLResponse:
    return HTMLResponse(f"<p>{escape(message)}</p>", status_code=400)


def _consent_page(req_token: str) -> HTMLResponse:
    return HTMLResponse(
        f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Authorize Claude</title>
<style>
  body {{ font-family: system-ui, sans-serif; max-width: 26rem; margin: 3rem auto; padding: 0 1rem; }}
  button {{ font-size: 1rem; padding: .75rem 1.25rem; margin-right: .5rem; }}
</style></head>
<body>
  <h1>Authorize Claude</h1>
  <p>Allow Claude to read, create, edit and publish content on joellithgow.com.</p>
  <form method="post" action="{AUTHORIZE_PATH}">
    <input type="hidden" name="req" value="{escape(req_token)}">
    <button type="submit" name="decision" value="{Decision.APPROVE}">Allow</button>
    <button type="submit" name="decision" value="{Decision.DENY}">Deny</button>
  </form>
</body></html>"""
    )


def _oauth_error(error: OAuthError, status_code: int = 400) -> JSONResponse:
    return JSONResponse({"error": error}, status_code=status_code, headers={"Cache-Control": "no-store"})


def _pkce_matches(verifier: str, challenge: str | None) -> bool:
    if not verifier or not challenge:
        return False
    return _equal(_b64(hashlib.sha256(verifier.encode()).digest()), challenge)


class OAuthServer:
    def __init__(self, settings: OAuthSettings) -> None:
        self._settings = settings
        self._used_codes: dict[str, int] = {}

    def routes(self) -> list[Route]:
        return [
            Route(AS_METADATA_PATH, self.authorization_server_metadata, methods=["GET"]),
            Route(AUTHORIZE_PATH, self.authorize, methods=["GET", "POST"]),
            Route(PROTECTED_RESOURCE_PATH, self.protected_resource_metadata, methods=["GET"]),
            Route(PROTECTED_RESOURCE_PATH + "/{resource_path:path}", self.protected_resource_metadata, methods=["GET"]),
            Route(TOKEN_PATH, self.token, methods=["POST"]),
            Route(VERIFY_PATH, self.verify, methods=["GET"]),
        ]

    # -- discovery ----------------------------------------------------------

    async def authorization_server_metadata(self, request: Request) -> JSONResponse:
        issuer = self._settings.issuer
        metadata = AuthorizationServerMetadata(
            authorization_endpoint=issuer + AUTHORIZE_PATH,
            issuer=issuer,
            token_endpoint=issuer + TOKEN_PATH,
        )
        return JSONResponse(metadata.model_dump())

    async def protected_resource_metadata(self, request: Request) -> JSONResponse:
        resource_path = "/" + request.path_params.get("resource_path", "")
        metadata = ProtectedResourceMetadata(
            authorization_servers=[self._settings.issuer],
            resource=self._settings.resource_for_path(resource_path),
        )
        return JSONResponse(metadata.model_dump())

    # -- authorize ----------------------------------------------------------

    async def authorize(self, request: Request) -> Response:
        if request.method == "POST":
            return await self._authorize_post(request)
        return self._authorize_get(request)

    def _authorize_get(self, request: Request) -> Response:
        req_token = request.query_params.get("req")
        if req_token:
            claims = verify_claims(req_token, self._settings.signing_secret, TokenType.REQUEST)
            if claims is None:
                return _bad_request("This authorization request has expired. Start again from Claude.")
        else:
            result = self._claims_from_params(request.query_params)
            if isinstance(result, Response):
                return result
            claims = result
            req_token = sign_claims(claims, self._settings.signing_secret)

        if self._session_user(request) is None:
            return self._redirect_to_login(req_token)
        return _consent_page(req_token)

    async def _authorize_post(self, request: Request) -> Response:
        form = await request.form()
        req_token = str(form.get("req") or "")
        claims = verify_claims(req_token, self._settings.signing_secret, TokenType.REQUEST)
        if claims is None or claims.redirect_uri is None:
            return _bad_request("This authorization request has expired. Start again from Claude.")

        user = self._session_user(request)
        if user is None:
            return self._redirect_to_login(req_token)

        if form.get("decision") != Decision.APPROVE:
            return self._redirect_to_client(claims, error=OAuthError.ACCESS_DENIED)

        code = Claims(
            client_id=claims.client_id,
            code_challenge=claims.code_challenge,
            exp=_now() + CODE_TTL_SECONDS,
            jti=secrets.token_urlsafe(16),
            redirect_uri=claims.redirect_uri,
            resource=claims.resource,
            sub=user,
            typ=TokenType.CODE,
        )
        return self._redirect_to_client(claims, code=sign_claims(code, self._settings.signing_secret))

    def _claims_from_params(self, params: QueryParams) -> Claims | Response:
        client_id = params.get("client_id", "")
        redirect_uri = params.get("redirect_uri", "")
        # Until both match we can't trust redirect_uri, so errors can't be sent to it.
        if not _equal(client_id, self._settings.client_id) or redirect_uri not in self._settings.redirect_uris:
            return _bad_request("Unknown client or redirect URI.")

        claims = Claims(
            client_id=client_id,
            code_challenge=params.get("code_challenge"),
            exp=_now() + REQUEST_TTL_SECONDS,
            jti=secrets.token_urlsafe(16),
            redirect_uri=redirect_uri,
            resource=params.get("resource"),
            state=params.get("state"),
            typ=TokenType.REQUEST,
        )

        if params.get("response_type") != "code":
            return self._redirect_to_client(claims, error=OAuthError.UNSUPPORTED_RESPONSE_TYPE)
        if not claims.code_challenge or params.get("code_challenge_method") != PKCE_METHOD:
            return self._redirect_to_client(claims, error=OAuthError.INVALID_REQUEST)
        if claims.resource and claims.resource not in self._settings.resources:
            return self._redirect_to_client(claims, error=OAuthError.INVALID_TARGET)
        return claims

    def _redirect_to_client(
        self, claims: Claims, *, code: str | None = None, error: OAuthError | None = None
    ) -> RedirectResponse:
        params = {"code": code, "error": error, "iss": self._settings.issuer, "state": claims.state}
        query = urlencode({key: value for key, value in params.items() if value is not None})
        separator = "&" if "?" in (claims.redirect_uri or "") else "?"
        return RedirectResponse(f"{claims.redirect_uri}{separator}{query}", status_code=302)

    def _redirect_to_login(self, req_token: str) -> RedirectResponse:
        # The login form sends the browser back to `next` after signing in.
        next_url = f"{AUTHORIZE_PATH}?{urlencode({'req': req_token})}"
        return RedirectResponse(f"{LOGIN_PATH}?{urlencode({'next': next_url})}", status_code=302)

    def _session_user(self, request: Request) -> str | None:
        cookie = request.cookies.get(SESSION_COOKIE)
        if not cookie:
            return None
        return validate_session_token(cookie, self._settings.session_secret)

    # -- token --------------------------------------------------------------

    async def token(self, request: Request) -> Response:
        form = await request.form()
        if not self._client_authenticated(request, form):
            return JSONResponse(
                {"error": OAuthError.INVALID_CLIENT},
                status_code=401,
                headers={"Cache-Control": "no-store", "WWW-Authenticate": "Basic"},
            )

        grant_type = form.get("grant_type")
        if grant_type == GrantType.AUTHORIZATION_CODE:
            return self._exchange_code(form)
        if grant_type == GrantType.REFRESH_TOKEN:
            return self._refresh(form)
        return _oauth_error(OAuthError.UNSUPPORTED_GRANT_TYPE)

    def _client_authenticated(self, request: Request, form: FormData) -> bool:
        client_id = str(form.get("client_id") or "")
        client_secret = str(form.get("client_secret") or "")

        header = request.headers.get("authorization", "")
        if header.startswith("Basic "):
            try:
                client_id, _, client_secret = base64.b64decode(header[len("Basic ") :]).decode().partition(":")
            except ValueError:
                return False

        return _equal(client_id, self._settings.client_id) and _equal(client_secret, self._settings.client_secret)

    def _exchange_code(self, form: FormData) -> Response:
        claims = verify_claims(str(form.get("code") or ""), self._settings.signing_secret, TokenType.CODE)
        if claims is None or not self._consume_code(claims):
            return _oauth_error(OAuthError.INVALID_GRANT)
        if form.get("redirect_uri") != claims.redirect_uri:
            return _oauth_error(OAuthError.INVALID_GRANT)
        if not _pkce_matches(str(form.get("code_verifier") or ""), claims.code_challenge):
            return _oauth_error(OAuthError.INVALID_GRANT)

        requested = form.get("resource")
        resource = claims.resource or (str(requested) if requested else None)
        if resource is not None and resource not in self._settings.resources:
            return _oauth_error(OAuthError.INVALID_TARGET)
        if requested and claims.resource and requested != claims.resource:
            return _oauth_error(OAuthError.INVALID_TARGET)
        return self._issue_tokens(sub=claims.sub, resource=resource)

    def _refresh(self, form: FormData) -> Response:
        claims = verify_claims(str(form.get("refresh_token") or ""), self._settings.signing_secret, TokenType.REFRESH)
        if claims is None:
            return _oauth_error(OAuthError.INVALID_GRANT)
        return self._issue_tokens(sub=claims.sub, resource=claims.resource)

    def _consume_code(self, claims: Claims) -> bool:
        """Mark a code as used. False if it was already used (replay)."""
        now = _now()
        self._used_codes = {jti: exp for jti, exp in self._used_codes.items() if exp > now}
        if claims.jti in self._used_codes:
            return False
        self._used_codes[claims.jti] = claims.exp
        return True

    def _issue_tokens(self, *, sub: str | None, resource: str | None) -> JSONResponse:
        def build(typ: TokenType, ttl: int) -> str:
            claims = Claims(
                client_id=self._settings.client_id,
                exp=_now() + ttl,
                jti=secrets.token_urlsafe(16),
                resource=resource,
                sub=sub,
                typ=typ,
            )
            return sign_claims(claims, self._settings.signing_secret)

        response = TokenResponse(
            access_token=build(TokenType.ACCESS, ACCESS_TTL_SECONDS),
            expires_in=ACCESS_TTL_SECONDS,
            refresh_token=build(TokenType.REFRESH, REFRESH_TTL_SECONDS),
        )
        return JSONResponse(response.model_dump(), headers={"Cache-Control": "no-store"})

    # -- verify (called by Caddy forward_auth) ------------------------------

    async def verify(self, request: Request) -> Response:
        """200 if the bearer is a valid access token for the forwarded path, else a 401 pointing at the metadata."""
        forwarded_path = urlsplit(request.headers.get("x-forwarded-uri", "")).path
        resource = self._settings.resource_for_path(forwarded_path)

        header = request.headers.get("authorization", "")
        claims = None
        if header.startswith("Bearer "):
            claims = verify_claims(header[len("Bearer ") :], self._settings.signing_secret, TokenType.ACCESS)

        if claims is not None and claims.resource in (None, resource):
            return Response(status_code=200, headers={"X-Auth-User": claims.sub or ""})

        metadata_url = self._settings.issuer + PROTECTED_RESOURCE_PATH + resource.removeprefix(self._settings.issuer)
        challenge = f'Bearer resource_metadata="{metadata_url}"'
        if header:
            challenge += f', error="{OAuthError.INVALID_TOKEN}"'
        return Response(status_code=401, headers={"WWW-Authenticate": challenge})


def build_oauth_routes(settings: OAuthSettings) -> list[Route]:
    return OAuthServer(settings).routes()
