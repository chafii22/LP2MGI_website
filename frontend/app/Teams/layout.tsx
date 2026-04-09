import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Research Teams",
  description:
    "Explore LP2MGI multidisciplinary research teams, domains, leads, and active scientific units.",
  path: "/Teams",
  keywords: ["LP2MGI teams", "research units", "scientific domains"],
});

export default function TeamsLayout({ children }: { children: ReactNode }) {
  return children;
}
