import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getNewsBySlug } from "@/lib/api";
import { buildPageMetadata } from "@/lib/seo";

type RouteParams = { slug: string };

type LayoutProps = {
  children: ReactNode;
  params: RouteParams | Promise<RouteParams>;
};

function formatSlug(slug: string): string {
  return decodeURIComponent(slug)
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const resolved = await params;
  const slug = resolved.slug || "";

  if (!slug) {
    return buildPageMetadata({
      title: "News Article",
      description: "Read LP2MGI scientific news and updates.",
      path: "/News",
      noIndex: true,
    });
  }

  try {
    const article = await getNewsBySlug(slug);
    return buildPageMetadata({
      title: article.title,
      description: article.excerpt || article.body || "Read the full LP2MGI article.",
      path: `/News/${article.slug}`,
      type: "article",
      keywords: ["LP2MGI news", article.category || "research"],
    });
  } catch {
    const fallbackTitle = formatSlug(slug);
    return buildPageMetadata({
      title: `${fallbackTitle} | News`,
      description: "Read LP2MGI scientific news and updates.",
      path: `/News/${slug}`,
      noIndex: true,
    });
  }
}

export default function NewsDetailLayout({ children }: { children: ReactNode }) {
  return children;
}
