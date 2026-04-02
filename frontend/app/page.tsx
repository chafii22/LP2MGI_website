"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Styles from './Home.module.css';
import { getHomeContent, getTeams, type NewsItem, type TeamListItem } from '@/lib/api';

export default function Home() {
  const newsCarouselRef = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [homeFailed, setHomeFailed] = useState(false);
  const [teamsFailed, setTeamsFailed] = useState(false);
  const [hero, setHero] = useState<{ subtitle: string; title: string; description: string; button_label: string; button_link: string } | null>(null);
  const [metrics, setMetrics] = useState<Array<{ label: string; value: string }>>([]);
  const [featuredNews, setFeaturedNews] = useState<NewsItem[]>([]);
  const [teams, setTeams] = useState<TeamListItem[]>([]);

  useEffect(() => {
    let isMounted = true;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const loadHomeData = async () => {
      setIsLoading(true);
      let allSucceeded = false;

      try {
        const [homeResult, teamsResult] = await Promise.allSettled([getHomeContent(), getTeams()]);

        if (!isMounted) {
          return;
        }

        if (homeResult.status === 'fulfilled') {
          setHero(homeResult.value.hero);
          setMetrics(homeResult.value.metrics.map((metric) => ({ label: metric.label, value: metric.value })));
          setFeaturedNews(homeResult.value.featured_news);
          setHomeFailed(false);
        } else {
          setHomeFailed(true);
          setHero(null);
          setMetrics([]);
          setFeaturedNews([]);
        }

        if (teamsResult.status === 'fulfilled') {
          setTeams(teamsResult.value);
          setTeamsFailed(false);
        } else {
          setTeamsFailed(true);
          setTeams([]);
        }

        allSucceeded = homeResult.status === 'fulfilled' && teamsResult.status === 'fulfilled';
      } finally {
        if (isMounted) {
          setIsLoading(false);

          if (!allSucceeded) {
            retryTimer = setTimeout(() => {
              void loadHomeData();
            }, 3000);
          }
        }
      }
    };

    void loadHomeData();

    return () => {
      isMounted = false;
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
    };
  }, []);

  const featuredNewsToRender = useMemo(
    () =>
      featuredNews.slice(0, 6).map((item) => ({
        slug: item.slug,
        title: item.title,
        tags: item.tags,
        cover_image_url: item.cover_image_url,
      })),
    [featuredNews],
  );

  const teamsToRender = teams.slice(0, 3);

  const membersToRender = teams
    .filter((team) => team.lead_name)
    .slice(0, 6)
    .map((team) => ({ name: team.lead_name, role: `Lead - ${team.title}` }));

  const scrollNews = (direction: 'left' | 'right') => {
    const container = newsCarouselRef.current;

    if (!container) {
      return;
    }

    const scrollAmount = Math.max(260, Math.floor(container.clientWidth * 0.8));
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <main className={Styles.mainContainer}>
      {/* 1. Hero Section */}
      <section className={Styles.heroSection}>
        <div className={Styles.heroOverlay}></div>
        <div className={Styles.heroContent}>
          <p className={Styles.heroSubtitle}>
            {hero?.subtitle || 'LP2MGI Laboratory'}
          </p>
          <h1 className={Styles.heroTitle}>
            {hero?.title || 'Research and Innovation at LP2MGI'}
          </h1>
          <p className={Styles.heroDescription}>
            {hero?.description || 'Live content is loaded from the backend API.'}
          </p>
          <Link href={hero?.button_link || '/Overview'} className={Styles.heroButton}>
            {hero?.button_label || 'Explore'}
          </Link>
        </div>
      </section>

      {homeFailed && teamsFailed && !isLoading && (
        <p style={{ textAlign: 'center', color: '#b42318', margin: '1rem 0 0' }}>
          Unable to load homepage data from the API (home and teams endpoints failed). Retrying automatically...
        </p>
      )}

      {/* 2. Lab Numbers Section */}
      <section className={Styles.metricsSection}>
        <div className={`${Styles.maxWContainer} ${Styles.textCenter}`}>
          <p className={Styles.sectionSubtitle}>Metrics</p>
          <h2 className={Styles.sectionTitle}>Our Impact in Numbers</h2>
          <div className={Styles.metricsGrid}>
            {metrics.map((stat, i) => (
              <div key={i} className={Styles.metricCard}>
                <p className={Styles.metricValue}>{stat.value}</p>
                <p className={Styles.metricLabel}>{stat.label}</p>
              </div>
            ))}
          </div>
          {!isLoading && metrics.length === 0 && (
            <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>No metrics available from API.</p>
          )}
        </div>
      </section>

      {/* 3. News Section (Carousel of cards) */}
      <section className={Styles.newsSection}>
        <div className={Styles.maxWContainer}>
          <div className={Styles.newsHeader}>
            <div>
              <p className={Styles.sectionSubtitle}>Updates</p>
              <h2 className={Styles.sectionTitle} style={{marginBottom: 0}}>Latest News</h2>
            </div>
            <Link href="/News" className={Styles.newsLink}>
              View all news →
            </Link>
          </div>
          <div className={Styles.newsCarouselWrap}>
            <button
              type="button"
              className={`${Styles.newsArrow} ${Styles.newsArrowLeft}`}
              onClick={() => scrollNews('left')}
              aria-label="Scroll news left"
            >
              <ChevronLeft size={24} strokeWidth={2.4} aria-hidden="true" />
            </button>

            {/* Simple horizontal scroll for carousel effect */}
            <div ref={newsCarouselRef} className={Styles.newsCarousel}>
              {featuredNewsToRender.map((item, index) => (
                <Link
                  key={item.slug}
                  href={`/News/${item.slug}`}
                  className={Styles.newsCard}
                  aria-label={`Open news article ${index + 1}`}
                >
                  <div
                    className={Styles.newsImagePlaceholder}
                    style={
                      item.cover_image_url
                        ? {
                            backgroundImage: `url(${item.cover_image_url})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            color: 'transparent',
                          }
                        : undefined
                    }
                  >
                    {!item.cover_image_url ? 'Image Placeholder' : 'Image'}
                  </div>
                  <h3 className={Styles.newsCardTitle}>{item.title}</h3>
                  <div className={Styles.newsTags}>
                    {(item.tags?.length ? item.tags : ['news']).slice(0, 3).map((tag) => (
                      <span key={`${item.slug}-${tag}`} className={Styles.newsTag}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>

            {!isLoading && featuredNewsToRender.length === 0 && (
              <p style={{ color: 'var(--text-muted)', marginTop: '0.75rem' }}>No news available from API.</p>
            )}

            <button
              type="button"
              className={`${Styles.newsArrow} ${Styles.newsArrowRight}`}
              onClick={() => scrollNews('right')}
              aria-label="Scroll news right"
            >
              <ChevronRight size={24} strokeWidth={2.4} aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      {/* 4. Teams Section */}
      <section className={Styles.teamsSection}>
        <div className={Styles.maxWContainer}>
          <div className={Styles.textCenter} style={{marginBottom: '3rem'}}>
            <p className={Styles.sectionSubtitle}>Departments</p>
            <h2 className={Styles.sectionTitle} style={{marginBottom: 0}}>Our Research Teams</h2>
          </div>
          <div className={Styles.teamsGrid}>
            {teamsToRender.map((team) => (
              <Link key={team.slug} href={`/Teams/${team.slug}`} className={Styles.teamCard}>
                <div className={Styles.teamIcon}>
                  {(team.short_name || team.title || 'T').charAt(0).toUpperCase()}
                </div>
                <h3 className={Styles.teamName}>{team.title}</h3>
                <p className={Styles.teamFocus}>{team.focus || 'Research focus to be updated.'}</p>
              </Link>
            ))}
          </div>
          {!isLoading && teamsToRender.length === 0 && (
            <p style={{ color: 'var(--text-muted)', marginTop: '0.75rem', textAlign: 'center' }}>
              {teamsFailed ? 'Unable to load teams from API.' : 'No teams available from API.'}
            </p>
          )}
        </div>
      </section>

      {/* 5. Members Section */}
      <section className={Styles.membersSection}>
        <div className={Styles.maxWContainer}>
          <div className={Styles.textCenter} style={{marginBottom: '3rem'}}>
            <p className={Styles.sectionSubtitle}>Our People</p>
            <h2 className={Styles.sectionTitle} style={{marginBottom: 0}}>Meet Our Members</h2>
          </div>
          <div className={Styles.membersGrid}>
            {membersToRender.map((member, idx) => {
              const initials = member.name.split(' ').map((n) => n[0]).join('');
              return (
                <div key={idx} className={Styles.memberCard}>
                  <div className={Styles.memberInitials}>
                    {initials}
                  </div>
                  <div>
                    <h4 className={Styles.memberName}>{member.name}</h4>
                    <p className={Styles.memberRole}>{member.role}</p>
                  </div>
                </div>
              );
            })}
          </div>
          {!isLoading && membersToRender.length === 0 && (
            <p style={{ color: 'var(--text-muted)', marginTop: '-1rem', marginBottom: '2rem', textAlign: 'center' }}>
              {teamsFailed ? 'Unable to load members because teams data failed to load.' : 'No members available from API.'}
            </p>
          )}
          <div className={Styles.showMoreContainer}>
            <Link href="/Teams" className={Styles.showMoreLink}>
              Show more members
              <span className={Styles.showMoreIcon}>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Partners Section */}
      <section className={Styles.partnersSection}>
        <div className={`${Styles.maxWContainer} ${Styles.textCenter}`}>
          <p className={Styles.sectionSubtitle}>Collaborations</p>
          <h2 className={Styles.sectionTitle}>Our Partners</h2>
          <div className={Styles.partnersGrid}>
            {[
              "University of Technology",
              "TechCorp Inc.",
              "Research Institute",
              "Global Science Hub",
              "Innovation Labs"
            ].map((partner, idx) => (
              <div key={idx} className={Styles.partnerItem}>
                <div className={Styles.partnerLogoHolder}>
                  <span className={Styles.partnerLogoText}>Logo Holder</span>
                </div>
                <span className={Styles.partnerName}>
                  {partner}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {isLoading && (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', margin: '1rem 0 2rem' }}>
          Loading latest data...
        </p>
      )}
    </main>
  );
}
