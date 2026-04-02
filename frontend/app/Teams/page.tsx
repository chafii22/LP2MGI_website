
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './Teams.module.css';
import { getTeams, type TeamListItem } from '@/lib/api';

type TeamItem = {
    slug: string;
    title: string;
    shortName: string;
    tags: string[];
    lead: string;
    members: number;
    focus: string;
    description: string;
};

export default function TeamsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [apiTeams, setApiTeams] = useState<TeamListItem[]>([]);

    useEffect(() => {
        let isMounted = true;

        const loadTeams = async () => {
            try {
                const data = await getTeams();
                if (isMounted) {
                    setApiTeams(data);
                    setHasError(false);
                }
            } catch {
                if (isMounted) {
                    setHasError(true);
                    setApiTeams([]);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadTeams();

        return () => {
            isMounted = false;
        };
    }, []);

    const teamsToRender: TeamItem[] = apiTeams.length
        ? apiTeams.map((team) => ({
              slug: team.slug,
              title: team.title,
              shortName: team.short_name || team.title.slice(0, 2).toUpperCase(),
              tags: Array.isArray(team.tags) && team.tags.length ? team.tags.slice(0, 3) : ['Research'],
              lead: team.lead_name || 'Not specified',
              members: team.members_count || 0,
              focus: team.focus || 'Research focus to be updated.',
              description: team.overview || 'Team overview coming soon.',
          }))
                : [];

    return (
        <main className={styles.mainContainer}>
            <section className={styles.headerSection}>
                <div className={styles.headerContent}>
                    <p className={styles.subtitle}>Research Structure</p>
                    <h1 className={styles.title}>Our Teams</h1>
                    <p className={styles.description}>
                        LP2MGI brings together multidisciplinary teams that collaborate on scientific challenges and practical technological
                        solutions.
                    </p>
                </div>
            </section>

            <section className={styles.teamsSection}>
                <div className={styles.teamsContent}>
                    <div className={styles.sectionHeading}>
                        <h2 className={styles.sectionTitle}>Active Research Units</h2>
                        <p className={styles.sectionText}>Explore each team to discover members, domains, and ongoing projects.</p>
                    </div>

                    <div className={styles.teamGrid}>
                        {teamsToRender.map((team) => (
                            <article key={team.slug} className={styles.teamCard}>
                                <div className={styles.cardTop}>
                                    <div className={styles.teamBadge}>{team.shortName}</div>
                                    <div className={styles.tagList}>
                                        {team.tags.map((tag) => (
                                            <span key={`${team.slug}-${tag}`} className={styles.focusTag}>
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <h3 className={styles.teamTitle}>{team.title}</h3>

                                <div className={styles.metaRow}>
                                    <p className={styles.metaItem}>
                                        <span className={styles.metaLabel}>Lead:</span> {team.lead}
                                    </p>
                                    <p className={styles.metaItem}>
                                        <span className={styles.metaLabel}>Members:</span> {team.members}
                                    </p>
                                </div>

                                <p className={styles.cardDescription}>{team.description}</p>

                                <Link href={`/Teams/${team.slug}`} className={styles.cardButton}>
                                    View Team
                                </Link>
                            </article>
                        ))}
                    </div>

                    {isLoading && <p className={styles.sectionText}>Loading teams from API...</p>}
                    {!isLoading && hasError && <p className={styles.sectionText}>Unable to load teams from API.</p>}
                    {!isLoading && !hasError && teamsToRender.length === 0 && <p className={styles.sectionText}>No teams available.</p>}
                </div>
            </section>
        </main>
    );
}