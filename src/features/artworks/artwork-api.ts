import type { APIArtwork } from './artwork-types';

/**
 * Fetch artworks from the housegallery API
 */
export async function fetchAPIArtworks(): Promise<APIArtwork[]> {
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
      return [];
    }

    const data = await response.json();
    console.log(`✅ Fetched ${data.results?.length || 0} artworks from API`);
    return data.results || [];
  } catch (error) {
    // Silently fail - likely API is not running during build
    return [];
  }
}