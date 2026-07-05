import rss from '@astrojs/rss';
import { fetchBlogPosts } from '../lib/astraeus';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await fetchBlogPosts();

  // Sort by publish date (newest first) — fetchBlogPosts already sorts but be explicit
  const sortedPosts = posts.sort(
    (a, b) => new Date(b.publish_date).valueOf() - new Date(a.publish_date).valueOf()
  );

  return rss({
    title: "Joel Lithgow's Blog",
    description:
      'Reflections on web development, AI tools, creative projects, and lessons learned along the way.',
    site: context.site || 'https://joellithgow.com',
    items: sortedPosts.map((post) => ({
      title: post.title,
      // description may be absent on new post types — fall back gracefully
      description: ('description' in post && (post as any).description) || post.title,
      pubDate: new Date(post.publish_date),
      // author only exists on BlogPost
      author: ('author' in post && (post as any).author) || undefined,
      categories: post.tags || [],
      link: `/blog/${post.slug}/`,
    })),
    customData: `<language>en-us</language>`,
    stylesheet: '/rss-styles.xsl',
  });
}
