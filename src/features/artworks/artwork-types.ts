// Artwork type definitions
export interface APIArtwork {
  id: number;
  title: string;
  title_plain: string;
  artists: Array<{ id: number; name: string }>;
  description: string;
  materials_list: string[];
  size: string;
  date: string | null;
  primary_image?: {
    id: number;
    title: string;
    alt: string;
    credit: string;
    description: string;
    width: number;
    height: number;
    file_size: number;
    original_url: string;
  };
  images?: Array<{
    id: number;
    image: {
      id: number;
      title: string;
      alt: string;
      credit: string;
      description: string;
      width: number;
      height: number;
      file_size: number;
      original_url: string;
    };
    caption: string;
    sort_order: number;
  }>;
  artifacts?: Array<{
    type: string;
    id: string;
    image?: {
      id: number;
      title: string;
      alt: string;
      credit: string;
      description: string;
      width: number;
      height: number;
      file_size: number;
      original_url: string;
    };
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