I have a confession to make.

Every time Postman announced a new "improvement" to their desktop app, I'd quietly brace myself. You know the kind — where the changelog reads like a dystopian novel: "We've updated our UI, introduced a beautiful new paywall, and regret to inform you that your grandmother's API keys are now worth $12/month."

Look, I get it. Running a business is hard. But as someone who just wants to test APIs without creating an account, syncing my data to someone else's cloud, and getting flashed with "Upgrade to Pro" modals every time I click somewhere interesting — it got old. Fast.

So I did what any reasonable developer would do. I built my own.

## Introducing CourierHTTP

A Postman alternative that runs entirely on your machine. No accounts. No cloud sync. No telemetry. No subscriptions. No paywalls. No nonsense.

It's a desktop HTTP client that just... works. The way you'd expect software to work in an ideal world.

![CourierHTTP Screenshot](/courier-http-screenshot.png)

```bash:bash
git clone https://github.com/Suhird/courier-http.git
cd courier-http
npm install
npm run tauri dev
```

And that's it. You're in.

Or, if you don't want to build it yourself, you can grab the latest release directly from [GitHub Releases](https://github.com/Suhird/courier-http/releases/tag/v0.2.0). Pre-built installers for macOS (Apple Silicon + Intel) and Windows are available — just download and run.

## What Does It Do?

The basics you'd expect from any API client:

- **Send HTTP requests** — GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS
- **Configure requests** — query params, headers, authentication, body in JSON/text/XML/Form URL-encoded/Multipart
- **Authentication** — Bearer tokens, Basic auth, API keys, OAuth2
- **Environment variables** — Define variable sets, switch between them, interpolate `{{variables}}` throughout
- **Collections** — Save and organize your requests, drag-and-drop to reorder, export to JSON
- **History** — Automatically tracks the last 200 requests so you can revisit that endpoint you "definitely memorized"
- **Response viewer** — Status codes, duration, size, syntax-highlighted bodies, headers table
- **Multi-tab** — Multiple requests open simultaneously
- **Resizable panels** — Drag the divider, because your 27" monitor deserves better than a fixed layout

The UI isn't going to win any design awards, but it's functional, fast, and doesn't get in your way.

## The Tech Behind It

The stack was a deliberate choice:

**Tauri v2** for the desktop shell. Not Electron. I know, I know — Electron is everywhere. But shipping a full Chromium browser just to make HTTP requests felt obscene to me. Tauri uses the system WebView, so the app is lean, fast, and doesn't eat RAM like it's going out of style.

**Rust** for everything that matters. The HTTP engine, file storage, command handling — all in Rust. The `reqwest` crate handles the HTTP client work, and let me tell you, writing async Rust tests with `wiremock` is genuinely pleasant. 58 tests covering everything from model serialization to OAuth2 flows.

**React 18 + TypeScript** for the frontend. Functional components, hooks, the works. The frontend alone has 349 tests. Yes, I'm a bit test-happy. No, I don't apologize for it.

**Zustand** for state management. Simple, minimal, does the job without trying to be a framework.

**Monaco Editor** for the code editing bits. Because writing JSON in a textarea is a crime against humanity.

## The Privacy Thing

This isn't just marketing fluff. I genuinely believe your API requests are nobody's business but yours.

CourierHTTP makes exactly zero network connections except the HTTP requests you explicitly tell it to send. There's no analytics, no crash reporting, no "phone home" mechanism of any kind.

Your collections, environments, and history are stored locally in:

- **macOS**: `~/Library/Application Support/courier-http/`
- **Windows**: `%APPDATA%\courier-http\`

If you need to share a collection, you export it to JSON. If someone needs your collection, they import it. No accounts, no "sync", no central authority that can get breached or decide to monetize your data.

## Building It Was The Point

Honestly, the app itself is almost secondary to what building it taught me.

I finally got to dive deep into Tauri v2 — the new plugin system, the command registration pattern, the whole IPC mechanism. That's knowledge that'll stick because I actually built something with it.

The Rust backend forced me to think properly about error handling, about modeling data that needs to serialize and deserialize cleanly, about writing tests that actually give you confidence. When your tests cover HTTP execution with mock servers, you're not just hoping it works — you know it works.

And the frontend tests (349 of them, if you're counting) taught me to actually think about component boundaries, about separating logic from presentation, about building hooks that do one thing well.

## Is It Finished?

It's usable. It's feature-complete for my use cases. But it's also open source, and if there's something you'd want that it doesn't have, the door's open.

You can grab pre-built installers for macOS and Windows from the GitHub releases page. Or build it yourself — the setup is just a few commands.

## The Point

Look, I know Postman has a lot of features. I know Insomnia exists. I know there are a dozen other tools out there.

But sometimes you just want to send a request, see the response, and move on with your day. Without creating an account. Without a subscription. Without your data going somewhere you didn't ask it to go.

That's what CourierHTTP is. A tool that respects your time and your privacy. A tool that runs fast because it was built with the right tools for the job. A tool I'll actually enjoy using.

Maybe you will too.

Check it out at [github.com/Suhird/courier-http](https://github.com/Suhird/courier-http) if you're interested. Stars are always appreciated. Issues and PRs are more appreciated. And if you actually build something cool with it, I'd genuinely love to hear about it.

Happy coding!