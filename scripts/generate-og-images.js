/**
 * Generates 1200x630 social sharing cards for every blog post.
 *
 * Social crawlers (Twitter/X, LinkedIn, Slack, Discord, Telegram, iMessage...)
 * never execute the SPA, so the card has to exist as a static raster image that
 * the pre-rendered HTML in scripts/generate-seo-pages.js can point at.
 *
 * Run automatically as part of `npm run build` (see the postbuild script).
 * Output: dist/og/<slug>.jpg plus dist/og/default.jpg and dist/og/manifest.json
 */
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import {
  AUTHOR_NAME,
  DIST_DIR,
  OG_HEIGHT,
  OG_WIDTH,
  SITE_NAME,
  isLocalPublicAsset,
  postSection,
  publicFileFor,
  readPosts,
} from './lib/postMeta.js';

const OG_DIR = path.join(DIST_DIR, 'og');
const DEFAULT_CARD_NAME = 'default.jpg';

const COLORS = {
  background: '#0c0c12',
  panel: 'rgba(8, 10, 16, 0.88)',
  panelBorder: 'rgba(148, 163, 184, 0.22)',
  foreground: '#e4e9f5',
  comment: '#8b93a7',
  green: '#8ce99a',
  cyan: '#7dd3fc',
  yellow: '#fde68a',
  red: '#ff5f56',
  yellowDot: '#ffbd2e',
  greenDot: '#27c93f',
};

const ART_BOX = { x: 800, y: 190, width: 344, height: 250, radius: 16, padding: 12 };
const ART_INNER = {
  width: ART_BOX.width - ART_BOX.padding * 2,
  height: ART_BOX.height - ART_BOX.padding * 2,
};

function escapeXml(value = '') {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// DejaVu Sans Mono glyphs are ~0.6em wide, which is close enough for wrapping.
const CHAR_WIDTH_RATIO = 0.6;
// A little padding so a line never touches the panel edge.
const LINE_SAFETY = 0.94;

function wrapText(text, maxWidth, fontSize) {
  const maxChars = Math.max(8, Math.floor((maxWidth * LINE_SAFETY) / (fontSize * CHAR_WIDTH_RATIO)));
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars) {
      current = candidate;
      continue;
    }
    if (current) lines.push(current);
    current = word.length > maxChars ? `${word.slice(0, maxChars - 1)}…` : word;
  }
  if (current) lines.push(current);
  return lines;
}

function fitTitle(title) {
  const limits = [
    { maxChars: 60, fontSize: 46 },
    { maxChars: 95, fontSize: 40 },
    { maxChars: 160, fontSize: 34 },
  ];
  const normalized = title.trim();
  const preset = limits.find((limit) => normalized.length <= limit.maxChars) ?? limits[limits.length - 1];
  const decoded = preset.fontSize;

  const maxWidth = 660;
  let lines = wrapText(normalized, maxWidth, decoded);

  const maxLines = 5;
  if (lines.length > maxLines) {
    lines = lines.slice(0, maxLines);
    lines[maxLines - 1] = `${lines[maxLines - 1].replace(/[.,;:]$/, '').slice(0, -1)}…`;
  }

  return { lines, fontSize: decoded, lineHeight: Math.round(decoded * 1.24) };
}

function buildOverlay({ post, isDefault }) {
  const panel = { x: 56, y: 52, width: 724, height: 526 };
  const textX = panel.x + 32;
  const textWidth = panel.width - 64;

  const title = isDefault ? SITE_NAME : post.title;
  const subtitle = isDefault
    ? 'Deep dives into AI, security, distributed systems, Python, Rust'
    : post.description;
  const tags = isDefault ? ['AI', 'Security', 'Systems', 'Python', 'Rust'] : post.tags;
  const meta = isDefault
    ? 'suhird.me'
    : [post.date, post.readTime].filter(Boolean).join('  •  ');
  const section = isDefault ? 'suhird.me' : postSection(post);

  const titleLayout = fitTitle(title);
  const titleStartY = 214;
  const titleLines = titleLayout.lines
    .map(
      (line, index) =>
        `<text x="${textX}" y="${titleStartY + index * titleLayout.lineHeight}" font-family="'DejaVu Sans Mono', 'JetBrains Mono', monospace" font-size="${titleLayout.fontSize}" font-weight="bold" fill="${COLORS.foreground}">${escapeXml(line)}</text>`
    )
    .join('\n');

  const tagY = panel.y + panel.height - 72;
  const tagText = tags.slice(0, 4).map((tag) => `#${tag}`).join('  ');

  const titleBlockHeight = titleLayout.lines.length * titleLayout.lineHeight;
  const subtitleY = titleStartY + titleBlockHeight + 6;
  let subtitleLayout = wrapText(subtitle, textWidth, 20);
  // Never let the subtitle collide with the tag row at the bottom of the panel.
  const subtitleMaxLines = Math.max(0, Math.min(3, Math.floor((tagY - 26 - subtitleY) / 29)));
  if (subtitleLayout.length > subtitleMaxLines) {
    subtitleLayout = subtitleLayout.slice(0, subtitleMaxLines);
    if (subtitleLayout.length) {
      subtitleLayout[subtitleLayout.length - 1] =
        `${subtitleLayout[subtitleLayout.length - 1].replace(/[.,;:]$/, '').slice(0, -1)}…`;
    }
  }
  const subtitleLines = subtitleLayout
    .map(
      (line, index) =>
        `<text x="${textX}" y="${subtitleY + index * 29}" font-family="'DejaVu Sans Mono', 'JetBrains Mono', monospace" font-size="20" fill="${COLORS.comment}">${escapeXml(line)}</text>`
    )
    .join('\n');

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${OG_WIDTH}" height="${OG_HEIGHT}">
  <rect x="${panel.x}" y="${panel.y}" width="${panel.width}" height="${panel.height}" rx="18" fill="${COLORS.panel}" stroke="${COLORS.panelBorder}" stroke-width="1.5" />
  <line x1="${panel.x}" y1="${panel.y + 44}" x2="${panel.x + panel.width}" y2="${panel.y + 44}" stroke="${COLORS.panelBorder}" stroke-width="1" />

  <circle cx="${textX + 2}" cy="${panel.y + 22}" r="6" fill="${COLORS.red}" />
  <circle cx="${textX + 22}" cy="${panel.y + 22}" r="6" fill="${COLORS.yellowDot}" />
  <circle cx="${textX + 42}" cy="${panel.y + 22}" r="6" fill="${COLORS.greenDot}" />
  <text x="${textX + 66}" y="${panel.y + 27}" font-family="'DejaVu Sans Mono', monospace" font-size="14" fill="${COLORS.comment}">suhird@127.0.0.1 ${escapeXml(section)}</text>

  ${titleLines}
  ${subtitleLines}

  ${tagText ? `<text x="${textX}" y="${tagY}" font-family="'DejaVu Sans Mono', monospace" font-size="18" fill="${COLORS.cyan}">${escapeXml(tagText)}</text>` : ''}
  <text x="${textX}" y="${tagY + 30}" font-family="'DejaVu Sans Mono', monospace" font-size="17" fill="${COLORS.comment}">${escapeXml(meta)}</text>

  <text x="${OG_WIDTH - 56}" y="${OG_HEIGHT - 34}" text-anchor="end" font-family="'DejaVu Sans Mono', monospace" font-size="18" fill="${COLORS.green}">suhird.me</text>
  <text x="${textX}" y="${OG_HEIGHT - 34}" font-family="'DejaVu Sans Mono', monospace" font-size="18" fill="${COLORS.comment}">${escapeXml(AUTHOR_NAME)}</text>
</svg>`;
}

function buildBackground() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_WIDTH}" height="${OG_HEIGHT}">
  <defs>
    <radialGradient id="glow" cx="0.82" cy="0.2" r="0.75">
      <stop offset="0%" stop-color="${COLORS.cyan}" stop-opacity="0.18" />
      <stop offset="60%" stop-color="${COLORS.cyan}" stop-opacity="0.03" />
      <stop offset="100%" stop-color="${COLORS.cyan}" stop-opacity="0" />
    </radialGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="${COLORS.panelBorder}" stroke-opacity="0.18" stroke-width="1" />
    </pattern>
  </defs>
  <rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="${COLORS.background}" />
  <rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="url(#grid)" />
  <rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="url(#glow)" />
</svg>`;
}

function buildArtFrame({ hasArt }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_WIDTH}" height="${OG_HEIGHT}">
  <rect x="${ART_BOX.x}" y="${ART_BOX.y + 6}" width="${ART_BOX.width}" height="${ART_BOX.height}" rx="${ART_BOX.radius}" fill="#000" fill-opacity="0.55" />
  <rect x="${ART_BOX.x}" y="${ART_BOX.y}" width="${ART_BOX.width}" height="${ART_BOX.height}" rx="${ART_BOX.radius}" fill="#14161f" />
  ${
    hasArt
      ? ''
      : `<text x="${ART_BOX.x + ART_BOX.width / 2}" y="${ART_BOX.y + ART_BOX.height / 2 + 34}" text-anchor="middle" font-family="'DejaVu Sans Mono', monospace" font-size="96" font-weight="bold" fill="${COLORS.cyan}" fill-opacity="0.22">&gt;_</text>`
  }
</svg>`;
}

function buildArtBorder() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_WIDTH}" height="${OG_HEIGHT}">
  <rect x="${ART_BOX.x}" y="${ART_BOX.y}" width="${ART_BOX.width}" height="${ART_BOX.height}" rx="${ART_BOX.radius}" fill="none" stroke="${COLORS.panelBorder}" stroke-width="1.5" />
</svg>`;
}

async function renderHero(heroPath) {
  if (!heroPath || !isLocalPublicAsset(heroPath)) return null;
  try {
    const image = sharp(publicFileFor(heroPath), { density: 200 }).resize({
      width: ART_INNER.width,
      height: ART_INNER.height,
      fit: 'inside',
      withoutEnlargement: false,
    });

    const { data, info } = await image.png().toBuffer({ resolveWithObject: true });
    return {
      buffer: data,
      width: info.width,
      height: info.height,
      left: ART_BOX.x + ART_BOX.padding + Math.round((ART_INNER.width - info.width) / 2),
      top: ART_BOX.y + ART_BOX.padding + Math.round((ART_INNER.height - info.height) / 2),
    };
  } catch (error) {
    console.warn(`  ! Could not rasterize ${heroPath}: ${error.message}`);
    return null;
  }
}

async function renderCard({ post, isDefault = false }) {
  const hero = isDefault ? null : await renderHero(post.heroImage);
  const composites = [
    { input: Buffer.from(buildBackground()), top: 0, left: 0 },
    { input: Buffer.from(buildArtFrame({ hasArt: Boolean(hero) })), top: 0, left: 0 },
  ];

  if (hero) {
    composites.push({ input: hero.buffer, top: hero.top, left: hero.left });
  }

  composites.push({ input: Buffer.from(buildOverlay({ post, isDefault })), top: 0, left: 0 });
  composites.push({ input: Buffer.from(buildArtBorder()), top: 0, left: 0 });

  return sharp({
    create: { width: OG_WIDTH, height: OG_HEIGHT, channels: 3, background: COLORS.background },
  })
    .composite(composites)
    .jpeg({ quality: 90, chromaSubsampling: '4:4:4', mozjpeg: true })
    .toBuffer();
}

async function main() {
  if (!fs.existsSync(DIST_DIR)) {
    console.error('dist/ does not exist. Run `vite build` first.');
    process.exit(1);
  }

  fs.mkdirSync(OG_DIR, { recursive: true });

  const posts = readPosts();
  const manifest = {};

  for (const post of posts) {
    const fileName = `${post.slug}.jpg`;
    const card = await renderCard({ post });
    fs.writeFileSync(path.join(OG_DIR, fileName), card);

    manifest[post.slug] = {
      path: `/og/${fileName}`,
      width: OG_WIDTH,
      height: OG_HEIGHT,
      alt: post.title,
      sourceImage: post.heroImage || null,
    };
    console.log(`Generated OG card: /og/${fileName}${post.heroImage ? ` (from ${post.heroImage})` : ''}`);
  }

  const defaultCard = await renderCard({ post: null, isDefault: true });
  fs.writeFileSync(path.join(OG_DIR, DEFAULT_CARD_NAME), defaultCard);
  manifest.default = {
    path: `/og/${DEFAULT_CARD_NAME}`,
    width: OG_WIDTH,
    height: OG_HEIGHT,
    alt: `${SITE_NAME} — ${AUTHOR_NAME}`,
    sourceImage: null,
  };

  fs.writeFileSync(path.join(OG_DIR, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`\nGenerated ${posts.length + 1} OG cards in dist/og/`);
}

main().catch((error) => {
  console.error('Failed to generate OG images:', error);
  process.exit(1);
});
