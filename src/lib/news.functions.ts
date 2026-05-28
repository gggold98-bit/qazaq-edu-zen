import { createServerFn } from "@tanstack/react-start";

export type NewsItem = {
  title: string;
  url: string;
  image?: string;
  date?: string;
};

const SOURCE_URL = "https://pedagog-kz.kz/category/news";

function decode(s: string) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim();
}

export const fetchPedagogNews = createServerFn({ method: "GET" })
  .handler(async (): Promise<{ items: NewsItem[] }> => {
    try {
      const res = await fetch(SOURCE_URL, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; QazaqTeachersBot/1.0; +https://qazaq-edu-zen.lovable.app)",
        },
      });
      if (!res.ok) return { items: [] };
      const html = await res.text();

      const articleRe = /<article[\s\S]*?<\/article>/g;
      const items: NewsItem[] = [];
      const matches = html.match(articleRe) ?? [];

      for (const block of matches) {
        const imgMatch = block.match(
          /background-image:\s*url\(([^)]+)\)/,
        );
        const linkMatch = block.match(
          /<h5[^>]*class="post-title[\s\S]*?<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/,
        );
        const dateMatch = block.match(
          /<span class="post-on">([^<]+)<\/span>/,
        );
        if (!linkMatch) continue;
        items.push({
          url: linkMatch[1].trim(),
          title: decode(linkMatch[2].replace(/<[^>]+>/g, "")),
          image: imgMatch?.[1]?.trim(),
          date: dateMatch ? decode(dateMatch[1]) : undefined,
        });
        if (items.length >= 8) break;
      }

      return { items };
    } catch {
      return { items: [] };
    }
  });
