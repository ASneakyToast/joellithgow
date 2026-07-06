# Roadmap: Migrate CMS Backups to S3

**Current state:** Nightly SQLite backups written to `~/backups/` on the EC2 instance. Local dev and staging sync via `scp` over SSH.

---

## Why migrate to S3

### 1. Netlify builds become independent of EC2
Right now the Astro frontend fetches content from `cms.joellithgow.com` at build time. If the EC2 is down, rebooting, or the CMS container is broken, the Netlify build fails. With backups on S3, the build step could restore from `s3://joellithgow-cms-backups/latest.db.gz` directly — no live server dependency at all. This also makes the build reproducible and snapshotted (each deploy is pinned to the backup it used).

### 2. EC2 is not a durable store
The current EC2 instance has no EBS snapshot schedule. If it's terminated or its storage is lost, all content goes with it. S3 gives you 11 nines durability for pennies.

### 3. Local dev doesn't need SSH
`make db-sync` currently requires the EC2 to be reachable and your SSH key present. An S3 URL + AWS credentials (or a pre-signed URL) would let anyone on the team (or CI) pull the latest backup without needing SSH access.

### 4. Staging restore from CI
A GitHub Actions workflow could restore staging from the latest S3 backup on every push to `main`, keeping staging always fresh without a manual `make staging-restore`.

---

## Migration plan

1. **Provision S3 bucket** — `joellithgow-cms-backups`, private, versioning on, lifecycle rule to expire backups older than 90 days.
2. **IAM role on EC2** — instance profile with `s3:PutObject` on the bucket. No credentials in `.env`.
3. **Update backup script** — after writing `~/backups/content-YYYYMMDD.db.gz`, also run `aws s3 cp ... s3://joellithgow-cms-backups/latest.db.gz` and a dated copy for history.
4. **Update `make db-sync`** — replace `scp` with `aws s3 cp s3://joellithgow-cms-backups/latest.db.gz`. Needs `AWS_PROFILE` or instance role locally.
5. **Update Netlify build** — add `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` to Netlify env, pull backup in a `prebuild` step, restore into the content layer. Or switch the Astro content loader to read directly from the decompressed SQLite file at build time (skipping the CMS server entirely).
6. **Keep EC2 path as fallback** — don't remove `~/backups/` until the S3 path is proven in prod for a few weeks.

---

## Effort estimate
- S3 bucket + IAM: ~30 min
- Update backup + sync scripts: ~1 hour
- Netlify build integration (the big unlock): ~2–3 hours, touches the Astro content loader

## Dependencies
- AWS account with billing set up
- Decision on whether Netlify reads from S3 directly (file-based loader) or still hits a live CMS server (keep current loader, just restore DB from S3 before starting the container)
