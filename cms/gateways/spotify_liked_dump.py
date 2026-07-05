"""
Spotify Liked Songs gateway — one CMS document per calendar month.

Each run fetches all liked tracks from the Spotify API, groups them by
YYYY-MM, and yields one GatewayItem per month.  Re-syncing mid-month
updates the existing draft with any newly liked songs (content hash
change triggers an update via BaseGateway.sync).

Environment variables:
    SPOTIPY_CLIENT_ID       Spotify application client ID
    SPOTIPY_CLIENT_SECRET   Spotify application client secret
    SPOTIPY_REFRESH_TOKEN   Long-lived refresh token (preferred; obtain once
                            via ``python cms/gateways/get_spotify_token.py``)

    Legacy OAuth dance (only needed to obtain the initial refresh token):
    SPOTIPY_REDIRECT_URI    OAuth redirect URI (e.g. http://localhost:8888/callback)
"""

from __future__ import annotations

import calendar
import collections
import os
from collections.abc import AsyncIterator

import spotipy
from spotipy.oauth2 import SpotifyOAuth

from starlette_cms_gateways import BaseGateway, GatewayItem

_SCOPE = "user-library-read"


class SpotifyLikedDumpGateway(BaseGateway):
    """Sync Spotify liked songs into the CMS, one document per calendar month."""

    service_name = "spotify_liked_dump"
    block_type = "spotify_liked_dump"
    auto_publish = False  # create as drafts — publish manually after review

    def __init__(self, **kwargs) -> None:
        super().__init__(**kwargs)
        client_id = os.environ["SPOTIPY_CLIENT_ID"]
        client_secret = os.environ["SPOTIPY_CLIENT_SECRET"]
        refresh_token = os.environ.get("SPOTIPY_REFRESH_TOKEN")

        if refresh_token:
            # Use a pre-obtained refresh token — no browser / redirect needed.
            auth_manager = SpotifyOAuth(
                scope=_SCOPE,
                client_id=client_id,
                client_secret=client_secret,
                redirect_uri="http://localhost:8888/callback",  # not called
            )
            token_info = auth_manager.refresh_access_token(refresh_token)
            self._sp = spotipy.Spotify(auth=token_info["access_token"])
        else:
            # Fall back to interactive OAuth dance (requires SPOTIPY_REDIRECT_URI).
            self._sp = spotipy.Spotify(
                auth_manager=SpotifyOAuth(
                    scope=_SCOPE,
                    client_id=client_id,
                    client_secret=client_secret,
                    redirect_uri=os.environ["SPOTIPY_REDIRECT_URI"],
                )
            )

    async def fetch(self) -> AsyncIterator[GatewayItem]:  # type: ignore[override]
        """Yield one GatewayItem per YYYY-MM bucket of liked tracks."""
        # Fetch all liked tracks (paginated, 50 per request)
        tracks_by_month: dict[str, list[dict]] = collections.defaultdict(list)

        offset = 0
        limit = 50
        while True:
            result = self._sp.current_user_saved_tracks(limit=limit, offset=offset)
            items = result.get("items", [])
            if not items:
                break

            for item in items:
                track = item.get("track") or {}
                liked_at: str = item.get("added_at", "")
                month_key = liked_at[:7]  # "YYYY-MM"

                album = track.get("album") or {}
                album_images = album.get("images") or []
                # Pick smallest image for thumbnail (last in list = smallest)
                album_art_url = album_images[-1]["url"] if album_images else ""

                tracks_by_month[month_key].append(
                    {
                        "track_name": track.get("name", ""),
                        "artist_name": ", ".join(
                            a.get("name", "") for a in track.get("artists", [])
                        ),
                        "album_name": album.get("name", ""),
                        "album_art_url": album_art_url,
                        "spotify_url": (track.get("external_urls") or {}).get(
                            "spotify", ""
                        ),
                        "liked_at": liked_at,
                    }
                )

            if result.get("next") is None:
                break
            offset += limit

        # Yield one item per month, sorted oldest-first
        for month_key in sorted(tracks_by_month):
            songs = tracks_by_month[month_key]
            year_str, month_str = month_key.split("-")
            month_label = calendar.month_name[int(month_str)]
            title = f"What I've been listening to — {month_label} {year_str}"

            yield GatewayItem(
                import_ref=f"spotify:dump:{month_key}",
                slug=f"spotify-dump-{month_key}",
                title=title,
                body={
                    "title": title,
                    "publish_date": f"{month_key}-01",
                    "song_count": float(len(songs)),
                    "songs": songs,
                    "tags": ["music"],
                    "draft": True,
                },
            )
