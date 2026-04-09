import type { MetadataRoute } from "next";
import { getNews, getTeamBySlug, getTeams } from "@/lib/api";
import { absoluteUrl } from "@/lib/seo";

type StaticRoute = {
  path: string;
  changeFrequency: "daily" | "weekly" | "monthly" | "yearly";
  priority: number;
};

const staticRoutes: StaticRoute[] = [
  // Mirrors the functional perimeter from the LP2MGI project brief.
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/Overview", changeFrequency: "monthly", priority: 0.9 },
  { path: "/Teams", changeFrequency: "weekly", priority: 0.9 },
  { path: "/Publications", changeFrequency: "weekly", priority: 0.88 },
  { path: "/Platform", changeFrequency: "monthly", priority: 0.8 },
  { path: "/News", changeFrequency: "daily", priority: 0.9 },
  { path: "/Contact", changeFrequency: "yearly", priority: 0.7 },
  { path: "/Members", changeFrequency: "monthly", priority: 0.68 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const seen = new Set<string>();

  const entries: MetadataRoute.Sitemap = [];

  for (const route of staticRoutes) {
    const url = absoluteUrl(route.path);
    if (seen.has(url)) {
      continue;
    }

    seen.add(url);
    entries.push({
      url,
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    });
  }

  try {
    const [newsItems, teams] = await Promise.all([getNews(), getTeams()]);

    for (const item of newsItems.filter((news) => news.is_published)) {
      const url = absoluteUrl(`/News/${item.slug}`);
      if (seen.has(url)) {
        continue;
      }

      seen.add(url);
      entries.push({
        url,
        lastModified: item.updated_at ? new Date(item.updated_at) : now,
        changeFrequency: "weekly",
        priority: 0.78,
      });
    }

    const teamDetailsResults = await Promise.allSettled(
      teams.filter((team) => team.is_active).map((team) => getTeamBySlug(team.slug)),
    );

    for (const result of teamDetailsResults) {
      if (result.status !== "fulfilled") {
        continue;
      }

      const team = result.value;
      const teamUrl = absoluteUrl(`/Teams/${team.slug}`);

      if (!seen.has(teamUrl)) {
        seen.add(teamUrl);
        entries.push({
          url: teamUrl,
          lastModified: now,
          changeFrequency: "weekly",
          priority: 0.8,
        });
      }

      for (const member of team.members.filter((person) => person.is_active)) {
        const memberUrl = absoluteUrl(`/Teams/${team.slug}/${member.id}`);
        if (seen.has(memberUrl)) {
          continue;
        }

        seen.add(memberUrl);
        entries.push({
          url: memberUrl,
          lastModified: now,
          changeFrequency: "monthly",
          priority: 0.62,
        });
      }
    }
  } catch {
    return entries;
  }

  return entries;
}
