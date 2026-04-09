import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Platforms and Equipment",
  description:
    "Explore LP2MGI platforms, equipment, projects, events, and gallery highlights supporting research activities.",
  path: "/Platform",
  keywords: ["research platform", "lab equipment", "LP2MGI projects"],
});

export default function PlatformLayout({ children }: { children: ReactNode }) {
  return children;
}
