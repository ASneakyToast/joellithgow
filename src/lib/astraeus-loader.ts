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
  doc_type: string;
  body: Record<string, unknown>;
  published: boolean;
  created_at: string;
  updated_at: string;
}

function getBaseUrl(): string {
  // import.meta.env is not available in this context (plain Node.js module),
  // so we read exclusively from process.env.
  return process.env.ASTRAEUS_URL || 'http://localhost:8000';
}

function getApiKey(): string | undefined {
  return process.env.ASTRAEUS_API_KEY;
}

/**
 * Fetch all published documents of `docType` from the Astraeus API.
 * Returns an empty array on missing API key or network/HTTP errors.
 */
export async function loadAstraeusDocuments(docType: string): Promise<RawAstraeusDoc[]> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn(`⚠️ ASTRAEUS_API_KEY is not set — skipping loader for ${docType}`);
    return [];
  }

  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/documents?type=${docType}&published=true&limit=100`;

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      console.warn(
        `⚠️ Astraeus loader request failed for ${docType}: ${response.status} ${response.statusText}`,
      );
      return [];
    }

    const data = await response.json();
    const raw: RawAstraeusDoc[] = (data.documents || []).map(
      (d: { id: string; doc_type: string; body: Record<string, unknown>; published: boolean; created_at: string; updated_at: string }) => ({
        id: d.id,
        doc_type: d.doc_type,
        body: d.body,
        published: d.published,
        created_at: d.created_at,
        updated_at: d.updated_at,
      }),
    );

    console.log(`✅ Astraeus loader: fetched ${raw.length} ${docType}`);
    return raw;
  } catch (error) {
    console.warn(`⚠️ Astraeus loader request failed for ${docType}:`, error);
    return [];
  }
}
