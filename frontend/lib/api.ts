export type TeamListItem = {
  id: number;
  slug: string;
  title: string;
  short_name: string;
  tags: string[];
  lead_name: string;
  focus: string;
  domain: string;
  overview: string;
  order: number;
  is_active: boolean;
  members_count: number;
};

export type TeamMember = {
  id: number;
  full_name: string;
  role: string;
  expertise: string;
  email: string;
  photo_url: string;
  biography?: string;
  highlight_quote?: string;
  research_interests?: string[];
  milestones?: Array<{
    date: string;
    label: string;
    value: string;
  }>;
  researchgate_url?: string;
  google_scholar_url?: string;
  orcid_url?: string;
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

export type OverviewContent = {
  id: number;
  header_subtitle: string;
  header_title: string;
  header_description: string;
  director_name: string;
  director_role: string;
  director_photo_url: string;
  director_intro: string;
  director_quote: string;
  director_body: string;
  mission_title: string;
  mission_description: string;
  mission_points: string[];
  vision_title: string;
  vision_description: string;
  vision_points: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ContactMessagePayload = {
  full_name: string;
  email: string;
  subject: string;
  message: string;
};

export type PublicationItem = {
  id: number;
  slug: string;
  title: string;
  publication_type: string;
  year: number | null;
  abstract: string;
  file_pdf_url: string;
  team_slug: string | null;
  is_published: boolean;
  authors: Array<{
    id: number;
    full_name: string;
    role: string;
    expertise: string;
    email: string;
    photo_url: string;
    is_active: boolean;
    order: number;
  }>;
  created_at: string;
  updated_at: string;
};

export type ProjectItem = {
  id: number;
  slug: string;
  title: string;
  description: string;
  date_start: string | null;
  date_end: string | null;
  status: string;
  team_slug: string;
  is_active: boolean;
};

export type EventItem = {
  id: number;
  slug: string;
  title: string;
  event_date: string | null;
  location: string;
  description: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type ContentPageItem = {
  id: number;
  slug: string;
  title: string;
  content: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type GalleryItem = {
  id: number;
  slug: string;
  title: string;
  description: string;
  is_published: boolean;
  images: Array<{
    id: number;
    image_url: string;
    caption: string;
    order: number;
    is_active: boolean;
  }>;
  created_at: string;
  updated_at: string;
};

type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

const configuredApiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

function normalizeApiBase(base: string): string {
  const trimmed = base.trim().replace(/\/$/, "");

  if (!/^https?:\/\//i.test(trimmed)) {
    return trimmed || "/api";
  }

  try {
    const parsed = new URL(trimmed);
    if (!parsed.pathname || parsed.pathname === "/") {
      parsed.pathname = "/api";
      return parsed.toString().replace(/\/$/, "");
    }
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return trimmed || "/api";
  }
}

function getApiBaseCandidates(): string[] {
  const primary = normalizeApiBase(configuredApiBase || "/api");
  const candidates = [primary];

  const browserHostname =
    typeof window !== "undefined" ? window.location.hostname.trim() : "";

  if (browserHostname && browserHostname !== "localhost" && browserHostname !== "127.0.0.1") {
    const hostFallback = `http://${browserHostname}:8000/api`;
    if (!candidates.includes(hostFallback)) {
      candidates.push(hostFallback);
    }
  }

  const devFallbacks = ["http://127.0.0.1:8000/api", "http://localhost:8000/api"];
  for (const fallback of devFallbacks) {
    if (!candidates.includes(fallback)) {
      candidates.push(fallback);
    }
  }

  return candidates;
}

function ensureTrailingSlash(path: string): string {
  const [pathname, suffix = ""] = path.split(/([?#].*)/, 2);
  const normalizedPathname = pathname.endsWith("/") ? pathname : `${pathname}/`;
  return `${normalizedPathname}${suffix}`;
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const hasBody = init?.body !== undefined && init?.body !== null;
  const headers = new Headers(init?.headers);
  if (hasBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const pathWithSlash = ensureTrailingSlash(normalizedPath);

  let lastError: unknown;
  for (const base of getApiBaseCandidates()) {
    const url = `${base}${pathWithSlash}`;

    try {
      const response = await fetch(url, {
        ...init,
        headers,
      });

      if (!response.ok) {
        lastError = new Error(`Request failed (${response.status}) for ${url}`);
        continue;
      }

      return response.json() as Promise<T>;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Request failed for all API bases");
}

function normalizeList<T>(payload: T[] | Paginated<T>): T[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  return payload.results;
}

export async function getHomeContent(): Promise<HomeContent> {
  return requestJson<HomeContent>("/home");
}

export async function getOverviewContent(): Promise<OverviewContent | null> {
  return requestJson<OverviewContent | null>("/overview");
}

export async function getTeams(): Promise<TeamListItem[]> {
  const payload = await requestJson<TeamListItem[] | Paginated<TeamListItem>>("/teams");
  return normalizeList(payload);
}

export async function getTeamBySlug(slug: string): Promise<TeamDetail> {
  return requestJson<TeamDetail>(`/teams/${slug}`);
}

export async function getNews(featured?: boolean): Promise<NewsItem[]> {
  const suffix = featured ? "?featured=true" : "";
  const payload = await requestJson<NewsItem[] | Paginated<NewsItem>>(`/news${suffix}`);
  return normalizeList(payload);
}

export async function getNewsBySlug(slug: string): Promise<NewsItem> {
  return requestJson<NewsItem>(`/news/${slug}`);
}

export async function createContactMessage(payload: ContactMessagePayload): Promise<{ id: number; message: string }> {
  return requestJson<{ id: number; message: string }>("/contact", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getPublications(): Promise<PublicationItem[]> {
  const payload = await requestJson<PublicationItem[] | Paginated<PublicationItem>>("/publications");
  return normalizeList(payload);
}

export async function getProjects(): Promise<ProjectItem[]> {
  const payload = await requestJson<ProjectItem[] | Paginated<ProjectItem>>("/projects");
  return normalizeList(payload);
}

export async function getEvents(): Promise<EventItem[]> {
  const payload = await requestJson<EventItem[] | Paginated<EventItem>>("/events");
  return normalizeList(payload);
}

export async function getContentPages(): Promise<ContentPageItem[]> {
  const payload = await requestJson<ContentPageItem[] | Paginated<ContentPageItem>>("/pages");
  return normalizeList(payload);
}

export async function getGalleries(): Promise<GalleryItem[]> {
  const payload = await requestJson<GalleryItem[] | Paginated<GalleryItem>>("/galleries");
  return normalizeList(payload);
}
