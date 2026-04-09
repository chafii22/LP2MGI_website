import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Scientific Publications",
  description:
    "Access LP2MGI scientific publications, categorized by type and year, with contributors and abstracts.",
  path: "/Publications",
  keywords: ["scientific publications", "LP2MGI research papers", "journal conference"],
});

export default function PublicationsLayout({ children }: { children: ReactNode }) {
  return children;
}
