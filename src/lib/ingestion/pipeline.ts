/**
 * Content Ingestion Worker Blueprint
 * Deploy as a separate Node worker or cron job (BullMQ + Redis).
 *
 * See docs/ARCHITECTURE.md § Automated Content Ingestion Loop
 */

export interface FeedSource {
  id: string;
  url: string;
  type: "rss" | "api";
  priority: "high" | "normal";
  lastFetchedAt?: string;
}

export const INGESTION_SOURCES: FeedSource[] = [
  { id: "arxiv-cs-ai", url: "https://rss.arxiv.org/rss/cs.AI", type: "rss", priority: "normal" },
  { id: "arxiv-cs-cy", url: "https://rss.arxiv.org/rss/cs.CY", type: "rss", priority: "normal" },
];

export interface RawFeedItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  publishedAt: string;
  sourceId: string;
}

export interface ModuleDraft {
  slug: string;
  title: string;
  audienceProfiles: string[];
  steps: unknown[];
  sdgTags: string[];
}

export interface IngestionPipeline {
  fetchNewItems(since: Date): Promise<RawFeedItem[]>;
  deduplicate(items: RawFeedItem[]): RawFeedItem[];
  classifyRelevance(item: RawFeedItem): Promise<number>;
  generateDrafts(item: RawFeedItem): Promise<ModuleDraft[]>;
  safetyScan(draft: ModuleDraft): Promise<{ passed: boolean; flags: string[] }>;
  queueForEditorReview(draft: ModuleDraft, sourceUrl: string): Promise<void>;
}

/**
 * Example orchestration — wire to LLM provider in production.
 */
export async function runIngestionTick(pipeline: IngestionPipeline, since: Date) {
  const raw = await pipeline.fetchNewItems(since);
  const unique = pipeline.deduplicate(raw);

  for (const item of unique) {
    const relevance = await pipeline.classifyRelevance(item);
    if (relevance < 0.6) continue;

    const drafts = await pipeline.generateDrafts(item);
    for (const draft of drafts) {
      const { passed, flags } = await pipeline.safetyScan(draft);
      if (!passed) {
        console.warn(`Draft blocked: ${flags.join(", ")}`);
        continue;
      }
      await pipeline.queueForEditorReview(draft, item.url);
    }
  }
}
