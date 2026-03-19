
'use client';

import React from 'react';
import { Lightbulb, Target, Eye } from 'lucide-react';
import Styles from './Overview.module.css';

export default function Overview() {
  return (
    <main className={Styles.mainContainer}>
      {/* Section 1: Header Section */}
      <section className={Styles.headerSection}>
        <div className={Styles.headerContent}>
          <p className={Styles.subtitle}>About Our Lab</p>
          <h1 className={Styles.title}>Laboratory Overview</h1>
          <p className={Styles.description}>
            Discover the vision, mission, and leadership behind LP2MGI, one of the premier research laboratories at EST Casablanca.
          </p>
        </div>
      </section>

      {/* Section 2: Director Talk Section */}
      <section className={Styles.directorSection}>
        <div className={Styles.directorWrapper}>
          {/* Director Left Column: Image + Name + Role */}
          <div className={Styles.directorLeftColumn}>
            <div className={Styles.directorImageContainer}>
              <div
                className={Styles.directorImage}
                style={{
                  backgroundColor: '#E0F2F1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '3rem',
                }}
              >
                👨‍💼
              </div>
            </div>
            <h2 className={Styles.directorTitle}>
              Prof. Dr. Director Name
            </h2>
            <p className={Styles.directorRole}>
              Director of LP2MGI Laboratory
            </p>
          </div>

          {/* Director Right Column: Text Content */}
          <div className={Styles.directorRightColumn}>
            <p className={Styles.directorText}>
              Welcome to LP2MGI, a dynamic research laboratory dedicated to advancing scientific knowledge and technological innovation. Since its establishment, our lab has been at the forefront of cutting-edge research across multiple disciplines.
            </p>

            <div className={Styles.directorQuote}>
              {"Our mission is to transform research into real-world solutions that benefit society and drive technological progress."}
            </div>

            <p className={Styles.directorText}>
              Through collaborative efforts with national and international partners, we foster an environment where creativity, rigor, and dedication converge to produce groundbreaking discoveries. Our team of talented researchers brings diverse expertise and perspectives to tackle complex challenges in modern science and engineering.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Mission & Vision Section */}
      <section className={Styles.missionVisionSection}>
        <div className={Styles.missionVisionContainer}>
          <div className={Styles.sectionHeader}>
            <p className={Styles.sectionSubtitle}>Core Values</p>
            <h2 className={Styles.sectionTitle}>Mission & Vision</h2>
          </div>

          <div className={Styles.missionVisionGrid}>
            {/* Mission Card */}
            <div className={Styles.card}>
              <div className={Styles.cardIcon}>
                <Target size={28} />
              </div>
              <h3 className={Styles.cardTitle}>Our Mission</h3>
              <p className={Styles.cardDescription}>
                To conduct high-quality research that advances scientific knowledge and develops innovative solutions. We are committed to:
              </p>
              <ul style={{ paddingLeft: 0, listStyle: 'none' }}>
                <li className={Styles.cardListItem}>
                  Pursuing excellence in research and education
                </li>
                <li className={Styles.cardListItem}>
                  Fostering collaboration and innovation
                </li>
                <li className={Styles.cardListItem}>
                  Contributing to societal development
                </li>
                <li className={Styles.cardListItem}>
                  Enhancing student learning and growth
                </li>
              </ul>
            </div>

            {/* Vision Card */}
            <div className={Styles.card}>
              <div className={Styles.cardIcon}>
                <Eye size={28} />
              </div>
              <h3 className={Styles.cardTitle}>Our Vision</h3>
              <p className={Styles.cardDescription}>
                To be recognized internationally as a leading research laboratory that:
              </p>
              <ul style={{ paddingLeft: 0, listStyle: 'none' }}>
                <li className={Styles.cardListItem}>
                  Generates transformative research with global impact
                </li>
                <li className={Styles.cardListItem}>
                  Develops next-generation leaders in science and technology
                </li>
                <li className={Styles.cardListItem}>
                  Bridges academic research with industrial applications
                </li>
                <li className={Styles.cardListItem}>
                  Promotes sustainable and ethical innovation
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}