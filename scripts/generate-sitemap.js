import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://suhird.me';

const staticPages = [
  { loc: '/', priority: '1.0', changefreq: 'weekly' },
  { loc: '/tech-blog/', priority: '0.9', changefreq: 'daily' },
  { loc: '/beyond-code/', priority: '0.9', changefreq: 'weekly' },
  { loc: '/series/', priority: '0.9', changefreq: 'weekly' },
  { loc: '/projects/', priority: '0.8', changefreq: 'weekly' },
  { loc: '/about/', priority: '0.7', changefreq: 'monthly' },
  { loc: '/contact/', priority: '0.7', changefreq: 'monthly' },
];

function extractField(content, field) {
  const regex = new RegExp(`${field}:\\s*"([^"]+)"`);
  const m = content.match(regex);
  return m ? m[1] : '';
}

function getBlogPostMeta(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return {
    slug: extractField(content, 'slug'),
    date: extractField(content, 'date'),
  };
}

function generateSitemap() {
  const blogPostsDir = path.join(__dirname, '../src/data/posts');
  const blogPostFiles = fs.readdirSync(blogPostsDir).filter(f => f.endsWith('.ts'));

  const blogUrls = blogPostFiles.map(file => {
    const meta = getBlogPostMeta(path.join(blogPostsDir, file));
    if (!meta.slug) {
      console.warn(`Warning: no slug found in ${file}, skipping`);
      return null;
    }
    return {
      loc: `/blog/${meta.slug}/`,
      lastmod: meta.date ? meta.date.split('T')[0] : new Date().toISOString().split('T')[0],
      priority: '0.8',
    };
  }).filter(Boolean);

  const today = new Date().toISOString().split('T')[0];
  const allUrls = [...staticPages.map(p => ({ ...p, lastmod: today })), ...blogUrls];

  const urlset = allUrls.map(url => {
    const loc = `    <loc>${BASE_URL}${url.loc}</loc>`;
    const lastmod = url.lastmod ? `\n    <lastmod>${url.lastmod}</lastmod>` : '';
    const priority = url.priority ? `\n    <priority>${url.priority}</priority>` : '';
    const changefreq = url.changefreq ? `\n    <changefreq>${url.changefreq}</changefreq>` : '';
    return `  <url>${loc}${lastmod}${priority}${changefreq}\n  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlset}\n</urlset>`;
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
