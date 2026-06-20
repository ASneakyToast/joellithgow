import { defineCollection, z } from 'astro:content';
import { loadAstraeusDocuments } from '../lib/astraeus-loader';

// ---------------------------------------------------------------------------
// Shared sub-schemas (mirror astraeus-types.ts interfaces)
// ---------------------------------------------------------------------------

const blogImageSchema = z.object({
  src: z.string(),
  alt: z.string(),
  type: z.enum(['image', 'video']).optional(),
  fallbackSrc: z.string().optional(),
  poster: z.string().optional(),
  link: z.string().optional(),
});

const linkItemSchema = z.object({
  url: z.string(),
  title: z.string(),
  description: z.string().optional(),
  /** TODO: legacy null in pre-ADR-016 data — remove .nullable() after reseed */
  author: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  /** TODO: make required after reseed — some legacy link items are missing this */
  date_added: z.string().optional(),
  /** TODO: legacy null in pre-ADR-016 data — remove .nullable() after reseed */
  collections: z.array(z.string()).nullable().optional(),
});

const heroMediaSchema = z.object({
  src: z.string(),
  alt: z.string(),
  type: z.enum(['image', 'video']),
  fallbackSrc: z.string().optional(),
  poster: z.string().optional(),
  caption: z.string().optional(),
});

const liveLinkSchema = z.object({
  title: z.string(),
  url: z.string(),
  description: z.string().optional(),
});

const liveLinksSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  links: z.array(z.object({ title: z.string(), url: z.string() })),
});

const bodyBlockSchema = z.object({
  block_type: z.string(),
}).catchall(z.unknown());

// ---------------------------------------------------------------------------
// Blog post schema
// ---------------------------------------------------------------------------

const blogPostSchema = z.object({
  // slug is a CMS system field — exposed as the Astro entry id, not in body
  title: z.string(),
  description: z.string(),
  /** ISO 8601 — wrap with new Date() at use site */
  publish_date: z.string(),
  post_type: z.enum(['article', 'thought', 'collection']),
  /** TODO: legacy nulls in pre-ADR-016 data — remove .nullable() after reseed */
  body_markdown: z.string().nullable().optional(),
  excerpt: z.string().nullable().optional(),
  author: z.string().nullable().optional(),
  image: blogImageSchema.nullable().optional(),
  links: z.array(linkItemSchema).nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
  draft: z.boolean().optional(),
  featured: z.boolean().optional(),
  has_detail_page: z.boolean().optional(),
  /** null = reading time explicitly unset; absent = not calculated */
  reading_time: z.number().nullable().optional(),
  // CMS metadata
  _id: z.string(),
  _published: z.boolean().optional(),
  _created_at: z.string().optional(),
  _updated_at: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Project page schema
// ---------------------------------------------------------------------------

const projectPageSchema = z.object({
  // slug is a CMS system field — exposed as the Astro entry id, not in body
  number: z.number(),
  project_type: z.string(),
  title: z.string(),
  description: z.string(),
  impact: z.string().optional(),
  technologies: z.array(z.string()).optional(),
  subtitle: z.string().optional(),
  overview: z.string().optional(),
  /** TODO: legacy null in pre-ADR-016 data — remove .nullable() after reseed */
  hero_media: heroMediaSchema.nullable().optional(),
  duration: z.string().optional(),
  team: z.string().optional(),
  role: z.string().optional(),
  tools: z.string().optional(),
  /** TODO: legacy null in pre-ADR-016 data — remove .nullable() after reseed */
  live_link: liveLinkSchema.nullable().optional(),
  /** TODO: legacy null in pre-ADR-016 data — remove .nullable() after reseed */
  live_links: liveLinksSchema.nullable().optional(),
  /** TODO: legacy null in pre-ADR-016 data — remove .nullable() after reseed */
  publish_date: z.string().nullable().optional(),
  draft: z.boolean().optional(),
  featured: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  body_blocks: z.array(bodyBlockSchema).optional(),
  // CMS metadata
  _id: z.string(),
  _published: z.boolean().optional(),
  _created_at: z.string().optional(),
  _updated_at: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Experience entry schema
// ---------------------------------------------------------------------------

const experienceEntrySchema = z.object({
  // slug is a CMS system field — exposed as the Astro entry id, not in body
  company: z.string(),
  title: z.string(),
  location: z.string().optional(),
  /** Format: "2017" or "2017-03" */
  start_date: z.string(),
  /** Format: "2017" or "2017-03" — null means current role (intentional), absent means unknown */
  end_date: z.string().nullable().optional(),
  employment_type: z.enum(['full-time', 'part-time', 'contract', 'student', 'internship']),
  /** TODO: fill in descriptions during next reseed — currently null in legacy data */
  description: z.string().nullable().optional(),
  responsibilities: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  show_on_resume: z.boolean().optional(),
  order: z.number().optional(),
  // CMS metadata
  _id: z.string(),
  _published: z.boolean().optional(),
  _created_at: z.string().optional(),
  _updated_at: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Interview round types for applications collection (unchanged)
// ---------------------------------------------------------------------------

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

const applicationStatusEnum = z.enum([
  'draft',
  'preparing',
  'applied',
  'interviewing',
  'offered',
  'rejected',
  'withdrawn',
  'ghosted'
]);

const statusEventSchema = z.object({
  status: applicationStatusEnum,
  date: z.date(),
  round: interviewRoundSchema.optional(),
  notes: z.string().optional(),
});

const applicationSchema = z.object({
  company: z.string(),
  position: z.string(),
  location: z.string(),
  salary: z.string().optional(),
  jobUrl: z.string().url(),
  status: applicationStatusEnum.default('draft'),
  statusHistory: z.array(statusEventSchema).default([]),
  appliedDate: z.date().optional(),
  deadline: z.date().optional(),
  coverLetterDate: z.date().optional(),
  coverLetter: z.object({
    opening: z.string().optional(),
    paragraphs: z.array(z.string()).optional(),
    closing: z.string().optional(),
  }).optional(),
  resume: z.object({
    summary: z.string().optional(),
    skills: z.object({
      frontend: z.string().optional(),
      testing: z.string().optional(),
      cloud: z.string().optional(),
      tools: z.string().optional(),
      accessibility: z.string().optional(),
      learning: z.string().optional(),
      creative: z.string().optional(),
      ai: z.string().optional(),
    }).optional(),
  }).optional(),
  featured: z.boolean().default(false),
  public: z.boolean().default(true),
  fit: z.enum(['very-strong', 'strong', 'moderate', 'stretch']).optional(),
  description: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Collection definitions
// ---------------------------------------------------------------------------

export const collections = {
  // ── Local MDX (unchanged) ────────────────────────────────────────────────
  applications: defineCollection({
    type: 'content',
    schema: applicationSchema,
  }),

  // ── Astraeus CMS — blog posts ─────────────────────────────────────────────
  blog: defineCollection({
    loader: async () => {
      const docs = await loadAstraeusDocuments('blog_post');
      return docs.map((d) => ({
        id: d.slug,
        ...(d.body as Record<string, unknown>),
        _id: d.id,
        _published: d.published,
        _created_at: d.created_at,
        _updated_at: d.updated_at,
      }));
    },
    schema: blogPostSchema,
  }),

  // ── Astraeus CMS — project pages ─────────────────────────────────────────
  projects: defineCollection({
    loader: async () => {
      const docs = await loadAstraeusDocuments('project_page');
      return docs.map((d) => ({
        id: d.slug,
        ...(d.body as Record<string, unknown>),
        _id: d.id,
        _published: d.published,
        _created_at: d.created_at,
        _updated_at: d.updated_at,
      }));
    },
    schema: projectPageSchema,
  }),

  // ── Astraeus CMS — experience entries ────────────────────────────────────
  experience: defineCollection({
    loader: async () => {
      const docs = await loadAstraeusDocuments('experience_entry');
      return docs.map((d) => ({
        id: d.slug,
        ...(d.body as Record<string, unknown>),
        _id: d.id,
        _published: d.published,
        _created_at: d.created_at,
        _updated_at: d.updated_at,
      }));
    },
    schema: experienceEntrySchema,
  }),
};

// ---------------------------------------------------------------------------
// Re-exported types (kept for backward compat; prefer z.infer<> at use sites)
// ---------------------------------------------------------------------------

export type Application = z.infer<typeof applicationSchema>;
export type InterviewRound = z.infer<typeof interviewRoundSchema>;
export type StatusEvent = z.infer<typeof statusEventSchema>;
export type BlogPost = z.infer<typeof blogPostSchema>;
export type ProjectPage = z.infer<typeof projectPageSchema>;
export type ExperienceEntry = z.infer<typeof experienceEntrySchema>;
