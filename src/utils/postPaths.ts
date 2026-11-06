import type { BlogPost } from "@/components/BlogCard";

/**
 * Every post lives under the section it was published in:
 *   tech posts -> /tech-blog/<slug>/
 *   life posts -> /beyond-code/<slug>/
 *
 * Keeping the URL in one place stops the listing, detail page, canonical tags,
 * sitemap and legacy redirects from drifting apart.
 */
export function getPostPath(post: Pick<BlogPost, "slug" | "category">): string {
  const section = (post.category || "tech") === "life" ? "/beyond-code" : "/tech-blog";
  return `${section}/${post.slug}/`;
}

export function getPostCanonical(post: Pick<BlogPost, "slug" | "category">): string {
  return `https://suhird.me${getPostPath(post)}`;
}
