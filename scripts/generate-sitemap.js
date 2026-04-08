import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://suhird.me';

const staticPages = [
  { loc: '/', priority: '1.0', changefreq: 'weekly' },
  { loc: '/blog/', priority: '0.9', changefreq: 'daily' },
  { loc: '/series/', priority: '0.9', changefreq: 'weekly' },
  { loc: '/projects/', priority: '0.8', changefreq: 'weekly' },
  { loc: '/about/', priority: '0.7', changefreq: 'monthly' },
  { loc: '/contact/', priority: '0.7', changefreq: 'monthly' },
];

function getBlogPostLastmod(slug) {
  try {
    const postDir = path.join(__dirname, `../src/data/posts/${slug}.ts`);
    const content = fs.readFileSync(postDir, 'utf-8');
    const dateMatch = content.match(/date:\s*['"]([^'"]+)['"]/);
    if (dateMatch) {
      return dateMatch[1].split('T')[0];
    }
  } catch {
  }
  return new Date().toISOString().split('T')[0];
}

function generateSitemap() {
  const blogPostsDir = path.join(__dirname, '../src/data/posts');
  const blogPostFiles = fs.readdirSync(blogPostsDir).filter(f => f.endsWith('.ts'));

  const blogUrls = blogPostFiles.map(file => {
    const slug = file.replace('.ts', '');
    return {
      loc: `/blog/${slug}/`,
      lastmod: getBlogPostLastmod(slug),
      priority: '0.8',
    };
  });

  const today = new Date().toISOString().split('T')[0];
  const allUrls = [...staticPages.map(p => ({ ...p, lastmod: today })), ...blogUrls];

  const urlset = allUrls.map(url => {
    const loc = `    <loc>${BASE_URL}${url.loc}</loc>`;
    const lastmod = url.lastmod ? `\n    <lastmod>${url.lastmod}</lastmod>` : '';
    const priority = url.priority ? `\n    <priority>${url.priority}</priority>` : '';
    const changefreq = url.changefreq ? `\n    <changefreq>${url.changefreq}</changefreq>` : '';
    return `  <url>${loc}${lastmod}${priority}${changefreq}\n  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlset}
</urlset>`;
}

const sitemap = generateSitemap();
const publicDir = path.join(__dirname, '../public');
const distDir = path.join(__dirname, '../dist');

const sitemapPath = path.join(publicDir, 'sitemap.xml');
fs.writeFileSync(sitemapPath, sitemap);
console.log(`Generated sitemap.xml with ${staticPages.length} static pages + blog posts`);

if (fs.existsSync(distDir)) {
  const distSitemapPath = path.join(distDir, 'sitemap.xml');
  fs.writeFileSync(distSitemapPath, sitemap);
  console.log(`Copied sitemap.xml to dist/`);
}