import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Members Directory",
  description:
    "Browse LP2MGI Laboratory members, explore expertise areas, and navigate researchers by team and role.",
  path: "/Members",
  keywords: ["LP2MGI members", "researchers", "team directory"],
});

export default function MembersLayout({ children }: { children: ReactNode }) {
  return children;
}
