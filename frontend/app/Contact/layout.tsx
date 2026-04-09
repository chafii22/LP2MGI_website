import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact LP2MGI",
  description:
    "Get in touch with LP2MGI Laboratory for research collaboration opportunities, scientific partnerships, and inquiries.",
  path: "/Contact",
  keywords: ["contact LP2MGI", "research collaboration", "EST Casablanca"],
});

export default function ContactLayout({ children }: { children: ReactNode }) {
  return children;
}
