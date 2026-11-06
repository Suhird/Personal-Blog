import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const ROOT_DIR = path.resolve(__dirname, '../..');
export const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
export const POSTS_DIR = path.join(ROOT_DIR, 'src/data/posts');
export const CONTENT_DIR = path.join(ROOT_DIR, 'src/data/content');
export const DIST_DIR = path.join(ROOT_DIR, 'dist');

export const SITE_URL = 'https://suhird.me';
export const SITE_NAME = "Suhird's Blog";
export const AUTHOR_NAME = 'Suhird Singh';
export const OG_DEFAULT_PATH = '/og/default.png';
export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

/**
 * Pull a `field: "value"` (or `field: 'value'`) value out of a post file.
 */
export function extractField(content, field) {
  const regex = new RegExp(`^\\s*${field}:\\s*(["'])([^\\n]*?)\\1`, 'm');
  const match = content.match(regex);
  return match ? match[2] : '';
}

/**
 * Pull a `field: ["a", "b"]` array out of a post file.
 */
export function extractArray(content, field) {
  const regex = new RegExp(`^\\s*${field}:\\s*\\[([^\\]]*)\\]`, 'm');
  const match = content.match(regex);
  if (!match) return [];
  return match[1]
    .split(',')
    .map((entry) => entry.trim().replace(/^["']|["']$/g, ''))
    .filter(Boolean);
}

/**
 * Find the first markdown image that lives inside this repo.
 * Remote images are skipped so social cards never depend on a third party.
 */
export function firstLocalMarkdownImage(markdown) {
  const imageRegex = /!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  let match;
  while ((match = imageRegex.exec(markdown)) !== null) {
    const src = match[1];
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
      continue;
    }
    return src.startsWith('/') ? src : `/${src}`;
  }
  return '';
}

export function publicFileFor(publicPath) {
  return path.join(PUBLIC_DIR, publicPath.replace(/^\//, ''));
}

export function isLocalPublicAsset(publicPath) {
  return Boolean(publicPath) && !/^https?:\/\//.test(publicPath) && fs.existsSync(publicFileFor(publicPath));
}

export function postSection(post) {
  return post.category === 'life' ? 'beyond-code' : 'tech-blog';
}

export function postPath(post) {
  return `/${postSection(post)}/${post.slug}/`;
}

export function postUrl(post) {
  return `${SITE_URL}${postPath(post)}`;
}

/**
 * Resolve the artwork used for a post's social card.
 * Priority: explicit `image` field -> first local image in the markdown body.
 */
export function resolvePostImage(post) {
  if (post.image && isLocalPublicAsset(post.image)) {
    return post.image;
  }
  if (post.markdownFile) {
    const markdownPath = path.join(CONTENT_DIR, `${post.markdownFile}.md`);
    if (fs.existsSync(markdownPath)) {
      const candidate = firstLocalMarkdownImage(fs.readFileSync(markdownPath, 'utf-8'));
      if (isLocalPublicAsset(candidate)) {
        return candidate;
      }
    }
  }
  return '';
}

/**
 * Read every post module and return plain metadata plus resolved artwork.
 */
export function readPosts() {
  const files = fs.readdirSync(POSTS_DIR).filter((file) => file.endsWith('.ts'));

  return files
    .map((file) => {
      const content = fs.readFileSync(path.join(POSTS_DIR, file), 'utf-8');
      const post = {
        file,
        title: extractField(content, 'title'),
        description: extractField(content, 'description'),
        date: extractField(content, 'date'),
        slug: extractField(content, 'slug'),
        tags: extractArray(content, 'tags'),
        readTime: extractField(content, 'readTime'),
        category: extractField(content, 'category'),
        markdownFile: extractField(content, 'markdownFile'),
        image: extractField(content, 'image'),
      };
      post.heroImage = resolvePostImage(post);
      return post;
    })
    .filter((post) => post.slug);
}
