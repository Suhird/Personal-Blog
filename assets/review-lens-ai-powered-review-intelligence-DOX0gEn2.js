const e=`# ReviewLens: AI-Powered Consumer Review Intelligence, Running 100% Locally

Stop trusting star ratings. Here's how to build a system that reads thousands of reviews for you — detecting fake ones, spotting quality drift, and surfacing what real buyers actually care about.

![ReviewLens Architecture](/review_lens_title_architecture.png)

## The Problem with Modern Product Reviews

Buying a product online in 2026 means wading through thousands of reviews, many of which are fake, incentivized, or just noise. Star ratings are gamed. Review counts are inflated. A product with 4.7 stars and 3,000 reviews might have a 30% fake rate, declining quality over the last six months, and a recurring complaint buried 40 pages deep that nobody reads.

The fundamental problem isn't a lack of data — it's that no tool synthesizes it intelligently. You're stuck manually scrolling, pattern-matching in your head, and making a decision based on vibes.

**ReviewLens** is my attempt to fix that. It's an AI-powered review intelligence engine that aggregates reviews from Amazon, Reddit, Best Buy, and YouTube, then runs a full analysis pipeline — fake detection, aspect sentiment, drift detection, theme clustering — and synthesizes a structured verdict, all running 100% on your local machine with no paid APIs required.

---

## What It Does

Type any product name. ReviewLens automatically:

- **Scrapes** Amazon, Reddit, Best Buy, and YouTube for real consumer opinions
- **Detects fake reviews** using Isolation Forest machine learning on 9 engineered features per review
- **Runs aspect-based sentiment analysis** — build quality, performance, value, battery life, etc. — using a locally-hosted LLM
- **Detects sentiment drift** over time: has quality been declining since that big firmware update six months ago?
- **Clusters reviews** into emergent themes using UMAP + HDBSCAN, named automatically by the LLM
- **Synthesizes a report** with a 0–10 verdict score, an executive summary, featured quotes, and who-should-buy/skip bullets

Everything streams progressively to a Next.js frontend as each stage completes.

---

## The Architecture

The pipeline is orchestrated by **LangGraph**, a framework for building stateful multi-agent graphs. Think of it as a directed graph where each node is an agent, and a shared state dictionary flows through them.

\`\`\`
user query
    │
    ▼
enrich_query_node     ← LLM generates 3–5 search variant aliases
    │
    ▼
scraper_node          ← asyncio.gather runs all 4 scrapers in parallel
    │
    ▼
analysis_node         ← ABSA → fake detection → drift → clustering
    │
    ▼
synthesis_node        ← computes score, calls LLM for summary
    │
    ▼
FinalReport           ← cached in Redis, streamed to frontend via SSE
\`\`\`

The entire pipeline is fault-tolerant. If Amazon blocks you with a CAPTCHA, the pipeline continues with Reddit and Best Buy data. If Ollama is slow, the analysis degrades gracefully to fallback text. No node crashes the graph — exceptions are caught and appended to an \`errors\` list in the shared state.

---

## The Tech Stack

The project runs as five Docker Compose services:

| Service      | Tech                   | Role                                            |
| ------------ | ---------------------- | ----------------------------------------------- |
| **backend**  | Python 3.11, FastAPI   | Pipeline execution, REST + SSE API              |
| **ollama**   | Mistral (default)      | Local LLM for ABSA, query enrichment, synthesis |
| **postgres** | PostgreSQL + pgvector  | Long-term review storage with vector embeddings |
| **redis**    | Redis                  | Job state, 24hr report cache                    |
| **frontend** | Next.js 14, TypeScript | Report UI with Recharts + D3.js                 |

Backend dependencies of note: \`langgraph\`, \`playwright\`, \`praw\`, \`sentence-transformers\`, \`umap-learn\`, \`hdbscan\`, \`ruptures\`, \`scikit-learn\`, \`asyncpg\`, \`httpx\`.

---

## Deep Dive: The Four Scrapers

Scraping in 2026 means fighting constant countermeasures. Each source required a different approach.

### Amazon (Playwright)

Amazon is the hardest. The classic trick of navigating to \`/product-reviews/{asin}\` no longer works for headless browsers — Amazon redirects to a sign-in wall. The fix: parse reviews embedded directly in the product page HTML. They're already there, inside \`div[data-hook='review']\` elements.

The scraper also sets \`--disable-blink-features=AutomationControlled\` and overrides \`navigator.webdriver = undefined\` to reduce bot fingerprinting.

\`\`\`python
await context.add_init_script(
    "Object.defineProperty(navigator, 'webdriver', { get: () => undefined });"
)
\`\`\`

### Best Buy (UGC API)

Best Buy exposes an internal reviews API at \`/ugc/v2/reviews?productId={sku}\` that returns clean JSON — far more reliable than scraping rendered HTML. The trick is getting the numeric SKU.

Best Buy also redirects non-US IPs to an international selector page. The fix is a single cookie:

\`\`\`python
{"name": "intl_splash", "value": "false", "domain": ".bestbuy.com", "path": "/"}
\`\`\`

After that, the scraper extracts the SKU directly from JSON blobs embedded in the search results page HTML using a regex (\`"skuId"\\s*:\\s*"?(\\d{5,})"?\`), then calls the UGC API.

### Reddit (PRAW)

Reddit comments are often more valuable than star-rated reviews. A Reddit thread about a product is full of real-world edge cases, comparisons, and failure modes that a 5-star review will never mention. PRAW makes this easy — search 5 targeted subreddits, collect post bodies plus the top 10 comments per post.

### YouTube (Data API v3)

Review video comments are underrated as a data source. People who comment on review videos have often already bought the product or are deciding whether to. The YouTube Data API v3 is free (10,000 units/day, ~50 product searches) and returns structured JSON with like counts and timestamps.

---

## Deep Dive: The Analysis Pipeline

### 1. Aspect-Based Sentiment Analysis (ABSA)

ABSA goes beyond "positive" or "negative". It asks: _what are people happy or unhappy about, specifically?_

Reviews are batched in groups of 20 and sent to Ollama with a structured JSON prompt. The LLM scores each aspect (build quality, performance, value, noise cancellation, etc.) from 1–10, assigns a sentiment label, counts mentions, and picks the most representative quote.

Results from all batches are merged: scores are weighted by mention count, sentiments use majority vote, and the longest quote wins.

### 2. Fake Review Detection

The fake detector uses scikit-learn's \`IsolationForest\` — an unsupervised anomaly detection model — trained on 9 engineered features per review:

| Feature                 | Why It Matters                                            |
| ----------------------- | --------------------------------------------------------- |
| \`text_length\`           | Very short or suspiciously long reviews are anomalies     |
| \`exclamation_count\`     | Fake reviews over-use exclamation points                  |
| \`caps_ratio\`            | Excessive capitalization signals incentivized writing     |
| \`generic_praise_score\`  | Keyword match: "amazing", "perfect", "love it", "5 stars" |
| \`verified_purchase\`     | Unverified purchases are higher risk                      |
| \`helpful_votes\`         | Real reviews get upvoted; fake ones don't                 |
| \`days_since_posting\`    | Review date relative to corpus median                     |
| \`reviewer_review_count\` | Reviewers with only one review in the corpus are suspect  |
| \`burst_score\`           | Multiple reviews from same reviewer within 7 days         |

\`contamination=0.1\` means the model assumes ~10% of reviews are anomalous. Scores above 0.7 are flagged. Risk levels: low (< 15% flagged), medium (< 35%), high (≥ 35%).

### 3. Sentiment Drift Detection

A product's reviews from 2023 might tell a different story than its reviews from 2025. Firmware updates, supplier changes, and quality-control issues all leave fingerprints in the review timeline.

The drift detector groups reviews by year-month, normalizes star ratings to 0–1, then runs the PELT (Pruned Exact Linear Time) change-point detection algorithm from the \`ruptures\` library. Change points are months where the sentiment signal shifts meaningfully. Trend direction (improving / declining / stable) is computed by comparing the first 3 months' average against the last 3.

### 4. Theme Clustering

What are people actually talking about? Clustering finds emergent themes without needing predefined categories.

The pipeline: generate 384-dim sentence embeddings with \`all-MiniLM-L6-v2\` (local, no API) → reduce to 5 dimensions with UMAP → cluster with HDBSCAN → ask Ollama to name each cluster in 3–5 words.

The result might be: "Excellent Noise Cancellation", "Battery Life Issues", "Comfortable for Long Wear", "Latency with Gaming". These are discovered from the data, not hardcoded.

---

## The Verdict Score

The overall score is computed programmatically — no LLM in the loop, just arithmetic:

\`\`\`python
base_score = avg_rating / 5.0 * 10        # 0–10 from star ratings
fake_penalty = fake_percentage * 0.05     # up to ~2.5 points off
drift_bonus = +0.5 if improving else -0.5 if declining else 0

overall = clamp(base_score - fake_penalty + drift_bonus, 0.0, 10.0)
\`\`\`

Then Ollama writes the executive summary and who-should-buy/skip bullets based on all the structured analysis outputs.

---

## Running It Locally

Requirements: Docker Desktop, 16 GB RAM (Mistral needs ~8 GB), and free Reddit API credentials.

\`\`\`bash
git clone https://github.com/your-username/review-lens.git
cd review-lens
cp .env.example .env
# Fill in REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET in .env
./init.sh
\`\`\`

\`init.sh\` starts Ollama first, pulls the Mistral model (~4 GB, one-time), then starts all services. Open \`http://localhost:3000\`.

Analysis time depends on your hardware. On an M2 MacBook: ~3–8 minutes. On a CPU-only machine: 15–30 minutes. If you're RAM-constrained, swap Mistral for \`llama3.2:1b\`:

\`\`\`
OLLAMA_MODEL=llama3.2:1b
\`\`\`

---

## What I Learned

A few things stood out building this:

**LangGraph's fault tolerance model is excellent for pipelines like this.** The \`return_exceptions=True\` pattern in \`asyncio.gather\` combined with per-node try/except means you always get _something_ back, even when scraping is unreliable.

**Unsupervised methods are underrated for consumer problems.** Isolation Forest and HDBSCAN require no labeled training data — they find structure in whatever reviews you give them. This makes the system generalizable to any product without retraining.

**Reddit and YouTube are underutilized data sources.** Amazon reviews are highly gamed and often surface sanitized opinions. Reddit threads and YouTube comment sections contain real purchase decisions, failure stories, and nuanced comparisons that structured review platforms just don't capture.

**Local LLMs are good enough for structured extraction.** Mistral on Ollama handles JSON output reliably for the ABSA and synthesis tasks. It's not GPT-4, but for categorizing sentiment and writing a 3-sentence summary, it's more than sufficient.

---

## What's Next

A few directions worth exploring:

- **Browser extension** — inject the ReviewLens verdict directly into Amazon product pages while you browse
- **Amazon PA-API integration** — the official Amazon Product Advertising API is free with an Associates account and gives structured review data without scraping
- **Comparison mode** — analyze two products side by side with a diff view of aspect scores
- **Scheduled re-analysis** — cron job to re-scrape saved products weekly and surface score changes over time

The full source is on GitHub. Everything runs locally, no credit card required.
`;export{e as default};
