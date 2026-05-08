import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.resolve(__dirname, '../dist');
const SITEMAP_PATH = path.resolve(__dirname, '../public/sitemap.xml');

// SEO config for each static listing page
const ROUTE_SEO = {
  '/tech-blog/': {
    title: 'TechBlog - Suhird Singh',
    description: 'Technical deep dives into gRPC, GraphQL, Python, Go, Rust, microservices, and cloud architecture.',
    canonical: 'https://suhird.me/tech-blog/',
    ogTitle: 'TechBlog - Suhird Singh',
    ogDescription: 'Technical deep dives into gRPC, GraphQL, Python, Go, Rust, microservices, and cloud architecture.',
  },
  '/beyond-code/': {
    title: 'BeyondCode - Suhird Singh',
    description: "Thoughts on finance, life in Canada, and everything outside the terminal.",
    canonical: 'https://suhird.me/beyond-code/',
    ogTitle: 'BeyondCode - Suhird Singh',
    ogDescription: "Thoughts on finance, life in Canada, and everything outside the terminal.",
  },
  '/series/': {
    title: 'Series - Suhird Singh',
    description: 'Browse blog post series on gRPC, GraphQL, Python, Rust, microservices, and cloud architecture.',
    canonical: 'https://suhird.me/series/',
    ogTitle: 'Series - Suhird Singh',
    ogDescription: 'Browse blog post series on gRPC, GraphQL, Python, Rust, microservices, and cloud architecture.',
  },
  '/projects/': {
    title: 'Projects - Suhird Singh',
    description: 'Explore projects and open-source work by Suhird Singh.',
    canonical: 'https://suhird.me/projects/',
    ogTitle: 'Projects - Suhird Singh',
    ogDescription: 'Explore projects and open-source work by Suhird Singh.',
  },
  '/about/': {
    title: 'About - Suhird Singh',
    description: 'Learn more about Suhird Singh, software engineer and technical blogger.',
    canonical: 'https://suhird.me/about/',
    ogTitle: 'About - Suhird Singh',
    ogDescription: 'Learn more about Suhird Singh, software engineer and technical blogger.',
  },
  '/contact/': {
    title: 'Contact - Suhird Singh',
    description: 'Get in touch with Suhird Singh.',
    canonical: 'https://suhird.me/contact/',
    ogTitle: 'Contact - Suhird Singh',
    ogDescription: 'Get in touch with Suhird Singh.',
  },
};

function injectSeoMeta(html, seo) {
  let result = html;

  // Replace title
  result = result.replace(/<title>.*?<\/title>/, `<title>${seo.title}</title>`);

  // Replace description
  result = result.replace(
    /<meta name="description" content="[^"]*" \/>/,
    `<meta name="description" content="${seo.description}" />`
  );

  // Replace canonical
  result = result.replace(
    /<link rel="canonical" href="[^"]*" \/>/,
    `<link rel="canonical" href="${seo.canonical}" />`
  );

  // Replace Open Graph title
  result = result.replace(
    /<meta property="og:title" content="[^"]*" \/>/,
    `<meta property="og:title" content="${seo.ogTitle}" />`
  );

  // Replace Open Graph description
  result = result.replace(
    /<meta property="og:description" content="[^"]*" \/>/,
    `<meta property="og:description" content="${seo.ogDescription}" />`
  );

  // Replace Open Graph URL
  result = result.replace(
    /<meta property="og:url" content="[^"]*" \/>/,
    `<meta property="og:url" content="${seo.canonical}" />`
  );

  // Replace Twitter title
  result = result.replace(
    /<meta name="twitter:title" content="[^"]*" \/>/,
    `<meta name="twitter:title" content="${seo.ogTitle}" />`
  );

  // Replace Twitter description
  result = result.replace(
    /<meta name="twitter:description" content="[^"]*" \/>/,
    `<meta name="twitter:description" content="${seo.ogDescription}" />`
  );

  // Add robots noindex if specified (for redirect pages)
  if (seo.robots) {
    result = result.replace(
      /<meta name="robots" content="[^"]*" \/>/,
      `<meta name="robots" content="${seo.robots}" />`
    );
  }

  return result;
}

// 1. Read the Sitemap
if (!fs.existsSync(SITEMAP_PATH)) {
  console.error('Sitemap not found at ' + SITEMAP_PATH);
  process.exit(1);
}

const sitemapContent = fs.readFileSync(SITEMAP_PATH, 'utf-8');

// 2. Extract all URLs from sitemap
const urlRegex = /<loc>(.*?)<\/loc>/g;
let urls = [];
let match;
while ((match = urlRegex.exec(sitemapContent)) !== null) {
  const url = match[1];
  const pathname = new URL(url).pathname;
  if (pathname !== '/') {
    urls.push(pathname);
  }
}

console.log(`Found ${urls.length} routes to generate static pages for.`);

// 3. Read base index.html
const INDEX_HTML = path.join(DIST_DIR, 'index.html');
if (!fs.existsSync(INDEX_HTML)) {
  console.error('Build output (dist/index.html) not found. Please run build first.');
  process.exit(1);
}

const baseHtml = fs.readFileSync(INDEX_HTML, 'utf-8');

// 4. Generate each static route
urls.forEach(route => {
  const cleanRoute = route.replace(/\/+$/, '');
  const routeDir = path.join(DIST_DIR, cleanRoute);

  if (!fs.existsSync(routeDir)) {
    fs.mkdirSync(routeDir, { recursive: true });
  }

  let html = baseHtml;
  const seo = ROUTE_SEO[route];
  if (seo) {
    html = injectSeoMeta(html, seo);
  }

  fs.writeFileSync(path.join(routeDir, 'index.html'), html);
  console.log(`Generated: ${cleanRoute}/index.html`);
});

// 5. Generate /blog/index.html as a redirect page (not in sitemap, noindex)
const blogDir = path.join(DIST_DIR, 'blog');
if (!fs.existsSync(blogDir)) {
  fs.mkdirSync(blogDir, { recursive: true });
}

const blogRedirectSeo = {
  title: 'Blog - Suhird Singh',
  description: "Suhird Singh's blog — technical deep dives and life beyond code.",
  canonical: 'https://suhird.me/tech-blog/',
  ogTitle: 'Blog - Suhird Singh',
  ogDescription: "Suhird Singh's blog — technical deep dives and life beyond code.",
  robots: 'noindex, follow',
};

const blogHtml = injectSeoMeta(baseHtml, blogRedirectSeo);
fs.writeFileSync(path.join(blogDir, 'index.html'), blogHtml);
console.log('Generated: /blog/index.html (redirect page with noindex)');

console.log('\nAll static routes generated successfully.');
