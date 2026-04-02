'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Compass, GraduationCap, Layers3, Users } from 'lucide-react';
import styles from './TeamDetail.module.css';
import { getTeamBySlug, type TeamDetail, type TeamMember } from '@/lib/api';

type RoleFilter = 'All' | string;

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export default function TeamDetailPage() {
  const params = useParams<{ TeamId: string }>();
  const teamSlug = Array.isArray(params?.TeamId) ? params.TeamId[0] : params?.TeamId;

  const [team, setTeam] = useState<TeamDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('All');

  useEffect(() => {
    if (!teamSlug) {
      setTeam(null);
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const loadTeam = async () => {
      try {
        setIsLoading(true);
        setHasError(false);
        const data = await getTeamBySlug(teamSlug);

        if (isMounted) {
          setTeam(data);
        }
      } catch {
        if (isMounted) {
          setHasError(true);
          setTeam(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadTeam();

    return () => {
      isMounted = false;
    };
  }, [teamSlug]);

  const roleFilters = useMemo<RoleFilter[]>(() => {
    if (!team?.members?.length) {
      return ['All'];
    }

    const uniqueRoles = Array.from(new Set(team.members.map((member) => member.role))).filter(Boolean);
    return ['All', ...uniqueRoles];
  }, [team]);

  const filteredMembers = useMemo(() => {
    const members = team?.members ?? [];

    if (roleFilter === 'All') {
      return members;
    }

    return members.filter((member) => member.role === roleFilter);
  }, [roleFilter, team]);

  const researchAxes = useMemo(() => {
    const axes: string[] = [];

    if (team?.focus) {
      axes.push(`Focus: ${team.focus}`);
    }

    if (team?.domain) {
      axes.push(`Domain: ${team.domain}`);
    }

    if (team?.overview) {
      axes.push('Collaborative multidisciplinary research and applied innovation.');
    }

    return axes.length
      ? axes
      : ['Research program details are being updated.'];
  }, [team]);

  if (!teamSlug) {
    return (
      <main className={styles.mainContainer}>
        <section className={styles.headerSection}>
          <div className={styles.sectionInner}>
            <nav className={styles.breadcrumb} aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span>/</span>
              <Link href="/Teams">Teams</Link>
              <span>/</span>
              <span className={styles.currentPath}>Unknown Team</span>
            </nav>
            <p className={styles.subtitle}>Research Unit</p>
            <h1 className={styles.title}>Team Not Found</h1>
            <p className={styles.headerDescription}>The team you requested does not exist or is not available yet.</p>
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
              <span>/</span>
              <Link href="/Teams">Teams</Link>
              <span>/</span>
              <span className={styles.currentPath}>Unavailable</span>
            </nav>
            <p className={styles.subtitle}>Research Unit</p>
            <h1 className={styles.title}>Team Data Unavailable</h1>
            <p className={styles.headerDescription}>Unable to load team details from the API right now.</p>
          </div>
        </section>
      </main>
    );
  }

  if (!isLoading && !team) {
    return (
      <main className={styles.mainContainer}>
        <section className={styles.headerSection}>
          <div className={styles.sectionInner}>
            <nav className={styles.breadcrumb} aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span>/</span>
              <Link href="/Teams">Teams</Link>
              <span>/</span>
              <span className={styles.currentPath}>Unknown Team</span>
            </nav>
            <p className={styles.subtitle}>Research Unit</p>
            <h1 className={styles.title}>Team Not Found</h1>
            <p className={styles.headerDescription}>The team you requested does not exist.</p>
          </div>
        </section>
      </main>
    );
  }

  const stats = [
    { label: 'Lead', value: team?.lead_name || 'Not specified', icon: GraduationCap },
    { label: 'Members', value: String(team?.members?.length ?? 0), icon: Users },
    { label: 'Focus', value: team?.focus || 'Not specified', icon: Layers3 },
    { label: 'Domain', value: team?.domain || 'Not specified', icon: Compass },
  ];

  return (
    <main className={styles.mainContainer}>
      <section className={styles.headerSection}>
        <div className={styles.sectionInner}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/Teams">Teams</Link>
            <span>/</span>
            <span className={styles.currentPath}>{team?.title || 'Team'}</span>
          </nav>

          <p className={styles.subtitle}>Research Unit</p>
          <h1 className={styles.title}>{team?.title || 'Team Details'}</h1>
          {isLoading && <p className={styles.headerDescription}>Loading team details...</p>}
        </div>
      </section>

      <section className={styles.overviewSection}>
        <div className={`${styles.sectionInner} ${styles.overviewGrid}`}>
          <div className={styles.overviewTextBlock}>
            <p className={styles.sectionSubtitle}>Team Snapshot</p>
            <h2 className={styles.sectionTitle}>Overview</h2>
            <p className={styles.overviewText}>{team?.overview || 'Team overview is being updated.'}</p>
          </div>

          <aside className={styles.statsCard}>
            <h3 className={styles.statsTitle}>Team Keys</h3>
            <ul className={styles.statsList}>
              {stats.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.label} className={styles.statsItem}>
                    <span className={styles.statsIcon}>
                      <Icon size={17} strokeWidth={2.2} />
                    </span>
                    <div>
                      <p className={styles.statsLabel}>{item.label}</p>
                      <p className={styles.statsValue}>{item.value}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </aside>
        </div>
      </section>

      <section className={styles.axesSection}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Research Axes</h2>
          <div className={styles.axesGrid}>
            {researchAxes.map((axis) => (
              <article key={axis} className={styles.axisCard}>
                <Layers3 size={18} className={styles.axisIcon} />
                <p>{axis}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.membersSection}>
        <div className={styles.sectionInner}>
          <div className={styles.membersHeader}>
            <h2 className={styles.sectionTitle}>Team Members</h2>
            <div className={styles.filterGroup} role="tablist" aria-label="Filter members by role">
              {roleFilters.map((role) => (
                <button
                  key={role}
                  type="button"
                  className={`${styles.filterButton} ${roleFilter === role ? styles.filterButtonActive : ''}`}
                  onClick={() => setRoleFilter(role)}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.membersGrid}>
            {filteredMembers.map((member: TeamMember) => (
              <article key={member.id} className={styles.memberCard}>
                <div className={styles.memberInitials}>{getInitials(member.full_name)}</div>
                <div className={styles.memberContent}>
                  <div className={styles.memberTop}>
                    <h3 className={styles.memberName}>{member.full_name}</h3>
                    {member.is_leader && <span className={styles.leaderTag}>Leader</span>}
                  </div>
                  <p className={styles.memberRole}>{member.role}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
