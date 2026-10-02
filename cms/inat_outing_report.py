"""
Read-only: how would your real iNaturalist observations split into outings?

Fetches the public observations for a user, groups them by day and prints, per
day, how many outings each candidate radius gives, and the outings at the radius
the gateway uses (3 km, or INATURALIST_OUTING_RADIUS_M). Days where the answer
depends on the radius are the ones to eyeball. Writes nothing and needs no CMS.

Usage:
    uv run python -m cms.inat_outing_report                       # INATURALIST_USERNAME
    uv run python -m cms.inat_outing_report --user joel583 --radii 500 1000 3000 5000
    uv run python -m cms.inat_outing_report --only-differing
"""

from __future__ import annotations

import argparse
import asyncio
import collections
import os

import httpx

from cms.gateways.inaturalist_field_trips import (
    INaturalistFieldTripsGateway,
    cluster_observations,
    dominant_place,
    observation_coords,
    outing_radius_m,
)


async def fetch_all(user: str) -> list[dict]:
    gw = object.__new__(INaturalistFieldTripsGateway)
    gw._username = user
    async with httpx.AsyncClient(timeout=30) as http:
        return await gw._fetch_observations(http, {})


def report(observations: list[dict], radii: list[float], only_differing: bool = False) -> str:
    by_day: dict[str, list[dict]] = collections.defaultdict(list)
    for o in observations:
        if o.get("observed_on"):
            by_day[o["observed_on"]].append(o)

    header = "day         obs  located  " + "  ".join(f"{int(r):>5}m" for r in radii)
    lines = [header, "-" * len(header)]
    differing = 0
    for day in sorted(by_day):
        obs = by_day[day]
        counts = [len(cluster_observations(obs, r)) for r in radii]
        varies = len(set(counts)) > 1
        differing += varies
        if only_differing and not varies:
            continue
        located = sum(1 for o in obs if observation_coords(o))
        flag = "  <- depends on radius" if varies else ""
        lines.append(
            f"{day}  {len(obs):>4}  {located:>7}  " + "  ".join(f"{c:>6}" for c in counts) + flag
        )
        if varies or len(set(counts)) == 1 and counts[0] > 1:
            for i, cluster in enumerate(cluster_observations(obs, outing_radius_m()), 1):
                lines.append(f"              outing {i}: {len(cluster):>3} obs  {dominant_place(cluster) or '(no place)'}")
    lines.append("")
    lines.append(
        f"{len(by_day)} days, {len(observations)} observations; "
        f"{differing} day(s) where the radius changes the answer."
    )
    return "\n".join(lines)


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--user", default=os.environ.get("INATURALIST_USERNAME", "joel583"))
    ap.add_argument("--radii", type=float, nargs="+", default=[500, 1000, outing_radius_m(), 5000])
    ap.add_argument("--only-differing", action="store_true")
    args = ap.parse_args()
    print(report(asyncio.run(fetch_all(args.user)), args.radii, args.only_differing))


if __name__ == "__main__":
    main()
