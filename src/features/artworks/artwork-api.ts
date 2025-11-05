import type { APIArtwork } from './artwork-types';

/**
 * Simple in-memory cache for API responses
 * Only active during build time - no cache in production
 */
let artworksCache: APIArtwork[] | null = null;
let cacheTimestamp: number | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch artworks from the housegallery API with caching
 */
export async function fetchAPIArtworks(): Promise<APIArtwork[]> {
  // Check cache first
  if (artworksCache && cacheTimestamp) {
    const age = Date.now() - cacheTimestamp;
    if (age < CACHE_TTL) {
      console.log(`✨ Using cached artworks (${Math.round(age / 1000)}s old)`);
      return artworksCache;
    }
  }

  const apiUrl = import.meta.env.HOUSEGALLERY_API_URL || 'http://localhost:8000';
  const apiKey = import.meta.env.HOUSEGALLERY_API_KEY;

  if (!apiKey) {
    // Silently skip API fetch when key is not configured
    return [];
  }

  try {
    const response = await fetch(`${apiUrl}/api/v1/artworks/`, {
      headers: {
        'Content-Type': 'application/json',
        'API-Key': apiKey,
      },
    });

    if (!response.ok) {
      console.warn(`⚠️ API request failed: ${response.status} ${response.statusText}`);
      return artworksCache || []; // Return cached data if available
    }

    const data = await response.json();
    const artworks = data.results || [];

    // Update cache
    artworksCache = artworks;
    cacheTimestamp = Date.now();

    console.log(`✅ Fetched ${artworks.length} artworks from API`);
    return artworks;
  } catch (error) {
    console.warn('⚠️ API request failed:', error);
    // Return cached data if available, otherwise empty array
    return artworksCache || [];
  }
}

/**
 * Clear the artworks cache (useful for testing)
 */
export function clearArtworksCache(): void {
  artworksCache = null;
  cacheTimestamp = null;
}