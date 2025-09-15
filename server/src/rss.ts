import Parser from "rss-parser";
import { cache } from "./utils/cache";
import { NewsCategory, NewsItem } from "./types";

// RSS取得＆正規化。部分成功OK、0件ならモックにフォールバック。

const parser = new Parser();

const FEED_ENV_MAP: Record<NewsCategory, string> = {
  ai: "AI_NEWS_FEEDS",
  economy: "ECONOMY_NEWS_FEEDS",
  ikehaya: "IKEHAYA_NEWS_FEEDS",
};

function readTTL(): number {
  const v = Number(process.env.CACHE_TTL_SECONDS || 300);
  return Number.isFinite(v) && v > 0 ? v : 300;
}

function parseFeedList(raw?: string): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function hostFromUrl(url?: string): string {
  try {
    if (!url) return "";
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

async function fetchOneFeed(url: string): Promise<NewsItem[]> {
  try {
    const feed = await parser.parseURL(url);
    const source = feed.title || hostFromUrl(feed.link || url) || hostFromUrl(url);
    const items: NewsItem[] = (feed.items || [])
      .map((it) => {
        const iso = (it.isoDate || it.pubDate || "").toString();
        return {
          title: it.title || "(no title)",
          link: it.link || url,
          source,
          isoDate: iso,
          summary: (it.contentSnippet || it.content || "").toString().slice(0, 280),
        } as NewsItem;
      })
      .filter((x) => x.link && x.isoDate);
    return items;
  } catch (e) {
    console.error("[rss] feed fetch failed:", url, e);
    return [];
  }
}

export async function getNews(category: NewsCategory, { force = false }: { force?: boolean } = {}): Promise<NewsItem[]> {
  const cacheKey = `news:${category}`;
  const ttl = readTTL();

  if (!force) {
    const hit = cache.get<NewsItem[]>(cacheKey);
    if (hit) return hit;
  }

  const envKey = FEED_ENV_MAP[category];
  const feeds = parseFeedList(process.env[envKey]);

  let results: NewsItem[] = [];
  if (feeds.length > 0) {
    const settled = await Promise.allSettled(feeds.map((f) => fetchOneFeed(f)));
    for (const s of settled) {
      if (s.status === "fulfilled") results.push(...s.value);
      else console.error("[rss] feed error:", s.reason);
    }
  }

  // 降順ソート＆最大20件
  results = results
    .sort((a, b) => (a.isoDate < b.isoDate ? 1 : -1))
    .slice(0, 20);

  if (results.length === 0) {
    const { mockNews } from "./mock";
    results = mockNews[category];
  }

  cache.set(cacheKey, results, ttl);
  return results;
}

