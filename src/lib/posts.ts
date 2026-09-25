import type { MarkdownInstance } from 'astro';
export type PostMeta = {
  title: string;
  metaTitle?: string;
  description: string;
  date: string;
  draft?: boolean;
  platform?: 'HTB' | 'THM';
  tags?: string[];
};
const sources = {
  writeups: import.meta.glob<MarkdownInstance<PostMeta>>(
    '../content/writeups/*.md',
    { eager: true },
  ),
  articles: import.meta.glob<MarkdownInstance<PostMeta>>(
    '../content/articles/*.md',
    { eager: true },
  ),
};
export function postsFor(section: keyof typeof sources) {
  return Object.entries(sources[section])
    .flatMap(([file, post]) => {
      const meta = post.frontmatter;
      if (meta.draft !== false) return [];
      const slug = file.split('/').pop()!.replace(/\.md$/, '');
      if (
        !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ||
        !meta.title ||
        !meta.description ||
        !/^\d{4}-\d{2}-\d{2}$/.test(String(meta.date)) ||
        Number.isNaN(Date.parse(meta.date))
      )
        throw new Error(`Invalid post metadata: ${file}`);
      if (
        section === 'writeups' &&
        !['HTB', 'THM'].includes(meta.platform ?? '')
      )
        throw new Error(`Writeup needs HTB or THM platform: ${file}`);
      return [{ ...post, slug, section }];
    })
    .sort((a, b) =>
      String(b.frontmatter.date).localeCompare(String(a.frontmatter.date)),
    );
}
export function formatDate(date: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(date));
}
