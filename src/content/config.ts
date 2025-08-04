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
  readingTime: z.number().optional()
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