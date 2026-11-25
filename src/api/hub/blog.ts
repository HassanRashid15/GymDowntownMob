import { apiRequest } from './client';

export type BlogPost = {
  id: string;
  title: string;
  excerpt: string;
  content?: string;
  author: string;
  authorAvatar?: string | null;
  publishedAt: string;
  imageUrl?: string | null;
  category: string;
  readTime?: string;
};

export async function listBlogPosts(limit = 20) {
  const data = await apiRequest<BlogPost[] | { posts?: BlogPost[]; articles?: BlogPost[] }>(
    'blog',
    'list',
    { query: { limit } }
  );
  if (Array.isArray(data)) return { posts: data.slice(0, limit) };
  return { posts: (data.posts || data.articles || []).slice(0, limit) };
}

export async function getBlogPost(id: string) {
  const data = await apiRequest<BlogPost | { post: BlogPost }>('blog', 'detail', {
    pathParams: { id },
  });
  if (data && typeof data === 'object' && 'post' in data) {
    return { post: data.post };
  }
  return { post: data as BlogPost };
}
