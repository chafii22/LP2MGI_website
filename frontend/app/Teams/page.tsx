
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './Teams.module.css';
import { getTeams, type TeamListItem } from '@/lib/api';

type TeamItem = {
    slug: string;
    title: string;
    shortName: string;
    lead: string;
    members: number;
    focus: string;
    description: string;
};

const teams: TeamItem[] = [
    {
        slug: 'data-intelligence',
        title: 'Data Intelligence Team',
        shortName: 'DI',
        lead: 'Prof. A. El Idrissi',
        members: 11,
        focus: 'Machine Learning',
        description:
            'Developing robust data-driven models for prediction, decision support, and explainable AI in applied research settings.',
    },
    {
        slug: 'software-systems',
        title: 'Software Systems Team',
        shortName: 'SS',
        lead: 'Prof. M. Chafii',
        members: 9,
        focus: 'Distributed Systems',
        description:
            'Designing high-quality software architectures with emphasis on reliability, performance, and maintainability at scale.',
    },
    {
        slug: 'smart-networks',
        title: 'Smart Networks Team',
        shortName: 'SN',
        lead: 'Prof. N. Bensalah',
        members: 8,
        focus: 'IoT & Smart Infrastructure',
        description:
            'Building connected systems and intelligent sensing platforms for smart city, industry, and campus transformation projects.',
    },
];

export default function TeamsPage() {
    const [apiTeams, setApiTeams] = useState<TeamListItem[]>([]);

    useEffect(() => {
        let isMounted = true;

        const loadTeams = async () => {
            try {
                const data = await getTeams();
                if (isMounted) {
                    setApiTeams(data);
                }
            } catch {
                if (isMounted) {
                    setApiTeams([]);
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
              lead: team.lead_name || 'Not specified',
              members: team.members_count || 0,
              focus: team.focus || 'Research focus to be updated.',
              description: team.overview || 'Team overview coming soon.',
          }))
        : teams;

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
                                    <span className={styles.focusTag}>{team.focus}</span>
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
                </div>
            </section>
        </main>
    );
}