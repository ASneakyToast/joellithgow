import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const blog = await getCollection('blog', ({ data }) => {
    return !data.draft;
  });

  // Sort by publish date (newest first)
  const sortedPosts = blog.sort(
    (a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf()
  );

  return rss({
    title: "Joel Lithgow's Blog",
    description:
      'Reflections on web development, AI tools, creative projects, and lessons learned along the way.',
    site: context.site || 'https://joellithgow.com',
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.publishDate,
      author: post.data.author,
      categories: post.data.tags || [],
      link: `/blog/${post.slug}/`,
    })),
    customData: `<language>en-us</language>`,
    stylesheet: '/rss-styles.xsl',
  });
}
