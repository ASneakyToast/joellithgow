import { defineCollection, z } from 'astro:content';

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
  'preparing',
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

  // Resume customizations
  resume: z.object({
    summary: z.string().optional(),
    skills: z.object({
      frontend: z.string().optional(),
      testing: z.string().optional(),
      cloud: z.string().optional(),
      tools: z.string().optional(),
      accessibility: z.string().optional(),
      learning: z.string().optional(),
      // Allow custom skill categories
      creative: z.string().optional(),
      ai: z.string().optional(),
    }).optional(),
  }).optional(),

  // Display options
  featured: z.boolean().default(false),
  public: z.boolean().default(true), // Can hide sensitive applications
  fit: z.enum(['very-strong', 'strong', 'moderate', 'stretch']).optional(),

  // SEO
  description: z.string().optional()
});

// Define collections
export const collections = {
  'applications': defineCollection({
    type: 'content',
    schema: applicationSchema
  }),
};

// Export types for use in components
export type Application = z.infer<typeof applicationSchema>;
export type InterviewRound = z.infer<typeof interviewRoundSchema>;
export type StatusEvent = z.infer<typeof statusEventSchema>;
