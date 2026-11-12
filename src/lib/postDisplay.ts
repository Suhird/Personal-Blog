import type { BlogPost } from "@/components/BlogCard";

const shortDate = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

const longDate = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

const dateFrom = (value: string) => new Date(`${value}T00:00:00Z`);

export const formatPostDate = (value: string): string => {
  const date = dateFrom(value);
  return Number.isNaN(date.getTime()) ? value : shortDate.format(date);
};

export const formatPostDateLong = (value: string): string => {
  const date = dateFrom(value);
  return Number.isNaN(date.getTime()) ? value : longDate.format(date);
};

export const categoryLabel = (category?: BlogPost["category"]): string =>
  category === "life" ? "Beyond Code" : "Tech";

export const byNewest = (a: BlogPost, b: BlogPost): number =>
  dateFrom(b.date).getTime() - dateFrom(a.date).getTime();

export const uniqueTags = (posts: BlogPost[]): string[] =>
  Array.from(new Set(posts.flatMap((post) => post.tags))).sort((a, b) =>
    a.localeCompare(b),
  );
