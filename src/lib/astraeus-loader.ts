/**
 * Astraeus CMS raw HTTP client for Astro Content Layer loaders.
 *
 * This module has no dependency on `astro:content` and can be imported
 * from `src/content/config.ts` without risk of circular imports.
 * Caching is intentionally omitted — Astro's Content Layer calls loaders
 * once per build, so a per-build in-memory cache is unnecessary.
 */

export interface RawAstraeusDoc {
  id: string;
  slug: string;           // top-level CMS system field — use this as the Astro entry ID
  doc_type: string;
  body: Record<string, unknown>;
  published: boolean;
  created_at: string;
  updated_at: string;
}

function getBaseUrl(): string {
  // Try import.meta.env first (Vite/Astro dev context), fall back to process.env (Node.js / CI)
  try {
    return import.meta.env.ASTRAEUS_URL || process.env.ASTRAEUS_URL || 'http://localhost:8000';
  } catch {
    return process.env.ASTRAEUS_URL || 'http://localhost:8000';
  }
}

function getApiKey(): string | undefined {
  try {
    return import.meta.env.ASTRAEUS_API_KEY || process.env.ASTRAEUS_API_KEY;
  } catch {
    return process.env.ASTRAEUS_API_KEY;
  }
}

/**
 * Whether this build must have real CMS content to succeed. When true, the
 * loader turns silent degradation (missing key, unreachable/erroring CMS) into
 * a hard build failure, and a build that fetches zero documents from every
 * collection is rejected by the astro:build:done guard in astro.config.mjs —
 * so a broken CMS can never publish an empty site.
 *
 * Source of truth is REQUIRE_CMS_CONTENT (set to "1" on prod/staging builds in
 * netlify.toml; unset for local/dev so the []-skip convenience survives). As a
 * zero-config fallback, any Netlify CONTEXT other than "dev" also activates it.
 */
export function isCmsContentRequired(): boolean {
  const flag = process.env.REQUIRE_CMS_CONTENT;
  if (flag !== undefined) return flag === '1';
  const context = process.env.CONTEXT;
  return context !== undefined && context !== 'dev';
}

const PAGE_SIZE = 100;

type RawDoc = { id: string; slug: string; doc_type: string; body: Record<string, unknown>; published: boolean; created_at: string; updated_at: string };

function mapDoc(d: RawDoc): RawAstraeusDoc {
  return {
    id: d.id,
    slug: d.slug,
    doc_type: d.doc_type,
    body: d.body,
    published: d.published,
    created_at: d.created_at,
    updated_at: d.updated_at,
  };
}

/**
 * Fetch all published documents of `docType` from the Astraeus API.
 * Paginates automatically using limit/offset until all documents are retrieved.
 *
 * On a missing API key or a network/HTTP error this returns an empty array so
 * pure-frontend work can build without the CMS — UNLESS isCmsContentRequired()
 * is on (prod/staging), in which case the same conditions throw and fail the
 * build instead of silently shipping an empty site.
 */
export async function loadAstraeusDocuments(docType: string): Promise<RawAstraeusDoc[]> {
  const required = isCmsContentRequired();
  const apiKey = getApiKey();
  if (!apiKey) {
    if (required) {
      throw new Error(
        `Astraeus loader: ASTRAEUS_API_KEY is unset while REQUIRE_CMS_CONTENT is on — refusing to build ${docType} with no CMS access.`,
      );
    }
    console.warn(`⚠️ ASTRAEUS_API_KEY is not set — skipping loader for ${docType}`);
    return [];
  }

  const baseUrl = getBaseUrl();
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  };

  const all: RawAstraeusDoc[] = [];
  let offset = 0;

  try {
    while (true) {
      const url = `${baseUrl}/api/documents?type=${docType}&published=true&limit=${PAGE_SIZE}&offset=${offset}`;
      const response = await fetch(url, { headers });

      if (!response.ok) {
        if (required) {
          throw new Error(
            `Astraeus loader: ${docType} request failed (${response.status} ${response.statusText}).`,
          );
        }
        console.warn(
          `⚠️ Astraeus loader request failed for ${docType}: ${response.status} ${response.statusText}`,
        );
        return all; // return whatever we have so far
      }

      const data = await response.json();
      const page: RawAstraeusDoc[] = (data.documents || []).map(mapDoc);
      all.push(...page);

      const total: number = data.total ?? all.length;
      if (all.length >= total || page.length < PAGE_SIZE) break;
      offset += PAGE_SIZE;
    }

    console.log(`✅ Astraeus loader: fetched ${all.length} ${docType}`);

    // Tally documents across every collection in this build. The
    // astro:build:done guard reads this to fail the build when a healthy-looking
    // CMS returned nothing at all. globalThis survives Astro's separate module
    // contexts (config vs content loaders).
    const g = globalThis as { __cmsDocsLoaded?: number };
    g.__cmsDocsLoaded = (g.__cmsDocsLoaded ?? 0) + all.length;

    return all;
  } catch (error) {
    // Under the content-required guard, propagate any failure (network error,
    // the non-2xx throw above, JSON parse) so the build fails instead of
    // shipping partial or empty content.
    if (required) throw error;
    console.warn(`⚠️ Astraeus loader request failed for ${docType}:`, error);
    return all; // return whatever we have so far
  }
}
