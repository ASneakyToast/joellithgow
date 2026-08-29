/**
 * Best-effort Open Graph image lookup for external links.
 *
 * Fetches a URL at build time and extracts its og:image (falling back to
 * twitter:image). Cached per-URL for the life of the process so the dev
 * server doesn't refetch on every request. Any failure (block, timeout,
 * non-HTML, missing tag) resolves to null — the caller just hides the thumb.
 */

const cache = new Map<string, string | null>();

const OG_PATTERNS = [
  /<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["']/i,
  /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image(?::secure_url)?["']/i,
  /<meta[^>]+name=["']twitter:image(?::src)?["'][^>]+content=["']([^"']+)["']/i,
];

export async function fetchOgImage(url: string): Promise<string | null> {
  if (!url.startsWith('http')) return null;
  if (cache.has(url)) return cache.get(url)!;

  let result: string | null = null;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: { 'user-agent': 'Mozilla/5.0 (compatible; joellithgow-link-preview/1.0)' },
    });
    clearTimeout(timeout);

    const contentType = res.headers.get('content-type') ?? '';
    if (res.ok && contentType.includes('text/html')) {
      const html = await res.text();
      for (const pattern of OG_PATTERNS) {
        const match = html.match(pattern);
        if (match?.[1]) {
          result = new URL(match[1], res.url || url).href;
          break;
        }
      }
    }
  } catch {
    // network error / timeout / abort — no preview available
  }

  cache.set(url, result);
  return result;
}
