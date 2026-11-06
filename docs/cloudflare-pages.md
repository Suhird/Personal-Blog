# Deploying the blog to Cloudflare Pages

This branch adds the files Cloudflare Pages expects while keeping the existing GitHub Pages build intact.

## What was added

| File | Purpose |
|---|---|
| `public/_headers` | Security headers and asset caching rules |
| `scripts/generate-cloudflare-redirects.js` | Generates `dist/_redirects` from the post metadata |
| `functions/api/health.ts` | Minimal Pages Function at `/api/health`, ready for a future backend |
| `wrangler.toml` | Pages project name, output directory, compatibility date, and a commented D1 binding |
| `.nvmrc` | Node 22 for build environments that read it |

`npm run build` now also generates `dist/_redirects`. The static post pages, sitemap, and legacy `/blog/...` pages are still generated exactly as before.

## Local check

Build and start the Cloudflare Pages emulator:

```bash
npm ci
npm run cf:preview
```

That runs `npm run build` and then:

```bash
wrangler pages dev dist
```

Useful checks:

```bash
curl -i http://127.0.0.1:8788/api/health
curl -I http://127.0.0.1:8788/tech-blog/hermes-agent-local-qwen/
curl -I http://127.0.0.1:8788/assets/<some-built-asset>
curl -o /dev/null -w '%{http_code} %{redirect_url}\n' \
  http://127.0.0.1:8788/blog/hermes-agent-local-qwen/
```

Expected:

- `/api/health` returns JSON
- a post page returns `200` with the security headers from `_headers`
- hashed `/assets/*` files return `Cache-Control: public, max-age=31536000, immutable`
- legacy `/blog/...` URLs return `301` to `/tech-blog/...` or `/beyond-code/...`
- unknown paths return `404`

## Deploy from the Cloudflare dashboard

1. Push this branch to GitHub.
2. Open the Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
3. Pick the `Suhird/Personal-Blog` repository.
4. Select the `cloudflare-pages` branch for the first deployment.
5. Use these build settings:

| Setting | Value |
|---|---|
| Framework preset | None |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node version | `22` |

6. Add an environment variable if the build image does not pick up `.nvmrc`:

```text
NODE_VERSION=22
```

Cloudflare installs dependencies automatically before running the build command. This repository has both `package-lock.json` and `bun.lockb`; Cloudflare currently detects Bun and runs `bun install --frozen-lockfile`, so keep `bun.lockb` in sync when `package.json` changes.

7. Deploy.

The first deployment gives you a `*.pages.dev` URL. Test it before touching DNS.

## Deploy from GitHub Actions

The repository includes `.github/workflows/deploy.yaml`, which deploys on every push to `main` and can also be started manually.

Add these GitHub repository secrets:

| Secret | Value |
|---|---|
| `CLOUDFLARE_API_TOKEN` | A Cloudflare API token with **Account → Cloudflare Pages → Edit** |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID |

The workflow runs:

```bash
npm ci
npm run build
npx wrangler pages deploy dist --project-name=suhird-blog --branch=main
```

If you use the GitHub Action, disable Cloudflare's automatic Git deployments to avoid deploying twice:

**Pages project → Settings → Builds & deployments → Automatic deployments → Disable**

Then set **Production branch** to `main`.

The old GitHub Pages workflow was replaced, and `public/CNAME` was removed.

## Deploy from the CLI

```bash
npx wrangler login
npm run cf:deploy
```

`cf:deploy` runs the build first and deploys `dist` to a Pages project named `suhird-blog`.

If you use a different project name, change it in two places:

- `wrangler.toml` → `name`
- `package.json` → `cf:deploy` script

## Custom domain

You can keep the domain at your current registrar and use Cloudflare for DNS.

1. Add `suhird.me` as a zone in Cloudflare.
2. Change the registrar nameservers to the two Cloudflare nameservers.
3. In the Pages project, open **Custom domains**.
4. Add:

```text
suhird.me
www.suhird.me
```

5. Cloudflare will create the required DNS records. If it asks for a CNAME, point the hostname at your `*.pages.dev` project.
6. Enable **Always Use HTTPS**.
7. Wait for the certificate to become active.

Do not remove the GitHub Pages DNS records until the Cloudflare deployment and custom domain both work. Keep the old setup available until you have checked the home page, a post page, a legacy `/blog/...` link, images, the sitemap, and HTTPS on mobile.

## What happens to GitHub Pages

GitHub Pages is no longer part of the deployment path:

- `.github/workflows/deploy.yaml` now deploys to Cloudflare Pages.
- `public/CNAME` was removed.
- The existing generated static routes and `dist/404.html` remain for Cloudflare.

To turn off the old GitHub Pages site:

1. Open the repository on GitHub.
2. Go to **Settings → Pages**.
3. Remove the custom domain if it is still listed.
4. Set **Source** to **None** or use **Unpublish site**.
5. Optionally delete the old `gh-pages` branch.

The `gh-pages` npm script may remain for emergency use, but it is not called by CI anymore.

## Adding a backend later

The `functions/` directory is the backend entry point. A file at `functions/api/posts.ts` becomes `https://suhird.me/api/posts`.

Example:

```ts
export const onRequestGet = async () => {
  return Response.json({ posts: [] });
};
```

Add a D1 database:

```bash
npx wrangler d1 create suhird-blog
```

Copy the returned `database_id` into `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "suhird-blog"
database_id = "your-d1-database-id"
```

Then use it from a function:

```ts
export const onRequestGet: PagesFunction<{ DB: D1Database }> = async ({ env }) => {
  const result = await env.DB.prepare('SELECT * FROM posts').all();
  return Response.json(result.results);
};
```

Add the Cloudflare types if you want typed bindings:

```bash
npm install -D @cloudflare/workers-types
```

For relational data, auth, storage, or dashboards, Supabase or Neon is usually a better fit than D1. You can keep the frontend on Pages and point it at `https://api.suhird.me` on another service. The domain and hosting are independent.

## Important Cloudflare Pages notes

- **Static routes are already generated.** `_redirects` does not use a catch-all SPA rewrite; unknown paths fall through to `404.html`.
- **Functions are separate from the Vite build.** Cloudflare compiles `functions/`; Vite does not.
- **Do not put secrets in `src/` or `public/`.** Use Pages environment variables or Wrangler secrets for a backend.
- **`_redirects` is generated during `postbuild`.** If you add a post and the old `/blog/...` URL matters, the build will add its redirect automatically.
- **The free plan changes.** Check Cloudflare's current Pages, Workers, D1, and R2 limits before relying on them.
- **Preview deployments are useful.** Open a pull request and test the `*.pages.dev` preview before promoting it to the production branch.

## Recommended rollout

1. Deploy this branch to a `*.pages.dev` URL.
2. Run the checks above.
3. Add the custom domain and verify DNS/HTTPS.
4. Keep GitHub Pages running for a few days.
5. Switch the production domain only after the preview looks right.
6. When you need a backend, add a function under `functions/api/` and bind D1 or call an external API.
