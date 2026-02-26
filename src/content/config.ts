import { defineCollection, z } from 'astro:content';

// Define project schema for MDX-based case studies
// Content sections (challenge, approach, process, etc.) are now in MDX body, not frontmatter
const projectSchema = z.object({
  // Core identification
  id: z.string(),
  title: z.string(),
  description: z.string(), // Used for cards and SEO

  // Card/listing metadata (required for work index cards)
  number: z.number(),
  type: z.string(),
  technologies: z.array(z.string()).optional(),

  // NEW: Personal format fields
  dateRange: z.string().optional(), // e.g., "2024, March - April"
  intro: z.string().optional(), // 2-3 sentence personal description

  // LEGACY: Academic format fields (optional for backward compat)
  subtitle: z.string().optional(),
  overview: z.string().optional(),

  // Hero media
  heroMedia: z.object({
    src: z.string(),
    fallbackSrc: z.string().optional(),
    poster: z.string().optional(),
    alt: z.string(),
    type: z.enum(['image', 'video']).default('image')
  }).optional(),

  // Meta information (optional in new format)
  duration: z.string().optional(),
  team: z.string().optional(),
  role: z.string().optional(),
  tools: z.string().optional(),
  metadata: z.array(z.string()).optional(), // Flexible bullet points for sidebar

  // Live links (optional)
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

  // SEO and organization
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
    fallbackSrc: z.string().optional(),
    poster: z.string().optional(),
    alt: z.string(),
    /** Optional URL to link the hero image/video to. If not set, links to detail page for articles. */
    link: z.string().optional(),
    /** Media type - 'image' (default) or 'video' */
    type: z.enum(['image', 'video']).default('image')
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

// Interview round types for granular tracking
const interviewRoundSchema = z.enum([
  'phone-screen',
  'recruiter-call',
  'technical',
  'take-home',
  'onsite',
  'hiring-manager',
  'team-panel',
  'final',
  'other'
]);

// Application status values
const applicationStatusEnum = z.enum([
  'draft',
  'applied',
  'interviewing',
  'offered',
  'rejected',
  'withdrawn',
  'ghosted'
]);

// Status history entry - tracks each progression event
const statusEventSchema = z.object({
  status: applicationStatusEnum,
  date: z.date(),
  round: interviewRoundSchema.optional(),  // Only for 'interviewing' status
  notes: z.string().optional(),
});

// Define application schema for job applications
const applicationSchema = z.object({
  // Company and role info
  company: z.string(),
  position: z.string(),
  location: z.string(),
  salary: z.string().optional(),
  jobUrl: z.string().url(),

  // Application status tracking
  status: applicationStatusEnum.default('draft'),
  statusHistory: z.array(statusEventSchema).default([]),
  appliedDate: z.date().optional(),
  deadline: z.date().optional(),

  // Cover letter metadata
  coverLetterDate: z.date().optional(),

  // Cover letter content (array of paragraphs)
  coverLetter: z.object({
    opening: z.string().optional(),
    paragraphs: z.array(z.string()).optional(),
    closing: z.string().optional(),
  }).optional(),

  // Outreach messages for cold networking
  outreach: z.object({
    linkedin: z.object({
      message: z.string(),
    }).optional(),
    email: z.object({
      subject: z.string(),
      message: z.string(),
    }).optional(),
  }).optional(),

  // Resume customizations
  resume: z.object({
    summary: z.string().optional(),
    skills: z.object({
      frontend: z.string().optional(),
      backend: z.string().optional(),
      testing: z.string().optional(),
      cloud: z.string().optional(),
      tools: z.string().optional(),
      accessibility: z.string().optional(),
      learning: z.string().optional(),
      // Allow custom skill categories
      creative: z.string().optional(),
      ai: z.string().optional(),
    }).optional(),
    projects: z.array(z.object({
      name: z.string(),
      description: z.string(),
      link: z.string().optional(),
    })).optional(),
  }).optional(),

  // Display options
  public: z.boolean().default(true), // Can hide sensitive applications
  fit: z.enum(['very-strong', 'strong', 'moderate', 'stretch']).optional(),

  // SEO
  description: z.string().optional()
});

// Define experience schema for work history
const experienceSchema = z.object({
  // Job identification
  company: z.string(),
  title: z.string(),
  location: z.string().optional(),

  // Timeline
  startDate: z.string(), // Format: "2017" or "2017-03"
  endDate: z.string().optional(), // Optional = current job

  // Classification
  type: z.enum(['full-time', 'part-time', 'contract', 'student', 'internship']).default('full-time'),

  // Content
  description: z.string().optional(),
  responsibilities: z.array(z.string()).optional(),
  achievements: z.array(z.string()).optional(),

  // Display options
  featured: z.boolean().default(false), // Show on about page
  showOnResume: z.boolean().default(true),
  order: z.number().optional(), // Manual sort order within same company
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
    type: 'content',
    schema: projectSchema
  }),
  'blog': defineCollection({
    type: 'content',
    schema: blogSchema
  }),
  'applications': defineCollection({
    type: 'content',
    schema: applicationSchema
  }),
  'experience': defineCollection({
    type: 'content',
    schema: experienceSchema
  })
};

// Export types for use in components
export type Project = z.infer<typeof projectSchema>;
export type BlogPost = z.infer<typeof blogSchema>;
export type Artwork = z.infer<typeof artworkSchema>;
export type Application = z.infer<typeof applicationSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Link = z.infer<typeof linkSchema>;
export type InterviewRound = z.infer<typeof interviewRoundSchema>;
export type StatusEvent = z.infer<typeof statusEventSchema>;