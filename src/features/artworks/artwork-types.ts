// Artwork type definitions

/**
 * Image rendition with optimized WebP format
 */
export interface ImageRendition {
  url: string;
  width: number;
  height: number;
}

/**
 * Available image renditions from the API
 */
export interface ImageRenditions {
  thumbnail: ImageRendition;       // 400x400 square crop
  web_optimized: ImageRendition;   // 1200px wide
  high_quality: ImageRendition;    // 2400px max dimension
}

/**
 * Base image structure used across all image fields
 */
export interface APIImage {
  id: number;
  title: string;
  alt: string;
  credit: string;
  description: string;
  width: number;
  height: number;
  file_size: number;
  original_url: string;
  renditions: ImageRenditions;
}

export interface APIArtwork {
  id: number;
  title: string;
  title_plain: string;
  artists: Array<{ id: number; name: string }>;
  description: string;
  materials_list: string[];
  size: string;
  date: string | null;
  primary_image?: APIImage;
  images?: Array<{
    id: number;
    image: APIImage;
    caption: string;
    sort_order: number;
  }>;
  artifacts?: Array<{
    type: string;
    id: string;
    image?: APIImage;
    caption?: string;
    text?: string;
    document?: {
      title: string;
      description: string;
    };
  }>;
  metadata?: {
    created: string | null;
    has_multiple_artists: boolean;
    image_count: number;
  };
}