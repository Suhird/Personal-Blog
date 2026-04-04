import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.resolve(__dirname, '../dist');
const SITEMAP_PATH = path.resolve(__dirname, '../public/sitemap.xml');

// 1. Read the Sitemap
if (!fs.existsSync(SITEMAP_PATH)) {
  console.error('Sitemap not found at ' + SITEMAP_PATH);
  process.exit(1);
}

const sitemapContent = fs.readFileSync(SITEMAP_PATH, 'utf-8');

// 2. Extract all URLs from sitemap
// Basic regex to find <loc> contents
const urlRegex = /<loc>(.*?)<\/loc>/g;
let urls = [];
let match;
while ((match = urlRegex.exec(sitemapContent)) !== null) {
  const url = match[1];
  // Extract path from URL (e.g., https://suhird.me/about -> /about)
  const pathname = new URL(url).pathname;
  if (pathname !== '/') {
    urls.push(pathname);
  }
}

console.log(`Found ${urls.length} routes to generate static pages for.`);

// 3. For each URL, create a directory and copy index.html
const INDEX_HTML = path.join(DIST_DIR, 'index.html');
if (!fs.existsSync(INDEX_HTML)) {
  console.error('Build output (dist/index.html) not found. Please run build first.');
  process.exit(1);
}

urls.forEach(route => {
  const routeDir = path.join(DIST_DIR, route);
  
  // Create the directory (e.g., dist/about/)
  if (!fs.existsSync(routeDir)) {
    fs.mkdirSync(routeDir, { recursive: true });
  }

  // Copy dist/index.html to dist/route/index.html
  fs.copyFileSync(INDEX_HTML, path.join(routeDir, 'index.html'));
  console.log(`Generated: ${route}/index.html`);
});

console.log('\nAll static routes generated successfully.');
