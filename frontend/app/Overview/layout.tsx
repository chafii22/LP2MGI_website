import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Laboratory Overview",
  description:
    "Discover LP2MGI's mission, vision, leadership, and institutional role in scientific innovation.",
  path: "/Overview",
  keywords: ["LP2MGI overview", "lab mission", "research vision"],
});

export default function OverviewLayout({ children }: { children: ReactNode }) {
  return children;
}
