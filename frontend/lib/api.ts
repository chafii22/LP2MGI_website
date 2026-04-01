export type TeamListItem = {
  id: number;
  slug: string;
  title: string;
  short_name: string;
  lead_name: string;
  focus: string;
  domain: string;
  overview: string;
  members_count: number;
};

export type TeamMember = {
  id: number;
  full_name: string;
  role: string;
  expertise: string;
  email: string;
  photo_url: string;
  is_active: boolean;
  is_leader: boolean;
  order: number;
};

export type TeamDetail = TeamListItem & {
  members: TeamMember[];
};

export type NewsItem = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  cover_image_url: string;
  category: string | null;
  tags: string[];
  authors: Array<{
    id: number;
    full_name: string;
    role: string;
    expertise: string;
    email: string;
    photo_url: string;
    is_active: boolean;
  }>;
  published_at: string | null;
  is_published: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
};

export type HomeContent = {
  hero: {
    id: number;
    subtitle: string;
    title: string;
    description: string;
    button_label: string;
    button_link: string;
    background_image_url: string;
    is_active: boolean;
  } | null;
  metrics: Array<{
    id: number;
    label: string;
    value: string;
    order: number;
    is_active: boolean;
  }>;
  featured_news: NewsItem[];
};

export type ContactMessagePayload = {
  full_name: string;
  email: string;
  subject: string;
  message: string;
};

type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "/api";

function toApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${normalizedPath}`;
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(toApiUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function normalizeList<T>(payload: T[] | Paginated<T>): T[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  return payload.results;
}

export async function getHomeContent(): Promise<HomeContent> {
  return requestJson<HomeContent>("/home/");
}

export async function getTeams(): Promise<TeamListItem[]> {
  const payload = await requestJson<TeamListItem[] | Paginated<TeamListItem>>("/teams/");
  return normalizeList(payload);
}

export async function getTeamBySlug(slug: string): Promise<TeamDetail> {
  return requestJson<TeamDetail>(`/teams/${slug}/`);
}

export async function getNews(featured?: boolean): Promise<NewsItem[]> {
  const suffix = featured ? "?featured=true" : "";
  const payload = await requestJson<NewsItem[] | Paginated<NewsItem>>(`/news/${suffix}`);
  return normalizeList(payload);
}

export async function getNewsBySlug(slug: string): Promise<NewsItem> {
  return requestJson<NewsItem>(`/news/${slug}/`);
}

export async function createContactMessage(payload: ContactMessagePayload): Promise<{ id: number; message: string }> {
  return requestJson<{ id: number; message: string }>("/contact/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
