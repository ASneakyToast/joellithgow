// Public API for the artwork system
import type { Artwork } from '@content/config';
import { fetchAPIArtworks } from './artwork-api';
import { transformAPIArtwork } from './artwork-transforms';

export type { APIArtwork } from './artwork-types';
export { fetchAPIArtworks } from './artwork-api';
export { transformAPIArtwork } from './artwork-transforms';

/**
 * Get all artworks from API
 * Results are cached so repeated calls are fast
 */
export async function getAllArtworks(): Promise<Artwork[]> {
  // Get API artworks (cached after first call)
  const apiArtworks = await fetchAPIArtworks();
  const artworkData = apiArtworks.map(transformAPIArtwork);

  // Sort by creation date (newest first)
  return artworkData.sort((a, b) =>
    new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime()
  );
}

/**
 * Get a single artwork by ID
 * Note: This uses getAllArtworks() which is cached, so it's efficient
 * even when generating multiple pages
 */
export async function getArtworkById(id: string): Promise<Artwork | null> {
  const allArtworks = await getAllArtworks();
  return allArtworks.find(artwork => artwork.id === id) || null;
}