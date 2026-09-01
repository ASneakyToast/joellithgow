/**
 * Static resume content for the /work landing.
 *
 * Identity, curated skill groups, and education are static and rarely change,
 * so they live here as typed constants (same convention as
 * features/themes/theme-definitions.ts) rather than in the CMS. Experience and
 * projects stay CMS-backed — see fetchExperience()/fetchProjects() in @lib/astraeus.
 */

export interface ResumeIdentity {
  email: string;
  emailHref: string;
  name: string;
  summary: string;
  tagline: string;
  title: string;
}

export interface SkillGroup {
  label: string;
  skills: string[];
}

export interface Education {
  degree: string;
  school: string;
  year: string;
}

export const identity: ResumeIdentity = {
  name: 'Joel Lithgow',
  title: 'Creative Technologist',
  tagline:
    'A designer who codes and an artist who ships — I help people think visually.',
  summary:
    'As a forward deployed engineer at an AI startup I build document-extraction pipelines and client demos end to end. Previously I was the primary designer and developer behind cca.edu, where I led an accessibility overhaul across its digital and print properties. Off the clock I run @thisisahousegallery, a gallery out of my living room.',
  email: 'joellithgow@icloud.com',
  emailHref: 'mailto:joellithgow@icloud.com',
};

/**
 * Curated skills grouped for the sidebar rail. Order within a group is
 * intentional (mirrors the resume), not alphabetical. These are display labels,
 * NOT project tags — do not link them to /work/skills/[skill].
 */
export const skillGroups: SkillGroup[] = [
  { label: 'Languages', skills: ['TypeScript / JavaScript', 'Python / FastAPI'] },
  {
    label: 'AI & Agents',
    skills: ['Agentic Orchestration', 'RAG & hybrid retrieval', 'LLM eval & observability'],
  },
  { label: 'Frontend', skills: ['Vue / Astro', 'WebGL / Three.js'] },
  { label: 'Data & Infra', skills: ['SQLite / PostgreSQL', 'Docker / GCP & AWS'] },
  { label: 'Quality & Accessibility', skills: ['Playwright / QA', 'WCAG 2.1 AA'] },
  { label: 'Tools', skills: ['Git', 'Figma', 'Adobe Creative Cloud'] },
  { label: 'Practice', skills: ['Web Design', 'Marketing', 'Strategy'] },
];

export const education: Education = {
  degree: 'BFA, Fine Arts',
  school: 'California College of the Arts',
  year: '2022',
};
