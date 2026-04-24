import HomeClient from './HomeClient';
import { getHomeContent, getTeams, type HomeContent, type TeamListItem } from '@/lib/api';

export const dynamic = 'force-dynamic';

type HomeServerData = {
  homeContent: HomeContent | null;
  teams: TeamListItem[];
  homeFailed: boolean;
  teamsFailed: boolean;
};

async function loadHomeServerData(): Promise<HomeServerData> {
  const [homeResult, teamsResult] = await Promise.allSettled([getHomeContent(), getTeams()]);

  return {
    homeContent: homeResult.status === 'fulfilled' ? homeResult.value : null,
    teams: teamsResult.status === 'fulfilled' ? teamsResult.value : [],
    homeFailed: homeResult.status === 'rejected',
    teamsFailed: teamsResult.status === 'rejected',
  };
}

export default async function HomePage() {
  const data = await loadHomeServerData();

  return (
    <HomeClient
      initialHomeContent={data.homeContent}
      initialTeams={data.teams}
      homeFailed={data.homeFailed}
      teamsFailed={data.teamsFailed}
    />
  );
}
