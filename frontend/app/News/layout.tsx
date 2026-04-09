import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "News and Updates",
  description:
    "Read the latest LP2MGI news, research highlights, events, and scientific announcements.",
  path: "/News",
  keywords: ["LP2MGI news", "research updates", "scientific events"],
});

export default function NewsLayout({ children }: { children: ReactNode }) {
  return children;
}
