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

/**
 * Social preview image for a post. Every post gets a generated card at
 * /og/<slug>.jpg (see scripts/generate-og-images.js), so crawlers and the
 * client always reference the exact same file.
 */
export function getPostSocialImage(post: Pick<BlogPost, "slug">): string {
  return `https://suhird.me/og/${post.slug}.jpg`;
}
