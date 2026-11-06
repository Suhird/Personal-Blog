import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  AUTHOR_NAME,
  DIST_DIR,
  OG_DEFAULT_PATH,
  OG_HEIGHT,
  OG_WIDTH,
  SITE_NAME,
  SITE_URL,
  postPath,
  postSection,
  readPosts,
} from './lib/postMeta.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INDEX_HTML = path.join(DIST_DIR, 'index.html');
const OG_MANIFEST = path.join(DIST_DIR, 'og/manifest.json');

function escapeHtml(value = '') {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function loadOgManifest() {
  if (!fs.existsSync(OG_MANIFEST)) {
    console.warn('OG manifest not found — run scripts/generate-og-images.js first. Falling back to the default card.');
    return {};
  }
  return JSON.parse(fs.readFileSync(OG_MANIFEST, 'utf-8'));
}

function imageFor(manifest, post) {
  const entry = manifest[post.slug] || manifest.default || {
    path: OG_DEFAULT_PATH,
    width: OG_WIDTH,
    height: OG_HEIGHT,
    alt: `${SITE_NAME} — ${AUTHOR_NAME}`,
  };

  return {
    url: `${SITE_URL}${entry.path}`,
    width: entry.width || OG_WIDTH,
    height: entry.height || OG_HEIGHT,
    alt: entry.alt || post.title,
  };
}

function buildSeoHtml(template, post, image, legacy = false) {
  const canonicalUrl = `${SITE_URL}${postPath(post)}`;
  const canonicalPath = postPath(post);
  const keywords = post.tags.join(', ');
  const robots = legacy ? 'noindex, follow' : 'index, follow';
  const legacyRedirect = legacy
    ? `\n    <meta http-equiv="refresh" content="0; url=${canonicalPath}" />\n    <script>window.location.replace(${JSON.stringify(canonicalPath)} + window.location.search + window.location.hash);</script>`
    : '';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    image: [image.url],
    datePublished: post.date,
    dateModified: post.date,
    author: {
      '@type': 'Person',
      name: AUTHOR_NAME,
      url: `${SITE_URL}/`,
    },
    url: canonicalUrl,
    keywords: keywords,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    publisher: {
      '@type': 'Person',
      name: AUTHOR_NAME,
      url: `${SITE_URL}/`,
    },
  };

  const metaBlock = `
    <title>${escapeHtml(post.title)} - ${escapeHtml(SITE_NAME)}</title>
    <meta name="description" content="${escapeHtml(post.description)}" data-rh="true" />
    <meta name="keywords" content="${escapeHtml(keywords)}" data-rh="true" />
    <meta name="author" content="${escapeHtml(AUTHOR_NAME)}" data-rh="true" />
    <meta name="robots" content="${robots}" data-rh="true" />
    <link rel="canonical" href="${canonicalUrl}" data-rh="true" />${legacyRedirect}

    <!-- Open Graph -->
    <meta property="og:type" content="article" data-rh="true" />
    <meta property="og:url" content="${canonicalUrl}" data-rh="true" />
    <meta property="og:title" content="${escapeHtml(post.title)}" data-rh="true" />
    <meta property="og:description" content="${escapeHtml(post.description)}" data-rh="true" />
    <meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" data-rh="true" />
    <meta property="og:image" content="${image.url}" data-rh="true" />
    <meta property="og:image:type" content="image/jpeg" data-rh="true" />
    <meta property="og:image:width" content="${image.width}" data-rh="true" />
    <meta property="og:image:height" content="${image.height}" data-rh="true" />
    <meta property="og:image:alt" content="${escapeHtml(image.alt)}" data-rh="true" />
    <meta property="article:published_time" content="${post.date}" data-rh="true" />
    <meta property="article:author" content="${escapeHtml(AUTHOR_NAME)}" data-rh="true" />
    ${post.tags.map((tag) => `<meta property="article:tag" content="${escapeHtml(tag)}" data-rh="true" />`).join('\n    ')}

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" data-rh="true" />
    <meta name="twitter:title" content="${escapeHtml(post.title)}" data-rh="true" />
    <meta name="twitter:description" content="${escapeHtml(post.description)}" data-rh="true" />
    <meta name="twitter:image" content="${image.url}" data-rh="true" />
    <meta name="twitter:image:alt" content="${escapeHtml(image.alt)}" data-rh="true" />

    <!-- JSON-LD -->
    <script type="application/ld+json" data-rh="true">${JSON.stringify(jsonLd)}</script>
`;

  // Replace the generic <title> and meta tags in the template with our SEO block
  // We insert right after <head> and remove the old generic tags
  let html = template;

  // Remove old generic title/meta/description/og/twitter/canonical tags
  html = html.replace(/<title>.*?<\/title>/, '');
  html = html.replace(/<meta name="description"[^>]*>/, '');
  html = html.replace(/<meta name="keywords"[^>]*>/, '');
  html = html.replace(/<meta name="author"[^>]*>/, '');
  html = html.replace(/<meta name="robots"[^>]*>/, '');
  html = html.replace(/<meta property="og:[^"]*"[^>]*>/g, '');
  html = html.replace(/<meta name="twitter:[^"]*"[^>]*>/g, '');
  html = html.replace(/<link rel="canonical"[^>]*>/, '');
  html = html.replace(/<link rel="sitemap"[^>]*>/, '');

  // Insert our SEO block right after <head>
  html = html.replace('<head>', `<head>\n${metaBlock}`);

  return html;
}

function main() {
  if (!fs.existsSync(INDEX_HTML)) {
    console.error('Build output (dist/index.html) not found. Please run build first.');
    process.exit(1);
  }

  const baseTemplate = fs.readFileSync(INDEX_HTML, 'utf-8');
  const ogManifest = loadOgManifest();
  const posts = readPosts();

  // Generate SEO HTML for each blog post
  posts.forEach((post) => {
    if (!post.slug) {
      console.warn(`Skipping ${post.file} — no slug found`);
      return;
    }

    const section = postSection(post);
    const routeDir = path.join(DIST_DIR, section, post.slug);
    if (!fs.existsSync(routeDir)) {
      fs.mkdirSync(routeDir, { recursive: true });
    }

    const image = imageFor(ogManifest, post);
    const seoHtml = buildSeoHtml(baseTemplate, post, image);
    const outPath = path.join(routeDir, 'index.html');
    fs.writeFileSync(outPath, seoHtml);
    console.log(`Generated SEO HTML: /${section}/${post.slug}/index.html (og:image ${image.url})`);

    // Keep the old /blog/<slug>/ URL alive with a canonical + client-side redirect.
    const legacyDir = path.join(DIST_DIR, 'blog', post.slug);
    if (!fs.existsSync(legacyDir)) {
      fs.mkdirSync(legacyDir, { recursive: true });
    }
    fs.writeFileSync(path.join(legacyDir, 'index.html'), buildSeoHtml(baseTemplate, post, image, true));
    console.log(`Generated legacy redirect: /blog/${post.slug}/index.html -> /${section}/${post.slug}/`);
  });

  // Copy generic index.html for static pages (already done by generate-static-routes.js)
  // But ensure the root index.html has the sitemap link restored
  let rootHtml = fs.readFileSync(INDEX_HTML, 'utf-8');
  if (!rootHtml.includes('sitemap.xml')) {
    rootHtml = rootHtml.replace(
      '</head>',
      `    <link rel="sitemap" type="application/xml" href="${SITE_URL}/sitemap.xml" />\n  </head>`
    );
    fs.writeFileSync(INDEX_HTML, rootHtml);
    console.log('Updated root index.html with sitemap link');
  }

  console.log('\nAll SEO-optimized static pages generated successfully.');
}

main();
