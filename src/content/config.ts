import { defineCollection, z } from 'astro:content';

// Define project schema based on current data structure
const projectSchema = z.object({
  id: z.string(),
  number: z.number(),
  type: z.string(),
  title: z.string(),
  description: z.string(),
  technologies: z.array(z.string()),
  impact: z.string(),
  url: z.string().optional(),
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
  tags: z.array(z.string()).optional(),
  dateAdded: z.date(),
  category: z.string().optional()
});

// Define blog schema for future use
const blogSchema = z.object({
  title: z.string(),
  description: z.string(),
  publishDate: z.date(),
  author: z.string().default('Joel Lithgow'),
  image: z.object({
    src: z.string(),
    alt: z.string()
  }).optional(),
  tags: z.array(z.string()).optional(),
  draft: z.boolean().default(false),
  featured: z.boolean().default(false),
  category: z.string().optional(),
  readingTime: z.number().optional(),
  // Link collection support
  links: z.array(linkSchema).optional()
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
    alt: z.string(),
    caption: z.string(),
    type: z.enum(['main', 'detail', 'process', 'context']).default('main')
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