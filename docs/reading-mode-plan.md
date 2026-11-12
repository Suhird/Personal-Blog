# Reading Mode — research, design, and implementation plan

## 1. Objective

Keep the existing **Catppuccin terminal** experience as the default skin, remove every
other colour theme (Dracula, Rosé Pine, Matcha), and add one site-wide toggle that
switches the whole site to a **Reader** skin:

- a different layout (no terminal window chrome, no dashboard),
- a different type system (book serif body, quiet sans UI, mono only for code/meta),
- warm paper colour instead of dark terminal colour,
- almost no animation or motion,
- a comfortable mobile reading measure that feels like the Kindle app,
- consistent across Home, Tech Blog, Beyond Code, Series, Projects, About, Contact,
  post pages, 404, and both custom data-rich posts.

The two skins are two presentations of the **same routes and data**. Nothing is
duplicated at the content level.

---

## 2. Research notes

### Catppuccin (kept)

Source: [Catppuccin palette](https://catppuccin.com/palette/).

Catppuccin is a four-flavour palette. The site currently approximates **Mocha** (dark)
with a near-black background, lavender text, mauve headings, and pastel syntax
colours. Mocha remains the terminal skin unchanged. The other three themes currently
defined in `src/index.css` are not Catppuccin and will be removed.

Key Mocha tokens used by the site: `#1e1e2e` base, `#cdd6f4` text, `#cba6f7` mauve,
`#89b4fa` blue, `#a6e3a1` green, `#f9e2af` yellow, `#f5c2e7` pink, `#89dceb` sky,
`#6c7086` overlay.

### Medium

Reference: [Medium design system notes](https://styles.refero.design/style/9c92c3d1-a2fe-4a27-a324-826b19501774) and Medium's long-standing article layout (narrow measure, serif body, quiet chrome).

- A narrow article column (roughly 680px / ~65 characters) surrounded by generous
  white space.
- Serif body text (Charter/Georgia family) around 20–21px with ~1.55–1.6 leading;
  sans-serif UI and headlines.
- Black-on-white, almost no chrome, no boxes around article lists, no decorative
  shadows or gradients.
- Dates, reading time, and tags use small quiet metadata, not coloured pills.
- Motion is reserved for navigation; reading surfaces are static.

### AstroSage ([astro-sage.chintak.sh](https://astro-sage.chintak.sh/))

Source: [AstroSage colophon](https://astro-sage.chintak.sh/posts/colophon/) and [AstroSage showcase](https://astro-sage.chintak.sh/posts/showcase/).

- Body: **Newsreader**, a variable serif with optical sizing, **18.5px / 1.7**.
- Labels, dates, code: **JetBrains Mono**.
- Warm paper `#f8f2e6` light background, espresso `#1f1a15` dark background.
- Warm ink `#2d2620` / muted `#675c4f` / rule `#e3d8c3` / accent `#9c4a24`.
- Measure around **66 characters**; headings tighter, closer to the paragraph they
  introduce; quiet underlined links; pinned table of contents.
- Component vocabulary is deliberately small: rules, tags, callouts, code frames,
  figures. No cards with shadows.

### Kindle app

Reference: [Amazon's Kindle typography/layout update (The Verge)](https://www.theverge.com/2015/5/28/8676497/amazon-kindle-bookerly-typeface-layout-ios-update) and Kindle reading-customisation guidance.

- Book-first reading surface: serif type, warm paper/sepia tone, adjustable measure,
  no app chrome while reading.
- Metadata (chapter, progress, time left) is small and peripheral.
- Navigation is explicit and calm: previous / next, contents, back to library.
- The phone is treated as a page, not a dashboard: one column, generous margins,
  no horizontal scrolling except for code/tables.

### Synthesis for this site

The Reader skin is **not** a second Catppuccin flavour. It is a purpose-built paper
palette (warm paper, warm ink, one terracotta accent, one muted sage) so the contrast
between "terminal" and "book" is unmistakable. Code blocks use an earthy light
syntax palette that belongs on paper. Catppuccin remains intact in Terminal mode.

---

## 3. Design specification

### 3.1 Mode model

- `data-mode="terminal"` (default) or `data-mode="reader"` on `<html>`.
- Persisted in `localStorage` under `site-mode`.
- Applied by a tiny inline script in `index.html` before first paint to avoid a
  flash of the wrong skin.
- `ThemeModeProvider` (React context) owns the live value, writes storage, updates
  `color-scheme` and `<meta name="theme-color">`.
- No system-preference auto-switching: the two skins are an explicit choice. The
  terminal skin stays the default so existing visitors see no change.

### 3.2 Reader palette

| Token | Value | Use |
| --- | --- | --- |
| Paper | `#f8f2e6` | page background |
| Raised paper | `#f0e7d6` | code, cards, inputs |
| Ink | `#2d2620` | body text |
| Muted ink | `#675c4f` | metadata, ledes |
| Rule | `#e3d8c3` | hairlines |
| Accent | `#9c4a24` | links, active nav, emphasis |
| Sage | `#4e6743` | secondary accent, success |
| Selection | `#f0d7a8` | text selection |
| Danger | `#a43d2c` | errors |

Existing shadcn/terminal CSS variables are remapped to these values in Reader mode,
so legacy utility classes (`text-terminal-comment`, `border-terminal-comment/30`,
`bg-terminal-background`) automatically become warm paper equivalents. The pastel
terminal accents collapse into ink / accent / sage, keeping the reader UI consistent.

### 3.3 Typography

- Reader body: **Newsreader** variable serif, `19.5px / 1.72` desktop, `18px / 1.7`
  mobile, weight 400, optical sizing on. Measure `~66ch` (container max 720px,
  content max 680px).
- Reader headings: Newsreader 600, tight leading (1.1–1.25), negative tracking on
  large sizes.
- Reader UI: **Inter** 400/500/600, 0.72–0.9rem, small caps / letterspaced for
  labels, dates, nav.
- Reader code: **JetBrains Mono** 400/500, 0.86em inline, 0.84rem blocks.
- Terminal skin: JetBrains Mono (replaces the broken Hack Google Fonts request)
  everywhere it currently uses `font-mono`.

### 3.4 Layout

**Terminal** — unchanged: terminal window, three dots, `suhird@127.0.0.1` path,
dashboard home, terminal cards, existing blog listing and post layout. Only the
theme dropdown is replaced by the new mode toggle.

**Reader** —
- Masthead: serif wordmark + one-line tagline, quiet nav row, compact mode toggle.
- No terminal window, no dots, no prompt, no dashboard widgets, no shadows, no
  gradients, no cards with hover lift.
- Home: opening statement, latest writing list, series index, short about note.
- Blog listing: one column of title / description / date / read time / tags, with
  an archive-and-filter block in a `<details>` element (mobile-safe, no sidebar).
- Post: title, lede, meta, contents, article body, previous/next, share, back to
  writing. Body max 66ch. Code and tables scroll horizontally; no wrapping of code.
- About: static content, no typing canvas animation; portrait and timeline become
  quiet editorial blocks.
- Projects: single-column list / two-column grid of plain cards with hairline
  borders, no shadows.
- Contact: one-column form, paper inputs, accent submit button.
- Series: grouped list with native `<details>` expansion.
- Footer: hairline rule, copyright, a few quiet links, "Set in Newsreader".

### 3.5 Motion

Reader mode disables animation and transition globally (0.001ms) and forces all
scroll behaviors to `auto`. The `BuildCanvas` typing animation is not run at all;
content is rendered in its finished state. Terminal mode keeps all existing motion.

### 3.6 Accessibility

- Toggle is a real `<button>` with `aria-pressed`, `aria-label`, visible focus ring,
  44px minimum target on mobile.
- Contrast: ink on paper ≈ 11:1; muted on paper ≈ 6.5:1; accent on paper ≈ 5.1:1.
- No information conveyed by colour alone (tags and meta include text).
- `prefers-reduced-motion` is respected in both skins; Reader ignores motion by
  default.
- Keyboard: native `<details>`, links, and buttons; no hover-only controls.
- Images keep alt text; diagrams remain zoomable via their existing link wrapper.

### 3.7 Performance

- One extra font family set (Newsreader + Inter + JetBrains Mono), loaded with
  `display=swap`. Remove the broken Hack request.
- No new runtime dependencies; remove `next-themes`.
- Reader mode removes JS-driven animations, reduces ongoing timers (no dashboard
  clock or terminal log interval), and avoids heavy visual effects.

---

## 4. Architecture

```
index.html                  inline mode bootstrap + font links
src/main.tsx                index.css then reader.css
src/styles/reader.css       all Reader-mode global overrides + component classes
src/components/theme-mode-provider.tsx
src/components/ModeToggle.tsx
src/components/Layout.tsx   TerminalShell | ReaderShell
src/components/layout/ReaderHeader.tsx
src/components/layout/ReaderFooter.tsx
src/components/reader/*     ReaderHome, ReaderPostList, ReaderSeriesView, ...
```

`ThemeModeProvider` exposes `{ mode, setMode, toggleMode, isReader }`. Reader pages
consume it directly for structural differences; CSS handles the long tail of
secondary pages.

### Reader CSS class contract

| Class | Purpose |
| --- | --- |
| `.reader-shell` | root page wrapper |
| `.reader-container` | 720px reading container, 24px gutters |
| `.reader-container--wide` | 860px for projects/series |
| `.reader-main` | vertical page rhythm |
| `.reader-page` | page wrapper |
| `.reader-eyebrow` | small uppercase label |
| `.reader-title` | page/post display title |
| `.reader-lede` | intro paragraph |
| `.reader-section-title` | small caps section heading |
| `.reader-list` / `.reader-item` | article list and row |
| `.reader-item__title/desc/meta/tags` | row parts |
| `.reader-rule` | hairline divider |
| `.reader-link` | underlined accent link |
| `.reader-prose` | long-form body |
| `.reader-card` | plain hairline card |
| `.reader-filters` | native details filter block |
| `.reader-meta` | small mono/sans metadata |
| `.reader-post-header` | post title block |

---

## 5. Work split (parallel)

1. **Foundation (lead)**: provider, toggle, layout shells, `index.html`, font
   loading, palette, global Reader CSS, remove old themes and `next-themes`.
2. **Reader home + listings** (subagent): `ReaderHome`, `ReaderPostList`, integrate
   `Index.tsx` and `BlogListing.tsx`.
3. **Reader post** (subagent): `BlogPost`, `PostHeader`, `MarkdownRenderer`,
   `CodeBlock` light syntax, `TableOfContents`, `ShareLinks`, `SeriesNavigation`.
4. **Secondary pages** (subagent): About, Projects, Contact, Series, 404,
   `BuildCanvas` static mode, custom post chart/hero colours.
5. **QA** (subagents, after 2–4): production build, typecheck, lint, desktop and
   mobile screenshots, overflow/contrast checks, persistence and no-FOUC checks.

---

## 6. Test matrix

| Check | Terminal | Reader |
| --- | --- | --- |
| Home desktop 1440×900 | unchanged | new editorial home |
| Home mobile 390×844 | unchanged | one column, no overflow |
| Tech Blog listing | unchanged | list + details filters |
| Post (markdown) | unchanged | serif prose, light code |
| Post (custom data) | unchanged | readable on paper |
| About (BuildCanvas) | animation | static final state |
| Projects / Contact / Series / 404 | unchanged | consistent paper UI |
| Toggle persistence + reload | default | remembered |
| First paint | dark, no flash | paper, no flash |
| Keyboard focus | visible | visible |
| `scrollWidth <= innerWidth` | yes | yes |
| Build / tsc / lint | pass | pass |

---

## 7. Rollback

The change is additive: `data-mode="terminal"` is the default and the terminal
components remain. Removing Reader mode is a matter of reverting `Layout.tsx`,
deleting `reader.css` / reader components, and restoring the old theme toggle. No
content or routing changes.

---

## 8. Implementation status

Shipped.

- **Themes removed:** Dracula, Rosé Pine, and Matcha blocks and their menu entries are
  gone. `next-themes` was removed. The terminal skin is now the only Catppuccin
  palette in the codebase, and leftover Dracula hex values were replaced with
  Catppuccin tokens.
- **Toggle:** header button switches Terminal ↔ Reader, persists in `localStorage`,
  updates `color-scheme` and `theme-color`, and is applied before first paint by
  `index.html`. `?skin=reader` / `?skin=terminal` provide a shareable, non-persistent
  override.
- **Reader coverage:** Home, Tech Blog, Beyond Code, Series, Projects, About,
  Contact, 404, markdown posts, and both custom data-rich posts.
- **Static content:** `BuildCanvas` renders its finished state immediately in
  Reader mode and restarts correctly when switching back to Terminal.
- **Verification:** `tsc --noEmit` clean, `npm run lint` 0 errors (9 pre-existing
  warnings), production build passes. A 44-case browser matrix (11 routes × 2 skins
  × desktop/mobile) reported 0 horizontal overflow, 0 runtime errors, correct mode
  on every route, and 0 animated elements in Reader mode. Reader contrast measured
  13.36:1 body, 5.85:1 muted metadata, 5.51:1 links.
