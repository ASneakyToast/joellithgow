import type { AstraeusDocument, BlogPost, ProjectPage, ExperienceEntry } from './astraeus-types';

/**
 * Simple in-memory cache for Astraeus API responses
 * Only active during build time - no cache in production
 */
interface CacheEntry<T> {
  data: T[];
  timestamp: number;
}

const cache = new Map<string, CacheEntry<AstraeusDocument<unknown>>>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getBaseUrl(): string {
  try {
    return import.meta.env.ASTRAEUS_URL || process.env.ASTRAEUS_URL || 'http://localhost:8000';
  } catch {
    return process.env.ASTRAEUS_URL || 'http://localhost:8000';
  }
}

function getApiKey(): string | undefined {
  try {
    return import.meta.env.ASTRAEUS_API_KEY || process.env.ASTRAEUS_API_KEY;
  } catch {
    return process.env.ASTRAEUS_API_KEY;
  }
}

/**
 * Fetch a list of documents from the Astraeus API with caching
 */
async function fetchDocuments<T>(docType: string, extraParams: string = ''): Promise<AstraeusDocument<T>[]> {
  const cacheKey = `${docType}${extraParams}`;
  const cached = cache.get(cacheKey);

  if (cached) {
    const age = Date.now() - cached.timestamp;
    if (age < CACHE_TTL) {
      console.log(`✨ Using cached ${docType} (${Math.round(age / 1000)}s old)`);
      return cached.data as AstraeusDocument<T>[];
    }
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn(`⚠️ ASTRAEUS_API_KEY is not set — skipping fetch for ${docType}`);
    return [];
  }

  const baseUrl = getBaseUrl();

  try {
    const url = `${baseUrl}/api/documents?type=${docType}&published=true&limit=100${extraParams}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      console.warn(`⚠️ Astraeus API request failed: ${response.status} ${response.statusText}`);
      return (cached?.data as AstraeusDocument<T>[]) || [];
    }

    const data = await response.json();
    const raw: Array<{ id: string; doc_type: string; body: T; published: boolean; created_at: string; updated_at: string }> =
      data.documents || [];

    const documents: AstraeusDocument<T>[] = raw.map((d) => ({
      ...d.body,
      _id: d.id,
      _doc_type: d.doc_type,
      _published: d.published,
      _created_at: d.created_at,
      _updated_at: d.updated_at,
    }));

    // Update cache
    cache.set(cacheKey, { data: documents as AstraeusDocument<unknown>[], timestamp: Date.now() });

    console.log(`✅ Fetched ${documents.length} ${docType} from Astraeus`);
    return documents;
  } catch (error) {
    console.warn(`⚠️ Astraeus API request failed for ${docType}:`, error);
    return (cached?.data as AstraeusDocument<T>[]) || [];
  }
}

/**
 * Fetch a single document by slug from the Astraeus API
 */
async function fetchDocumentBySlug<T>(docType: string, slug: string): Promise<AstraeusDocument<T> | null> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn(`⚠️ ASTRAEUS_API_KEY is not set — skipping fetch for ${docType}/${slug}`);
    return null;
  }

  const baseUrl = getBaseUrl();

  try {
    const url = `${baseUrl}/api/documents?type=${docType}&filter[slug]=${encodeURIComponent(slug)}&published=true`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      console.warn(`⚠️ Astraeus API request failed: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    const raw: Array<{ id: string; doc_type: string; body: T; published: boolean; created_at: string; updated_at: string }> =
      data.documents || [];

    if (raw.length === 0) {
      return null;
    }

    const d = raw[0];
    return {
      ...d.body,
      _id: d.id,
      _doc_type: d.doc_type,
      _published: d.published,
      _created_at: d.created_at,
      _updated_at: d.updated_at,
    };
  } catch (error) {
    console.warn(`⚠️ Astraeus API request failed for ${docType}/${slug}:`, error);
    return null;
  }
}

/**
 * Fetch all published blog posts, sorted by publish_date descending
 */
export async function fetchBlogPosts(): Promise<AstraeusDocument<BlogPost>[]> {
  const posts = await fetchDocuments<BlogPost>('blog_post');
  return posts.sort((a, b) => {
    const dateA = new Date(a.publish_date || '').getTime();
    const dateB = new Date(b.publish_date || '').getTime();
    return dateB - dateA;
  });
}

/**
 * Fetch a single blog post by slug
 */
export async function fetchBlogPost(slug: string): Promise<AstraeusDocument<BlogPost> | null> {
  return fetchDocumentBySlug<BlogPost>('blog_post', slug);
}

/**
 * Fetch all published non-draft project pages, sorted by number ascending
 */
export async function fetchProjects(): Promise<AstraeusDocument<ProjectPage>[]> {
  const projects = await fetchDocuments<ProjectPage>('project_page');
  return projects
    .filter((p) => !p.draft)
    .sort((a, b) => (a.number ?? 0) - (b.number ?? 0));
}

/**
 * Fetch a single project page by slug
 */
export async function fetchProject(slug: string): Promise<AstraeusDocument<ProjectPage> | null> {
  return fetchDocumentBySlug<ProjectPage>('project_page', slug);
}

/**
 * Fetch all published experience entries, sorted by start_date descending
 */
export async function fetchExperience(): Promise<AstraeusDocument<ExperienceEntry>[]> {
  const entries = await fetchDocuments<ExperienceEntry>('experience_entry');
  return entries.sort((a, b) => {
    const dateA = new Date(a.start_date || '').getTime();
    const dateB = new Date(b.start_date || '').getTime();
    return dateB - dateA;
  });
}

/**
 * Clear the Astraeus cache (useful for testing)
 */
export function clearAstraeusCache(): void {
  cache.clear();
}
