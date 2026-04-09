import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getTeamBySlug } from "@/lib/api";
import { buildPageMetadata } from "@/lib/seo";

type RouteParams = { TeamId: string; MemberId: string };

type LayoutProps = {
  children: ReactNode;
  params: RouteParams | Promise<RouteParams>;
};

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const resolved = await params;
  const teamSlug = resolved.TeamId || "";
  const memberId = Number(resolved.MemberId);

  if (!teamSlug || !Number.isInteger(memberId) || memberId <= 0) {
    return buildPageMetadata({
      title: "Member Profile",
      description: "LP2MGI researcher profile.",
      path: "/Members",
      noIndex: true,
    });
  }

  try {
    const team = await getTeamBySlug(teamSlug);
    const member = team.members.find((item) => item.id === memberId);

    if (!member) {
      return buildPageMetadata({
        title: "Member Profile",
        description: "LP2MGI researcher profile.",
        path: `/Teams/${teamSlug}/${memberId}`,
        noIndex: true,
      });
    }

    return buildPageMetadata({
      title: `${member.full_name} | ${team.title}`,
      description:
        member.biography ||
        member.expertise ||
        `${member.full_name} profile in ${team.title} at LP2MGI Laboratory.`,
      path: `/Teams/${team.slug}/${member.id}`,
      keywords: ["LP2MGI member", member.full_name, team.title],
    });
  } catch {
    return buildPageMetadata({
      title: "Member Profile",
      description: "LP2MGI researcher profile.",
      path: `/Teams/${teamSlug}/${memberId}`,
      noIndex: true,
    });
  }
}

export default function MemberDetailLayout({ children }: { children: ReactNode }) {
  return children;
}
