import { defineCollection, z } from 'astro:content';

// Define project schema based on current data structure
const projectSchema = z.object({
  id: z.string(),
  number: z.number(),
  type: z.string(),
  title: z.string(),
  description: z.string(),
  impact: z.string(),
  url: z.string().optional(),
  technologies: z.array(z.string()).optional(),
  images: z.array(z.object({
    src: z.string(),
    alt: z.string(),
    caption: z.string(),
    type: z.enum(['image', 'video']).optional()
  })),
  // Extended modal data
  subtitle: z.string(),
  overview: z.string(),
  duration: z.string(),
  team: z.string(),
  role: z.string(),
  tools: z.string(),
  problem: z.string(),
  solution: z.string(),
  process: z.array(z.object({
    title: z.string(),
    description: z.string()
  })).optional(),
  insights: z.array(z.string()),
  metrics: z.array(z.object({
    number: z.string(),
    label: z.string()
  })),
  liveLink: z.object({
    title: z.string(),
    url: z.string(),
    description: z.string()
  }).optional(),
  liveLinks: z.object({
    title: z.string(),
    description: z.string(),
    links: z.array(z.object({
      title: z.string(),
      url: z.string()
    }))
  }).optional(),
  // SEO and metadata
  publishDate: z.date().optional(),
  draft: z.boolean().default(false),
  featured: z.boolean().default(false),
  tags: z.array(z.string()).optional()
});

// Define schema for individual links within link collections
const linkSchema = z.object({
  url: z.string().url(),
  title: z.string(),
  description: z.string(),
  author: z.string().optional(), // Blogger/creator name
  tags: z.array(z.string()).optional(),
  dateAdded: z.date(),
  collections: z.array(z.string()).optional() // Which collection slugs this link should appear in
});

// Define blog schema for future use
const blogSchema = z.object({
  title: z.string(),
  description: z.string(),
  excerpt: z.string().optional(),
  publishDate: z.date(),
  author: z.string().default('Joel Lithgow'),
  image: z.object({
    src: z.string(),
    alt: z.string()
  }).optional(),
  tags: z.array(z.string()).optional(),
  draft: z.boolean().default(false),
  featured: z.boolean().default(false),
  readingTime: z.number().optional(),
  /**
   * Content type classification
   * - 'article': Full-length post with detail page (default)
   * - 'thought': Short-form post displayed inline without detail page
   * - 'collection': Curated links with commentary and dedicated detail page
   */
  type: z.enum(['article', 'thought', 'collection']).default('article'),
  // Link collection support
  links: z.array(linkSchema).optional(),
  /**
   * Controls navigation behavior
   * - true: Post has dedicated detail page at /blog/[slug]
   * - false: Post content displayed fully inline on blog index
   *
   * When not explicitly set, automatically derived from type:
   * - 'article' → true
   * - 'thought' → false
   * - 'collection' → true
   */
  hasDetailPage: z.boolean().optional(),
  // Legacy category field (deprecated in favor of type)
  category: z.string().optional()
}).transform((data) => {
  // Auto-derive hasDetailPage from type if not explicitly set
  if (data.hasDetailPage === undefined) {
    data.hasDetailPage = data.type === 'article' || data.type === 'collection';
  }
  return data;
});

// Define artwork schema for fine art portfolio
const artworkSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  projectTitle: z.string(),
  projectDescription: z.string(),
  creationDate: z.string().transform((str) => new Date(str)),
  medium: z.string(),
  dimensions: z.string().optional(),
  images: z.array(z.object({
    src: z.string(),
    srcThumbnail: z.string().optional(),
    srcLarge: z.string().optional(),
    alt: z.string(),
    caption: z.string(),
    type: z.enum(['main', 'detail', 'process', 'context']).default('main'),
    width: z.number().optional(),
    height: z.number().optional()
  })),
  // Artistic details
  materials: z.array(z.string()).optional(),
  techniques: z.array(z.string()).optional(),
  series: z.string().optional(),
  collaborators: z.array(z.string()).optional(),
  // Rich content
  artistStatement: z.string().optional(),
  processNotes: z.string().optional(),
  inspiration: z.string().optional(),
  technicalNotes: z.string().optional(),
  // Organization and metadata
  featured: z.boolean().default(false),
  draft: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
  category: z.enum(['printmedia', 'sculpture', 'exhibition', 'collaborative', 'mixed-media']).optional(),
  // Exhibition/context
  exhibitions: z.array(z.object({
    name: z.string(),
    location: z.string(),
    date: z.string(),
    type: z.enum(['solo', 'group', 'online']).optional()
  })).optional()
});

// Define collections
export const collections = {
  'projects': defineCollection({
    type: 'data',
    schema: projectSchema
  }),
  'blog': defineCollection({
    type: 'content',
    schema: blogSchema
  })
};

// Export types for use in components
export type Project = z.infer<typeof projectSchema>;
export type BlogPost = z.infer<typeof blogSchema>;
export type Artwork = z.infer<typeof artworkSchema>;
export type Link = z.infer<typeof linkSchema>;