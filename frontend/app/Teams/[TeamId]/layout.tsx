import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getTeamBySlug } from "@/lib/api";
import { buildPageMetadata } from "@/lib/seo";

type RouteParams = { TeamId: string };

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
  const teamSlug = resolved.TeamId || "";

  if (!teamSlug) {
    return buildPageMetadata({
      title: "Team Details",
      description: "Explore LP2MGI team details and members.",
      path: "/Teams",
      noIndex: true,
    });
  }

  try {
    const team = await getTeamBySlug(teamSlug);
    return buildPageMetadata({
      title: team.title,
      description:
        team.overview ||
        team.focus ||
        "Explore this LP2MGI team, its members, and research focus.",
      path: `/Teams/${team.slug}`,
      keywords: ["LP2MGI team", team.title, team.focus || "research"],
    });
  } catch {
    const fallbackTitle = formatSlug(teamSlug);
    return buildPageMetadata({
      title: `${fallbackTitle} Team`,
      description: "Explore LP2MGI team details and members.",
      path: `/Teams/${teamSlug}`,
      noIndex: true,
    });
  }
}

export default function TeamDetailLayout({ children }: { children: ReactNode }) {
  return children;
}
