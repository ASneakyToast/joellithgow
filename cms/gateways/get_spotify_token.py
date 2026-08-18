"""
One-time helper to obtain a Spotify refresh token.

Usage:
    SPOTIPY_CLIENT_ID=... SPOTIPY_CLIENT_SECRET=... uv run python cms/gateways/get_spotify_token.py

It will print a URL — open it in your browser, authorize, then paste the
redirect URL back.  The refresh token is printed; add it to your .env as
SPOTIPY_REFRESH_TOKEN.
"""

import os
import webbrowser

from spotipy.oauth2 import SpotifyOAuth

SCOPE = "user-library-read"
REDIRECT_URI = os.environ["SPOTIPY_REDIRECT_URI"]

auth = SpotifyOAuth(
    scope=SCOPE,
    client_id=os.environ["SPOTIPY_CLIENT_ID"],
    client_secret=os.environ["SPOTIPY_CLIENT_SECRET"],
    redirect_uri=REDIRECT_URI,
    open_browser=False,
)

url = auth.get_authorize_url()
print(f"\nOpen this URL in your browser:\n\n  {url}\n")
webbrowser.open(url)

redirected = input("After authorizing, paste the full redirect URL here: ").strip()
code = auth.parse_response_code(redirected)
token_info = auth.get_access_token(code, as_dict=True)

print(f"\n✅ Refresh token obtained!\n")
print(f"Add this to your .env file:\n")
print(f"  SPOTIPY_REFRESH_TOKEN={token_info['refresh_token']}\n")
