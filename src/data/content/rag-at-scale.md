![RAG pipeline](/images/blog/rag-pipeline.svg)

*Retrieval quality is the product. The generator is the last mile.*

## The demo that lied

A RAG prototype over 20 PDFs feels like magic. You ask a question, it answers with a citation, and everyone in the room nods. Then you point it at 2 million documents, and the same system confidently answers the wrong question using the right-sounding paragraph from 2019.

The model did not get worse. The retrieval did not scale. The demo worked because the answer was always in the top three chunks of a tiny corpus. At scale, the hard problems are ingestion, chunking, permissions, freshness, and evaluation. Generation is the easy part.

This post is about the unsexy engineering that makes retrieval work when the corpus is large, the users are hostile, and the answers have consequences.

## RAG is two pipelines

The diagram above is the whole system. Most teams build the bottom half and neglect the top half.

**Offline ingestion** runs on a schedule or on change events:

- parse documents with structure intact
- chunk them into retrievable units
- enrich each chunk with metadata and access-control tags
- embed and index
- handle updates and deletes

**Online query** runs on every request:

- rewrite the user's question
- retrieve candidates with multiple methods
- rerank them
- assemble a bounded, permission-filtered context
- generate an answer with citations
- log everything for evaluation

If the ingestion pipeline is wrong, no prompt can save the query pipeline.

## Parsing: do not turn a table into a paragraph

The first failure is lossy parsing. A PDF with a pricing table becomes a stream of words; a slide deck loses its speaker notes; a wiki page loses its headings; a code file loses its syntax.

Use structure-aware parsers where you can:

- HTML: preserve headings, lists, tables, and links.
- PDF: extract layout, tables, and page numbers; OCR only when needed.
- Office files: preserve slide/page boundaries and comments.
- Code: parse by function or class, not fixed character windows.
- Tickets and emails: keep the thread structure and timestamps.

Store the source URI, page or section, title, author, last-modified time, and tenant ID with every chunk. You will need all of it later for citations, filtering, and freshness.

## Chunking: the highest-leverage decision

Chunking is where most RAG systems quietly fail. Too small and the chunk lacks context. Too large and the embedding averages away the signal, and the generator gets a wall of text.

A practical default:

- **Semantic boundaries first.** Split on headings, sections, functions, or paragraphs.
- **Target 300–800 tokens.** Long enough to carry an idea, short enough to retrieve precisely.
- **Overlap 10–15%.** Preserve sentences that straddle a boundary.
- **Parent-child retrieval.** Index small chunks, but return the parent section to the generator. This gives precise matching and coherent context.
- **Never split a table or code block** in the middle if you can avoid it.

The right chunk size is empirical. Build an evaluation set, try three sizes, and measure recall. Do not choose a number because a blog post said so.

## Embeddings: version them like a schema

An embedding is a lossy projection of text into a vector space. Change the model, and the geometry changes. Vectors from model A are not comparable to vectors from model B.

Treat embeddings as a versioned artifact:

- record the model name, dimension, and preprocessing in the index metadata
- re-embed the entire corpus when you change models
- keep the old index until the new one passes evaluation
- use the same model for queries and documents

A common outage: someone upgrades the embedding model, re-indexes documents, but the query path still uses the old model. Similarity scores become noise, and the system retrieves random chunks with high confidence.

## Hybrid search beats pure vectors

Dense embeddings are good at paraphrase and semantics. They are bad at exact identifiers, product codes, names, and rare terms. BM25 is the opposite.

Use both:

1. Dense retrieval returns the top 50 semantically similar chunks.
2. BM25 returns the top 50 keyword matches.
3. Fuse the lists with Reciprocal Rank Fusion (RRF) or a weighted score.
4. Rerank the fused top 50 with a cross-encoder.

RRF is simple and robust because it uses ranks, not raw scores, which are not comparable across retrieval methods:

```python
def reciprocal_rank_fusion(result_lists, k=60):
    scores = {}
    for results in result_lists:
        for rank, doc_id in enumerate(results, start=1):
            scores[doc_id] = scores.get(doc_id, 0.0) + 1.0 / (k + rank)
    return sorted(scores, key=scores.get, reverse=True)
```

The reranker is where the biggest quality jump usually lives. A cross-encoder reads the query and each candidate together, which is far more accurate than comparing independent embeddings. It is also slower, so only run it on the top 50, not the whole corpus.

## Query rewriting: the user is not a search engine

Users ask incomplete, ambiguous, context-dependent questions. A retrieval system should rewrite before it searches.

Useful transformations:

- **Decontextualize**: "What about the enterprise plan?" becomes "What is the price of the enterprise plan?"
- **Expand acronyms**: "SOC2" becomes "SOC 2 Type II compliance".
- **Generate sub-queries**: break a multi-part question into separate retrievals.
- **Detect intent**: is this a lookup, a comparison, a how-to, or a policy question?
- **HyDE**: generate a hypothetical answer and embed it, then retrieve documents similar to that answer. Useful for sparse corpora, risky for factual precision.

Every rewrite should be logged. When the system returns a bad answer, you need to know whether the rewrite or the retrieval was wrong.

## Access control belongs in the query

The most dangerous RAG bug is a permission leak. A user asks a question, the retriever fetches a document from another tenant, and the model summarizes it. The prompt did not "decide" to leak; the retrieval layer handed it the document.

Filter before retrieval, not after generation:

```sql
-- pgvector + metadata filter, simplified
SELECT id, content, source_uri
FROM chunks
WHERE tenant_id = $1
  AND ('public' = ANY(acl) OR $2 = ANY(acl))
ORDER BY embedding <=> $3
LIMIT 50;
```

Never rely on the model to respect permissions described in the prompt. Never put secrets or ACLs in the context and hope the model hides them. The database is the enforcement point.

For row-level security, consider a dedicated retrieval service that receives the user's identity and returns only authorized chunks. The generator should never see a chunk the user could not open directly.

## Freshness, deletes, and the index that lies

A RAG index is a cache of the corpus, and caches go stale.

- **Updates**: re-parse, re-chunk, and re-embed changed documents. Use content hashes to avoid unnecessary work.
- **Deletes**: remove chunks when the source is deleted. A deleted document that still appears in answers is a compliance incident.
- **Moves**: update the source URI and metadata; do not leave orphaned chunks.
- **Backfills**: version the index and run a shadow index for large re-embeds.
- **Watermarks**: record the last successful ingestion time per source, and alert when it falls behind.

The most common production complaint is not "the model is dumb." It is "the answer is from the old policy." Freshness is a pipeline problem.

## Evaluation: build the set before you tune

You cannot improve retrieval without a measurement. Build a golden set of real questions with:

- the expected answer
- the documents or passages that should be retrieved
- the documents that must not be retrieved (for permission tests)
- a difficulty label and the date

Then measure:

- **Recall@k**: did the correct passage appear in the top k?
- **MRR / nDCG**: how high did it rank?
- **Answer correctness**: is the final answer right, given the retrieved context?
- **Groundedness**: is every claim supported by a citation?
- **Refusal rate**: does it say "I don't know" when the corpus has no answer?
- **Permission violations**: zero tolerance.

LLM-as-judge is useful for scale, but calibrate it against human labels. A judge that rewards fluent wrong answers is worse than no judge.

Run the eval on every change to chunking, embedding model, retrieval parameters, reranker, and prompt. Treat it like a test suite, because it is one.

## Latency and cost

A RAG request has a budget. Spend it where it matters:

- Cache embeddings for repeated queries and documents.
- Batch embedding jobs offline; never embed one document at a time in a hot path.
- Use an approximate nearest-neighbor index (HNSW, IVF) for large corpora; tune recall vs speed.
- Retrieve 50, rerank 50 to 8, generate from 8. Do not stuff 50 chunks into the prompt.
- Cache the final answer for deterministic, high-frequency questions, with a short TTL and a cache key that includes the corpus version.
- Stream the answer so the user sees progress while the model decodes.

A p99 of 2 seconds is a product feature. A p99 of 12 seconds is a demo.

## The failure modes worth memorizing

- The answer is in the corpus, but the chunk is too small to contain it.
- The chunk is relevant, but the metadata filter excludes it.
- The embedding model changed, but the query model did not.
- The reranker was removed to save latency, and precision collapsed.
- The index is stale, and the answer cites a deleted policy.
- The retriever returns a document from another tenant.
- The generator ignores the retrieved context and answers from parametric memory.
- The evaluation set was written by the same person who tuned the system, so it measures nothing.

## The takeaway

RAG is not "put documents in a vector database and ask a model." It is a retrieval system with a generation interface. The engineering that matters is parsing, chunking, hybrid search, reranking, permissions, freshness, and evaluation.

Get those right, and a modest model produces excellent answers. Get them wrong, and the best model in the world will confidently cite the wrong paragraph.

The diagram is the checklist. Build both halves.
