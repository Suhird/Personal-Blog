import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.resolve(__dirname, '../dist');
const POSTS_DIR = path.resolve(__dirname, '../src/data/posts');
const INDEX_HTML = path.join(DIST_DIR, 'index.html');

function extractPostMeta(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');

  const extract = (field) => {
    const regex = new RegExp(`${field}:\\s*"([^"]+)"`);
    const m = content.match(regex);
    return m ? m[1] : '';
  };

  const extractArray = (field) => {
    const regex = new RegExp(`${field}:\\s*\\[([^\\]]*)\\]`);
    const m = content.match(regex);
    if (!m) return [];
    return m[1]
      .split(',')
      .map(s => s.trim().replace(/^["']|["']$/g, ''))
      .filter(Boolean);
  };

  return {
    title: extract('title'),
    description: extract('description'),
    date: extract('date'),
    slug: extract('slug'),
    tags: extractArray('tags'),
    readTime: extract('readTime'),
  };
}

function buildSeoHtml(template, post) {
  const canonicalUrl = `https://suhird.me/blog/${post.slug}/`;
  const keywords = post.tags.join(', ');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      '@type': 'Person',
      name: 'Suhird Singh',
      url: 'https://suhird.me/',
    },
    url: canonicalUrl,
    keywords: keywords,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    publisher: {
      '@type': 'Person',
      name: 'Suhird Singh',
      url: 'https://suhird.me/',
    },
  };

  const metaBlock = `
    <title>${post.title} - Suhird's Blog</title>
    <meta name="description" content="${post.description}" />
    <meta name="keywords" content="${keywords}" />
    <meta name="author" content="Suhird Singh" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="${canonicalUrl}" />

    <!-- Open Graph -->
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:title" content="${post.title}" />
    <meta property="og:description" content="${post.description}" />
    <meta property="og:site_name" content="Suhird's Blog" />
    <meta property="article:published_time" content="${post.date}" />
    <meta property="article:author" content="Suhird Singh" />
    <meta property="article:tag" content="${post.tags.join('" />\n    <meta property="article:tag" content="')}" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${post.title}" />
    <meta name="twitter:description" content="${post.description}" />

    <!-- JSON-LD -->
    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
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
  const postFiles = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.ts'));

  // Generate SEO HTML for each blog post
  postFiles.forEach(file => {
    const post = extractPostMeta(path.join(POSTS_DIR, file));
    if (!post.slug) {
      console.warn(`Skipping ${file} — no slug found`);
      return;
    }

    const routeDir = path.join(DIST_DIR, 'blog', post.slug);
    if (!fs.existsSync(routeDir)) {
      fs.mkdirSync(routeDir, { recursive: true });
    }

    const seoHtml = buildSeoHtml(baseTemplate, post);
    const outPath = path.join(routeDir, 'index.html');
    fs.writeFileSync(outPath, seoHtml);
    console.log(`Generated SEO HTML: /blog/${post.slug}/index.html`);
  });

  // Copy generic index.html for static pages (already done by generate-static-routes.js)
  // But ensure the root index.html has the sitemap link restored
  let rootHtml = fs.readFileSync(INDEX_HTML, 'utf-8');
  if (!rootHtml.includes('sitemap.xml')) {
    rootHtml = rootHtml.replace(
      '</head>',
      '    <link rel="sitemap" type="application/xml" href="https://suhird.me/sitemap.xml" />\n  </head>'
    );
    fs.writeFileSync(INDEX_HTML, rootHtml);
    console.log('Updated root index.html with sitemap link');
  }

  console.log('\nAll SEO-optimized static pages generated successfully.');
}

main();
