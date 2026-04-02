"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
	BookOpenText,
	BriefcaseBusiness,
	ChevronRight,
	ExternalLink,
	FlaskConical,
	Globe,
	GraduationCap,
	Mail,
	UserRound,
} from "lucide-react";
import styles from "./memberprofile.module.css";
import {
	getProjects,
	getPublications,
	getTeamBySlug,
	type ProjectItem,
	type PublicationItem,
	type TeamDetail,
	type TeamMember,
} from "@/lib/api";

type PublicationFilter = "all" | PublicationItem["publication_type"];

const publicationFilterOrder: PublicationFilter[] = [
	"all",
	"journal",
	"conference",
	"book",
	"thesis",
	"other",
];

function getInitials(name: string): string {
	return name
		.split(" ")
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase() ?? "")
		.join("");
}

function formatPublicationType(value: PublicationItem["publication_type"]): string {
	switch (value) {
		case "journal":
			return "Journal";
		case "conference":
			return "Conference";
		case "book":
			return "Book";
		case "thesis":
			return "Thesis";
		default:
			return "Other";
	}
}

function formatProjectStatus(status: string): string {
	switch (status) {
		case "ongoing":
			return "Ongoing";
		case "completed":
			return "Completed";
		case "planned":
			return "Planned";
		default:
			return "Unknown";
	}
}

function splitTopics(value: string): string[] {
	return value
		.split(/[,;/|]+/)
		.map((token) => token.trim())
		.filter(Boolean);
}

function extractYear(dateValue: string | null): number | null {
	if (!dateValue) {
		return null;
	}

	const parsedDate = new Date(dateValue);
	const year = parsedDate.getFullYear();

	if (!Number.isFinite(year)) {
		return null;
	}

	return year;
}

function isValidMilestone(
	value: unknown
): value is {
	date: string;
	label: string;
	value: string;
} {
	if (!value || typeof value !== "object") {
		return false;
	}

	const candidate = value as Record<string, unknown>;

	return (
		typeof candidate.date === "string" &&
		typeof candidate.label === "string" &&
		typeof candidate.value === "string"
	);
}

export default function MemberProfilePage() {
	const params = useParams<{ TeamId: string; MemberId: string }>();
	const teamSlug = Array.isArray(params?.TeamId) ? params.TeamId[0] : params?.TeamId;
	const memberIdParam = Array.isArray(params?.MemberId) ? params.MemberId[0] : params?.MemberId;
	const parsedMemberId = Number(memberIdParam);

	const [team, setTeam] = useState<TeamDetail | null>(null);
	const [member, setMember] = useState<TeamMember | null>(null);
	const [publications, setPublications] = useState<PublicationItem[]>([]);
	const [projects, setProjects] = useState<ProjectItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [hasError, setHasError] = useState(false);
	const [publicationFilter, setPublicationFilter] = useState<PublicationFilter>("all");

	useEffect(() => {
		if (!teamSlug || !Number.isInteger(parsedMemberId) || parsedMemberId <= 0) {
			setIsLoading(false);
			setHasError(false);
			setTeam(null);
			setMember(null);
			return;
		}

		let isMounted = true;

		const loadData = async () => {
			try {
				setIsLoading(true);
				setHasError(false);

				const [teamData, publicationData, projectData] = await Promise.all([
					getTeamBySlug(teamSlug),
					getPublications(),
					getProjects(),
				]);

				if (!isMounted) {
					return;
				}

				const selectedMember = teamData.members.find((person) => person.id === parsedMemberId) ?? null;
				setTeam(teamData);
				setMember(selectedMember);
				setPublications(publicationData);
				setProjects(projectData);
			} catch {
				if (isMounted) {
					setHasError(true);
					setTeam(null);
					setMember(null);
					setPublications([]);
					setProjects([]);
				}
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		};

		loadData();

		return () => {
			isMounted = false;
		};
	}, [teamSlug, parsedMemberId]);

	const memberPublications = useMemo(() => {
		if (!member) {
			return [];
		}

		return publications.filter((publication) => publication.authors.some((author) => author.id === member.id));
	}, [member, publications]);

	const publicationFilters = useMemo<PublicationFilter[]>(() => {
		const available = new Set<PublicationFilter>(["all"]);

		for (const publication of memberPublications) {
			available.add(publication.publication_type);
		}

		return publicationFilterOrder.filter((item) => available.has(item));
	}, [memberPublications]);

	useEffect(() => {
		if (!publicationFilters.includes(publicationFilter)) {
			setPublicationFilter("all");
		}
	}, [publicationFilter, publicationFilters]);

	const filteredPublications = useMemo(() => {
		if (publicationFilter === "all") {
			return memberPublications;
		}

		return memberPublications.filter((publication) => publication.publication_type === publicationFilter);
	}, [memberPublications, publicationFilter]);

	const memberProjects = useMemo(() => {
		if (!team?.slug) {
			return [];
		}

		return projects.filter((project) => project.team_slug === team.slug);
	}, [projects, team?.slug]);

	const interestTags = useMemo(() => {
		const apiInterests = (member?.research_interests || []).filter(
			(interest): interest is string => typeof interest === "string" && interest.trim().length > 0
		);

		if (apiInterests.length) {
			return Array.from(new Set(apiInterests)).slice(0, 8);
		}

		const sourceValues = [member?.expertise || "", team?.focus || "", team?.domain || "", ...(team?.tags || [])];
		const normalized = new Set<string>();

		for (const value of sourceValues) {
			const tokens = splitTopics(value);
			for (const token of tokens) {
				if (token.length >= 3) {
					normalized.add(token);
				}
			}
		}

		return Array.from(normalized).slice(0, 8);
	}, [member?.expertise, member?.research_interests, team?.domain, team?.focus, team?.tags]);

	const biographyParagraphs = useMemo(() => {
		if (!member || !team) {
			return [];
		}

		if (member.biography?.trim()) {
			const apiParagraphs = member.biography
				.split(/\n{2,}/)
				.map((paragraph) => paragraph.trim())
				.filter(Boolean);

			if (member.highlight_quote?.trim()) {
				apiParagraphs.push(`\"${member.highlight_quote.trim()}\"`);
			}

			if (apiParagraphs.length > 0) {
				return apiParagraphs;
			}
		}

		const paragraphs: string[] = [];

		paragraphs.push(
			`${member.full_name} is a ${member.role.toLowerCase()} in ${team.title}, contributing to research activities and collaborative scientific work.`
		);

		if (member.expertise) {
			paragraphs.push(`Main expertise areas include ${member.expertise}.`);
		}

		if (team.overview) {
			paragraphs.push(`Within the team, the work context focuses on ${team.overview}`);
		}

		if (paragraphs.length < 3) {
			paragraphs.push("The full biography is being enriched and will be updated with detailed milestones and achievements.");
		}

		return paragraphs;
	}, [member, team]);

	const profileLinks = useMemo(() => {
		if (!member) {
			return [];
		}

		const query = encodeURIComponent(member.full_name);

		return [
			{
				label: "ResearchGate",
				href: member.researchgate_url?.trim() || `https://www.researchgate.net/search/researcher?q=${query}`,
				icon: FlaskConical,
			},
			{
				label: "Google Scholar",
				href: member.google_scholar_url?.trim() || `https://scholar.google.com/scholar?q=${query}`,
				icon: GraduationCap,
			},
			{
				label: "ORCID",
				href: member.orcid_url?.trim() || `https://orcid.org/orcid-search/search?searchQuery=${query}`,
				icon: Globe,
			},
		];
	}, [member]);

	const backgroundTimeline = useMemo(() => {
		if (!member || !team) {
			return [];
		}

		const apiMilestones = (member.milestones || []).filter(isValidMilestone).map((milestone) => ({
			date: milestone.date.trim(),
			label: milestone.label.trim(),
			value: milestone.value.trim(),
		}));

		if (apiMilestones.length > 0) {
			return apiMilestones;
		}

		const projectStartYears = memberProjects
			.map((project) => extractYear(project.date_start))
			.filter((year): year is number => year !== null);
		const projectEndYears = memberProjects
			.map((project) => extractYear(project.date_end))
			.filter((year): year is number => year !== null);
		const publicationYears = memberPublications
			.map((publication) => publication.year)
			.filter((year): year is number => typeof year === "number");

		const earliestProjectYear = projectStartYears.length ? Math.min(...projectStartYears) : null;
		const latestProjectYear = [...projectStartYears, ...projectEndYears].length
			? Math.max(...projectStartYears, ...projectEndYears)
			: null;
		const earliestPublicationYear = publicationYears.length ? Math.min(...publicationYears) : null;
		const latestPublicationYear = publicationYears.length ? Math.max(...publicationYears) : null;

		const rows = [
			{
				date: latestProjectYear ? `${latestProjectYear} - Present` : "Present",
				label: "Current Position",
				value: `${member.role} at ${team.title}`,
			},
			{
				date: earliestProjectYear ? `${earliestProjectYear} - Present` : "Ongoing",
				label: "Research Area",
				value: team.focus || team.domain || "Research focus is being updated.",
			},
			{
				date:
					earliestPublicationYear && latestPublicationYear
						? earliestPublicationYear === latestPublicationYear
							? String(earliestPublicationYear)
							: `${earliestPublicationYear} - ${latestPublicationYear}`
						: "Recent",
				label: "Primary Expertise",
				value: member.expertise || "Expertise details are being updated.",
			},
		];

		if (member.is_leader) {
			rows.unshift({
				date: earliestProjectYear ? `${earliestProjectYear} - Present` : "Present",
				label: "Leadership",
				value: `Leads coordination activities for ${team.title}.`,
			});
		}

		return rows;
	}, [member, memberProjects, memberPublications, team]);

	if (!teamSlug || !Number.isInteger(parsedMemberId) || parsedMemberId <= 0) {
		return (
			<main className={styles.mainContainer}>
				<section className={styles.headerSection}>
					<div className={styles.sectionInner}>
						<nav className={styles.breadcrumb} aria-label="Breadcrumb">
							<Link href="/">Home</Link>
							<ChevronRight size={14} />
							<Link href="/Teams">Teams</Link>
							<ChevronRight size={14} />
							<span className={styles.currentPath}>Unknown Member</span>
						</nav>
						<p className={styles.subtitle}>Member Profile</p>
						<h1 className={styles.title}>Invalid Member URL</h1>
						<p className={styles.leadText}>Please open this page from a team member card in the Teams section.</p>
					</div>
				</section>
			</main>
		);
	}

	if (hasError) {
		return (
			<main className={styles.mainContainer}>
				<section className={styles.headerSection}>
					<div className={styles.sectionInner}>
						<nav className={styles.breadcrumb} aria-label="Breadcrumb">
							<Link href="/">Home</Link>
							<ChevronRight size={14} />
							<Link href="/Teams">Teams</Link>
							<ChevronRight size={14} />
							<span className={styles.currentPath}>Unavailable</span>
						</nav>
						<p className={styles.subtitle}>Member Profile</p>
						<h1 className={styles.title}>Member Data Unavailable</h1>
						<p className={styles.leadText}>Unable to load this member profile from the API right now.</p>
					</div>
				</section>
			</main>
		);
	}

	if (!isLoading && (!team || !member)) {
		return (
			<main className={styles.mainContainer}>
				<section className={styles.headerSection}>
					<div className={styles.sectionInner}>
						<nav className={styles.breadcrumb} aria-label="Breadcrumb">
							<Link href="/">Home</Link>
							<ChevronRight size={14} />
							<Link href="/Teams">Teams</Link>
							<ChevronRight size={14} />
							<span className={styles.currentPath}>Not Found</span>
						</nav>
						<p className={styles.subtitle}>Member Profile</p>
						<h1 className={styles.title}>Member Not Found</h1>
						<p className={styles.leadText}>This member does not exist in the selected team.</p>
					</div>
				</section>
			</main>
		);
	}

	return (
		<main className={styles.mainContainer}>
			<section className={styles.headerSection}>
				<div className={styles.sectionInner}>
					<nav className={styles.breadcrumb} aria-label="Breadcrumb">
						<Link href="/">Home</Link>
						<ChevronRight size={14} />
						<Link href="/Teams">Teams</Link>
						<ChevronRight size={14} />
						<Link href={`/Teams/${team?.slug || teamSlug}`}>{team?.title || "Team"}</Link>
						<ChevronRight size={14} />
						<span className={styles.currentPath}>{member?.full_name || "Member"}</span>
					</nav>

					<div className={styles.heroCard}>
						<div className={styles.avatarWrap}>
							{member?.photo_url ? (
								// eslint-disable-next-line @next/next/no-img-element
								<img src={member.photo_url} alt={member.full_name} className={styles.avatarImage} />
							) : (
								<div className={styles.avatarFallback}>{member ? getInitials(member.full_name) : "--"}</div>
							)}
						</div>

						<div className={styles.heroBody}>
							<p className={styles.subtitle}>Member Profile</p>
							<h1 className={styles.title}>{isLoading ? "Loading profile..." : member?.full_name}</h1>
							<p className={styles.roleLine}>{member?.role || "Role unavailable"}</p>
							<p className={styles.leadText}>
								{member?.is_leader
									? `${member.full_name} coordinates research activities as team leader in ${team?.title}.`
									: `${member?.full_name} contributes to research efforts in ${team?.title}.`}
							</p>
						</div>

						<aside className={styles.heroFacts}>
							<div className={styles.factItem}>
								<span className={styles.factIcon}>
									<UserRound size={16} />
								</span>
								<div>
									<p className={styles.factLabel}>Team</p>
									<p className={styles.factValue}>{team?.short_name || team?.title || "-"}</p>
								</div>
							</div>

							<div className={styles.factItem}>
								<span className={styles.factIcon}>
									<Mail size={16} />
								</span>
								<div>
									<p className={styles.factLabel}>Email</p>
									{member?.email ? (
										<a className={styles.factLink} href={`mailto:${member.email}`}>
											{member.email}
										</a>
									) : (
										<p className={styles.factValue}>Not available</p>
									)}
								</div>
							</div>

							<div className={styles.factItem}>
								<span className={styles.factIcon}>
									<ExternalLink size={16} />
								</span>
								<div>
									<p className={styles.factLabel}>Profiles</p>
									<div className={styles.profileActions}>
										{profileLinks.map((link) => {
											const Icon = link.icon;

											return (
												<a
													key={link.label}
													href={link.href}
													target="_blank"
													rel="noreferrer"
													className={styles.profileIconLink}
													aria-label={`Open ${link.label} profile search for ${member?.full_name}`}
													title={link.label}
												>
													<Icon size={15} />
												</a>
											);
										})}
									</div>
								</div>
							</div>
						</aside>
					</div>
				</div>
			</section>

			<section className={styles.section}>
				<div className={styles.sectionInner}>
					<p className={styles.sectionSubtitle}>About</p>
					<h2 className={styles.sectionTitle}>Biography</h2>

					<div className={styles.bioCard}>
						{biographyParagraphs.map((paragraph) => (
							<p key={paragraph}>{paragraph}</p>
						))}
					</div>
				</div>
			</section>

			<section className={`${styles.section} ${styles.sectionMuted}`}>
				<div className={styles.sectionInner}>
					<p className={styles.sectionSubtitle}>Specialties</p>
					<h2 className={styles.sectionTitle}>Research Interests</h2>

					<div className={styles.interestWrap}>
						{interestTags.length > 0 ? (
							<ul className={styles.interestList}>
								{interestTags.map((topic) => (
									<li key={topic} className={styles.interestChip}>
										<FlaskConical size={15} />
										<span>{topic}</span>
									</li>
								))}
							</ul>
						) : (
							<p className={styles.emptyState}>Research interest details are being updated.</p>
						)}
					</div>
				</div>
			</section>

			<section className={styles.section}>
				<div className={styles.sectionInner}>
					<p className={styles.sectionSubtitle}>Path</p>
					<h2 className={styles.sectionTitle}>Academic and Professional Path</h2>

					<div className={styles.timeline}>
						{backgroundTimeline.map((entry) => (
							<article key={`${entry.label}-${entry.date}`} className={styles.timelineRow}>
								<p className={styles.timelineDate}>{entry.date}</p>
								<div className={styles.timelineRail}>
									<span className={styles.timelineDot} />
								</div>
								<div className={styles.timelineBody}>
									<p className={styles.timelineLabel}>{entry.label}</p>
									<p className={styles.timelineValue}>{entry.value}</p>
								</div>
							</article>
						))}
					</div>
				</div>
			</section>

			<section className={`${styles.section} ${styles.sectionMuted}`}>
				<div className={styles.sectionInner}>
					<p className={styles.sectionSubtitle}>Research</p>
					<h2 className={styles.sectionTitle}>Publications</h2>

					{publicationFilters.length > 1 && (
						<div className={styles.filterRow} role="tablist" aria-label="Filter publications">
							{publicationFilters.map((filterValue) => (
								<button
									key={filterValue}
									type="button"
									className={`${styles.filterButton} ${publicationFilter === filterValue ? styles.filterButtonActive : ""}`}
									onClick={() => setPublicationFilter(filterValue)}
								>
									{filterValue === "all" ? "All" : formatPublicationType(filterValue)}
								</button>
							))}
						</div>
					)}

					{filteredPublications.length > 0 ? (
						<div className={styles.publicationGrid}>
							{filteredPublications.map((publication) => (
								<article key={publication.id} className={styles.publicationCard}>
									<div className={styles.publicationTop}>
										<span className={styles.publicationType}>{formatPublicationType(publication.publication_type)}</span>
										<span className={styles.publicationYear}>{publication.year || "Year N/A"}</span>
									</div>
									<h3 className={styles.publicationTitle}>{publication.title}</h3>
									<p className={styles.publicationAbstract}>{publication.abstract || "Abstract is not available yet."}</p>
									{publication.file_pdf_url && (
										<a
											className={styles.publicationLink}
											href={publication.file_pdf_url}
											target="_blank"
											rel="noreferrer"
										>
											<BookOpenText size={15} />
											<span>Open PDF</span>
										</a>
									)}
								</article>
							))}
						</div>
					) : (
						<p className={styles.emptyState}>No publications found for this member yet.</p>
					)}
				</div>
			</section>

			<section className={styles.section}>
				<div className={styles.sectionInner}>
					<p className={styles.sectionSubtitle}>Collaborations</p>
					<h2 className={styles.sectionTitle}>Project Participation</h2>
					<p className={styles.sectionLead}>Projects listed below belong to the same research team and reflect the current collaboration environment.</p>

					{memberProjects.length > 0 ? (
						<div className={styles.projectGrid}>
							{memberProjects.map((project) => (
								<article key={project.id} className={styles.projectCard}>
									<div className={styles.projectTop}>
										<h3 className={styles.projectTitle}>{project.title}</h3>
										<span className={styles.projectStatus}>{formatProjectStatus(project.status)}</span>
									</div>
									<p className={styles.projectDescription}>{project.description || "Project details are being updated."}</p>
									<p className={styles.projectMeta}>
										<BriefcaseBusiness size={14} />
										<span>
											{project.date_start || "Unknown start"} - {project.date_end || "Present"}
										</span>
									</p>
								</article>
							))}
						</div>
					) : (
						<p className={styles.emptyState}>No active projects are associated with this team yet.</p>
					)}
				</div>
			</section>

			<section className={`${styles.section} ${styles.sectionMuted}`}>
				<div className={styles.sectionInner}>
					<div className={styles.contactCard}>
						<div>
							<p className={styles.sectionSubtitle}>Contact</p>
							<h2 className={styles.sectionTitle}>Get in Touch</h2>
							<p className={styles.sectionLead}>
								Reach out for collaboration opportunities, project discussions, or academic inquiries.
							</p>
						</div>

						<div className={styles.contactActions}>
							{member?.email ? (
								<a href={`mailto:${member.email}`} className={styles.primaryAction}>
									<Mail size={16} />
									<span>Email {member.full_name}</span>
								</a>
							) : (
								<Link href="/Contact" className={styles.primaryAction}>
									<Mail size={16} />
									<span>Contact the Team</span>
								</Link>
							)}

							<Link href={`/Teams/${team?.slug || teamSlug}`} className={styles.secondaryAction}>
								<GraduationCap size={16} />
								<span>Back to Team</span>
							</Link>
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}
