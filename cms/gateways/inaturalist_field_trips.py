"""
iNaturalist Field Trips gateway — one CMS document per observation date.

Fetches all observations for the configured username via the iNaturalist v1
API, groups them by observed_on (calendar date), and yields one GatewayItem
per date group.  No authentication required — only public observations are
fetched.

Environment variables:
    INATURALIST_USERNAME    iNaturalist username to fetch observations for
"""

from __future__ import annotations

import collections
import os
from collections.abc import AsyncIterator

import httpx

from starlette_cms_gateways import BaseGateway, GatewayItem

_INAT_API = "https://api.inaturalist.org/v1"
_PAGE_SIZE = 200

# Maps iNaturalist iconic_taxon_name → friendly tag
_TAXON_TAGS: dict[str, str] = {
    "Aves": "birds",
    "Plantae": "plants",
    "Insecta": "insects",
    "Fungi": "fungi",
    "Mammalia": "mammals",
    "Reptilia": "reptiles",
    "Amphibia": "amphibians",
    "Arachnida": "spiders",
    "Mollusca": "mollusks",
    "Animalia": "animals",
    "Actinopterygii": "fish",
    "Chromista": "algae",
}


class INaturalistFieldTripsGateway(BaseGateway):
    """Sync iNaturalist observations into the CMS, one document per outing date."""

    service_name = "inaturalist_field_trips"
    block_type = "inaturalist_outing"
    auto_publish = False  # create as drafts — publish manually after review

    def __init__(self, **kwargs) -> None:
        super().__init__(**kwargs)
        self._username = os.environ["INATURALIST_USERNAME"]

    async def fetch(self) -> AsyncIterator[GatewayItem]:  # type: ignore[override]
        """Yield one GatewayItem per calendar date with observations."""
        observations = await self._fetch_all_observations()

        # Group by observed_on date
        by_date: dict[str, list[dict]] = collections.defaultdict(list)
        for obs in observations:
            date = obs.get("observed_on") or ""
            if date:
                by_date[date].append(obs)

        # Yield one item per date, sorted chronologically
        for date in sorted(by_date):
            obs_group = by_date[date]
            place_guess = self._dominant_place(obs_group)
            species_list = self._unique_species(obs_group)
            photo_urls = self._collect_photo_urls(obs_group)
            bounding_box = self._bounding_box(obs_group)
            count = len(obs_group)

            title = place_guess if place_guess else date
            tags = self._taxon_tags(obs_group)

            yield GatewayItem(
                import_ref=f"inaturalist:outing:{date}",
                slug=f"nature-outing-{date}",
                title=title,
                body={
                    "title": title,
                    "publish_date": date,
                    "outing_date": date,
                    "place_guess": place_guess,
                    "observation_count": float(count),
                    "species_list": species_list,
                    "observations": obs_group,
                    "photo_urls": photo_urls,
                    "bounding_box": bounding_box,
                    "tags": tags,
                },
            )

    # -----------------------------------------------------------------------
    # Private helpers
    # -----------------------------------------------------------------------

    async def _fetch_all_observations(self) -> list[dict]:
        """Page through all observations for the configured username."""
        all_obs: list[dict] = []
        page = 1

        async with httpx.AsyncClient(timeout=30) as client:
            while True:
                resp = await client.get(
                    f"{_INAT_API}/observations",
                    params={
                        "user_login": self._username,
                        "per_page": _PAGE_SIZE,
                        "page": page,
                        "order_by": "observed_on",
                        "order": "asc",
                    },
                )
                resp.raise_for_status()
                data = resp.json()
                results = data.get("results", [])
                if not results:
                    break
                all_obs.extend(results)
                if len(all_obs) >= data.get("total_results", 0):
                    break
                page += 1

        return all_obs

    @staticmethod
    def _dominant_place(obs_group: list[dict]) -> str:
        """Return the most common place_guess string across the group."""
        counts: dict[str, int] = collections.Counter(
            obs.get("place_guess") or ""
            for obs in obs_group
            if obs.get("place_guess")
        )
        if not counts:
            return ""
        return max(counts, key=counts.__getitem__)

    @staticmethod
    def _unique_species(obs_group: list[dict]) -> list[str]:
        """Collect unique common names from the observation group."""
        seen: set[str] = set()
        names: list[str] = []
        for obs in obs_group:
            taxon = obs.get("taxon") or {}
            name = taxon.get("preferred_common_name") or taxon.get("name") or ""
            if name and name not in seen:
                seen.add(name)
                names.append(name)
        return names

    @staticmethod
    def _collect_photo_urls(obs_group: list[dict]) -> list[str]:
        """Gather all photo URLs from the group (original size)."""
        urls: list[str] = []
        for obs in obs_group:
            for photo in obs.get("photos") or []:
                url = photo.get("url") or ""
                if url:
                    # Replace thumbnail suffix with original size
                    urls.append(url.replace("square", "original"))
        return urls

    @staticmethod
    def _taxon_tags(obs_group: list[dict]) -> list[str]:
        """Return sorted friendly tags for each iconic taxon present in the group."""
        seen: set[str] = set()
        for obs in obs_group:
            iconic = (obs.get("taxon") or {}).get("iconic_taxon_name") or ""
            tag = _TAXON_TAGS.get(iconic)
            if tag:
                seen.add(tag)
        return sorted(seen)

    @staticmethod
    def _bounding_box(obs_group: list[dict]) -> dict | None:
        """Compute lat/lon bounding box for the group, or None if no geo data."""
        lats: list[float] = []
        lons: list[float] = []
        for obs in obs_group:
            lat = obs.get("latitude")
            lon = obs.get("longitude")
            if lat is not None and lon is not None:
                try:
                    lats.append(float(lat))
                    lons.append(float(lon))
                except (TypeError, ValueError):
                    pass
        if not lats:
            return None
        return {
            "lat_min": min(lats),
            "lat_max": max(lats),
            "lon_min": min(lons),
            "lon_max": max(lons),
        }
