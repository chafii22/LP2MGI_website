import type { Metadata } from "next";

const DEFAULT_SITE_URL = "http://localhost:3000";

function normalizeSiteUrl(rawUrl: string | undefined): string {
  const value = (rawUrl || DEFAULT_SITE_URL).trim();

  try {
    const parsed = new URL(value);
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export const siteUrl = normalizeSiteUrl(
  process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_SITE_URL,
);

export const siteName = "LP2MGI Laboratory";
export const siteTitle = "LP2MGI Laboratory | Research and Innovation";
export const siteDescription =
  "Official website of LP2MGI Laboratory at EST Casablanca. Explore research teams, members, publications, scientific news, and collaboration opportunities.";

export const defaultKeywords = [
  "LP2MGI",
  "EST Casablanca",
  "Hassan II University",
  "research laboratory",
  "scientific publications",
  "research teams",
  "Morocco research",
  "innovation",
];

export function absoluteUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl}${normalizedPath}`;
}

type PageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  noIndex?: boolean;
  type?: "website" | "article";
};

export function buildPageMetadata({
  title,
  description,
  path,
  keywords,
  noIndex,
  type = "website",
}: PageMetadataOptions): Metadata {
  return {
    title,
    description,
    keywords: keywords || defaultKeywords,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl(path),
      siteName,
      type,
      locale: "en_US",
      images: [
        {
          url: absoluteUrl("/Logo_ESTC.png"),
          alt: `${siteName} logo`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteUrl("/Logo_ESTC.png")],
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
    },
  };
}
