import React from 'react';
import Link from 'next/link';
import Styles from './Home.module.css';

export default function Home() {
  return (
    <main className={Styles.mainContainer}>
      {/* 1. Hero Section */}
      <section className={Styles.heroSection}>
        <div className={Styles.heroOverlay}></div>
        <div className={Styles.heroContent}>
          <p className={Styles.heroSubtitle}>
            Welcome to Our Lab
          </p>
          <h1 className={Styles.heroTitle}>
            Research & Innovation at LP2MGI
          </h1>
          <p className={Styles.heroDescription}>
            A multidisciplinary research laboratory dedicated to the advancement of science and engineering through collaborative innovation.
          </p>
          <Link href="/Overview" className={Styles.heroButton}>
            Discover Our Work
          </Link>
        </div>
      </section>

      {/* 2. Lab Numbers Section */}
      <section className={Styles.metricsSection}>
        <div className={`${Styles.maxWContainer} ${Styles.textCenter}`}>
          <p className={Styles.sectionSubtitle}>Metrics</p>
          <h2 className={Styles.sectionTitle}>Our Impact in Numbers</h2>
          <div className={Styles.metricsGrid}>
            {[
              { label: 'Researchers', value: '45+' },
              { label: 'Publications', value: '120+' },
              { label: 'Projects', value: '30+' },
              { label: 'Partners', value: '15+' },
            ].map((stat, i) => (
              <div key={i} className={Styles.metricCard}>
                <p className={Styles.metricValue}>{stat.value}</p>
                <p className={Styles.metricLabel}>{stat.label}</p>
              </div>
            ))}
          </div>
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
          {/* Simple horizontal scroll for carousel effect */}
          <div className={Styles.newsCarousel}>
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className={Styles.newsCard}>
                <div className={Styles.newsImagePlaceholder}>Image Placeholder</div>
                <h3 className={Styles.newsCardTitle}>Exciting Research Update {item}</h3>
                <p className={Styles.newsCardDesc}>
                  Brief description of the news article going into a little detail about the event, achievement, or publication.
                </p>
                <Link href="/News" className={Styles.newsReadMore}>Read article</Link>
              </div>
            ))}
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
            {[
              { name: 'Team Alpha', focus: 'Artificial Intelligence & Data Science' },
              { name: 'Team Beta', focus: 'Advanced Materials & Systems' },
              { name: 'Team Gamma', focus: 'Industrial & Process Engineering' },
            ].map((team, idx) => (
              <div key={idx} className={Styles.teamCard}>
                <div className={Styles.teamIcon}>
                  {team.name.split(' ')[1].charAt(0)}
                </div>
                <h3 className={Styles.teamName}>{team.name}</h3>
                <p className={Styles.teamFocus}>{team.focus}</p>
              </div>
            ))}
          </div>
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
            {[
              { name: 'Alice Smith', role: 'Lead Researcher' },
              { name: 'Bob Johnson', role: 'Senior Analyst' },
              { name: 'Claire Davis', role: 'PhD Candidate' },
              { name: 'David Wilson', role: 'Data Scientist' },
              { name: 'Eva Brown', role: 'Research Assistant' },
              { name: 'Frank Miller', role: 'Engineer' },
            ].map((member, idx) => {
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
    </main>
  );
}
