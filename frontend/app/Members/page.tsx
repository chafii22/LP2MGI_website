"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import styles from "./members.module.css";
import { getTeamBySlug, getTeams, type TeamMember } from "@/lib/api";

type TeamReference = {
	slug: string;
	title: string;
	isLeader: boolean;
};

type DirectoryMember = TeamMember & {
	teams: TeamReference[];
	primaryTeamSlug: string;
};

function getInitials(fullName: string): string {
	return fullName
		.split(" ")
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase() ?? "")
		.join("");
}

export default function MembersPage() {
	const searchParams = useSearchParams();
	const teamFromQuery = searchParams.get("team")?.trim() || "";
	const [isLoading, setIsLoading] = useState(true);
	const [loadFailed, setLoadFailed] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedTeam, setSelectedTeam] = useState("all");
	const [selectedRole, setSelectedRole] = useState("all");
	const [reloadToken, setReloadToken] = useState(0);
	const [members, setMembers] = useState<DirectoryMember[]>([]);
	const [teamOptions, setTeamOptions] = useState<Array<{ slug: string; title: string }>>([]);

	useEffect(() => {
		if (!teamFromQuery) {
			return;
		}

		const exists = teamOptions.some((team) => team.slug === teamFromQuery);
		if (exists) {
			setSelectedTeam(teamFromQuery);
		}
	}, [teamFromQuery, teamOptions]);

	useEffect(() => {
		let isMounted = true;

		const loadMembers = async () => {
			setIsLoading(true);
			setLoadFailed(false);

			try {
				const teams = await getTeams();
				const detailsResults = await Promise.allSettled(teams.map((team) => getTeamBySlug(team.slug)));

				if (!isMounted) {
					return;
				}

				const details = detailsResults
					.filter((result): result is PromiseFulfilledResult<Awaited<ReturnType<typeof getTeamBySlug>>> => result.status === "fulfilled")
					.map((result) => result.value);

				if (details.length === 0) {
					setMembers([]);
					setTeamOptions([]);
					setLoadFailed(true);
					return;
				}

				const byMemberId = new Map<number, DirectoryMember>();

				for (const teamDetail of details) {
					for (const member of teamDetail.members) {
						const existing = byMemberId.get(member.id);
						const teamRef: TeamReference = {
							slug: teamDetail.slug,
							title: teamDetail.title,
							isLeader: member.is_leader,
						};

						if (!existing) {
							byMemberId.set(member.id, {
								...member,
								teams: [teamRef],
								primaryTeamSlug: teamDetail.slug,
							});
							continue;
						}

						const teamAlreadyLinked = existing.teams.some((team) => team.slug === teamDetail.slug);
						if (!teamAlreadyLinked) {
							existing.teams.push(teamRef);
						}

						if (member.is_leader) {
							existing.primaryTeamSlug = teamDetail.slug;
						}
					}
				}

				const normalizedMembers = Array.from(byMemberId.values()).sort((a, b) =>
					a.full_name.localeCompare(b.full_name, undefined, { sensitivity: "base" })
				);

				const normalizedTeams = details
					.map((team) => ({ slug: team.slug, title: team.title }))
					.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: "base" }));

				setMembers(normalizedMembers);
				setTeamOptions(normalizedTeams);
			} catch {
				if (isMounted) {
					setMembers([]);
					setTeamOptions([]);
					setLoadFailed(true);
				}
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		};

		void loadMembers();

		return () => {
			isMounted = false;
		};
	}, [reloadToken]);

	const roleOptions = useMemo(() => {
		const roles = new Set<string>();

		for (const member of members) {
			if (member.role) {
				roles.add(member.role);
			}
		}

		return Array.from(roles).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
	}, [members]);

	const filteredMembers = useMemo(() => {
		const query = searchQuery.trim().toLowerCase();

		return members.filter((member) => {
			const matchesTeam = selectedTeam === "all" || member.teams.some((team) => team.slug === selectedTeam);
			const matchesRole = selectedRole === "all" || member.role === selectedRole;

			if (!matchesTeam || !matchesRole) {
				return false;
			}

			if (!query) {
				return true;
			}

			const searchableValues = [
				member.full_name,
				member.role,
				member.expertise,
				member.email,
				...member.teams.map((team) => team.title),
			];

			return searchableValues.some((value) => value?.toLowerCase().includes(query));
		});
	}, [members, searchQuery, selectedRole, selectedTeam]);

	return (
		<main className={styles.mainContainer}>
			<section className={styles.headerSection}>
				<div className={styles.maxWidthContainer}>
					<p className={styles.sectionSubtitle}>Our People</p>
					<h1 className={styles.sectionTitle}>Members Directory</h1>
					<p className={styles.sectionDescription}>
						Browse all laboratory members and quickly filter by team, role, or keywords.
					</p>
				</div>
			</section>

			<section className={styles.filtersSection}>
				<div className={styles.maxWidthContainer}>
					<div className={styles.filtersGrid}>
						<label className={styles.filterField}>
							<span className={styles.filterLabel}>Search</span>
							<input
								type="text"
								value={searchQuery}
								onChange={(event) => setSearchQuery(event.target.value)}
								placeholder="Name, role, expertise, email, or team"
								className={styles.filterInput}
							/>
						</label>

						<label className={styles.filterField}>
							<span className={styles.filterLabel}>Team</span>
							<select
								value={selectedTeam}
								onChange={(event) => setSelectedTeam(event.target.value)}
								className={styles.filterSelect}
							>
								<option value="all">All teams</option>
								{teamOptions.map((team) => (
									<option key={team.slug} value={team.slug}>
										{team.title}
									</option>
								))}
							</select>
						</label>

						<label className={styles.filterField}>
							<span className={styles.filterLabel}>Role</span>
							<select
								value={selectedRole}
								onChange={(event) => setSelectedRole(event.target.value)}
								className={styles.filterSelect}
							>
								<option value="all">All roles</option>
								{roleOptions.map((role) => (
									<option key={role} value={role}>
										{role}
									</option>
								))}
							</select>
						</label>
					</div>
				</div>
			</section>

			<section className={styles.resultsSection}>
				<div className={styles.maxWidthContainer}>
					{loadFailed && !isLoading && (
						<div className={styles.messageCard}>
							<p>Unable to load members from the API right now.</p>
							<button
								type="button"
								onClick={() => setReloadToken((value) => value + 1)}
								className={styles.retryButton}
							>
								Retry
							</button>
						</div>
					)}

					{isLoading && <p className={styles.helperText}>Loading members...</p>}

					{!isLoading && !loadFailed && (
						<>
							<p className={styles.helperText}>
								{filteredMembers.length} member{filteredMembers.length === 1 ? "" : "s"} found.
							</p>

							{filteredMembers.length === 0 ? (
								<div className={styles.messageCard}>
									<p>No members match the current filters.</p>
								</div>
							) : (
								<div className={styles.membersGrid}>
									{filteredMembers.map((member) => (
										<Link
											key={member.id}
											href={`/Teams/${member.primaryTeamSlug}/${member.id}`}
											className={styles.memberCard}
											aria-label={`Open profile of ${member.full_name}`}
										>
											<div className={styles.memberTopRow}>
												{member.photo_url ? (
													<div
														className={styles.memberAvatar}
														style={{ backgroundImage: `url(${member.photo_url})` }}
														aria-hidden="true"
													/>
												) : (
													<div className={styles.memberAvatarFallback}>{getInitials(member.full_name)}</div>
												)}

												<div className={styles.memberHeaderText}>
													<h2 className={styles.memberName}>{member.full_name}</h2>
													<p className={styles.memberRole}>{member.role}</p>
												</div>
											</div>

											<p className={styles.memberExpertise}>{member.expertise || "Expertise will be updated soon."}</p>

											<div className={styles.teamTagWrap}>
												{member.teams.slice(0, 3).map((team) => (
													<span key={`${member.id}-${team.slug}`} className={styles.teamTag}>
														{team.title}
													</span>
												))}
											</div>
										</Link>
									))}
								</div>
							)}
						</>
					)}
				</div>
			</section>
		</main>
	);
}
