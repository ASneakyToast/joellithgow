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
 * Returns an empty array on missing API key or network/HTTP errors.
 */
export async function loadAstraeusDocuments(docType: string): Promise<RawAstraeusDoc[]> {
  const apiKey = getApiKey();
  if (!apiKey) {
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
    return all;
  } catch (error) {
    console.warn(`⚠️ Astraeus loader request failed for ${docType}:`, error);
    return all; // return whatever we have so far
  }
}
