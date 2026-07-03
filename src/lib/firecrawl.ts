import Firecrawl from "@mendable/firecrawl-js";

/** Thrown for any scrape failure (missing key, network, empty page, login/anti-bot). */
export class FirecrawlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FirecrawlError";
  }
}

/** Cap the markdown we forward to the LLM (keeps latency & token cost bounded). */
const MAX_MARKDOWN_CHARS = 20_000;

let client: Firecrawl | null = null;

function getClient(): Firecrawl {
  if (!process.env.FIRECRAWL_API_KEY) {
    throw new FirecrawlError("FIRECRAWL_API_KEY is not set — add it to .env.local.");
  }
  client ??= new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });
  return client;
}

export interface ScrapedPage {
  markdown: string;
  title: string | null;
  sourceUrl: string;
}

/** Scrape a single public URL to clean markdown. Throws FirecrawlError on failure. */
export async function scrapeUrl(url: string): Promise<ScrapedPage> {
  const firecrawl = getClient();

  let doc;
  try {
    doc = await firecrawl.scrape(url, {
      formats: ["markdown"],
      onlyMainContent: true,
    });
  } catch (e) {
    throw new FirecrawlError(
      e instanceof Error ? e.message : "Could not reach that page."
    );
  }

  const markdown = (doc?.markdown ?? "").trim();
  if (!markdown) {
    throw new FirecrawlError(
      "That page returned no readable content (it may require a login)."
    );
  }

  return {
    markdown: markdown.slice(0, MAX_MARKDOWN_CHARS),
    title: doc?.metadata?.title ?? null,
    sourceUrl: url,
  };
}
