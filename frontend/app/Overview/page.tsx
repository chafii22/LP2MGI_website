
import { Target, Eye } from 'lucide-react';
import Image from 'next/image';
import Styles from './Overview.module.css';
import { getOverviewContent } from '../../lib/api';

const fallbackContent = {
  header_subtitle: 'About Our Lab',
  header_title: 'Laboratory Overview',
  header_description:
    'Discover the vision, mission, and leadership behind LP2MGI, one of the premier research laboratories at EST Casablanca.',
  director_name: 'Prof. Dr. Director Name',
  director_role: 'Director of LP2MGI Laboratory',
  director_photo_url: '',
  director_intro:
    'Welcome to LP2MGI, a dynamic research laboratory dedicated to advancing scientific knowledge and technological innovation. Since its establishment, our lab has been at the forefront of cutting-edge research across multiple disciplines.',
  director_quote:
    'Our mission is to transform research into real-world solutions that benefit society and drive technological progress.',
  director_body:
    'Through collaborative efforts with national and international partners, we foster an environment where creativity, rigor, and dedication converge to produce groundbreaking discoveries. Our team of talented researchers brings diverse expertise and perspectives to tackle complex challenges in modern science and engineering.',
  mission_title: 'Our Mission',
  mission_description:
    'To conduct high-quality research that advances scientific knowledge and develops innovative solutions. We are committed to:',
  mission_points: [
    'Pursuing excellence in research and education',
    'Fostering collaboration and innovation',
    'Contributing to societal development',
    'Enhancing student learning and growth',
  ],
  vision_title: 'Our Vision',
  vision_description:
    'To be recognized internationally as a leading research laboratory that:',
  vision_points: [
    'Generates transformative research with global impact',
    'Develops next-generation leaders in science and technology',
    'Bridges academic research with industrial applications',
    'Promotes sustainable and ethical innovation',
  ],
};

function normalizePoints(points: unknown, fallback: string[]): string[] {
  if (!Array.isArray(points)) {
    return fallback;
  }

  const normalized = points
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item) => Boolean(item));

  return normalized.length > 0 ? normalized : fallback;
}

export default async function Overview() {
  let overview = null;

  try {
    overview = await getOverviewContent();
  } catch {
    overview = null;
  }

  const content = overview ?? fallbackContent;
  const missionPoints = normalizePoints(content.mission_points, fallbackContent.mission_points);
  const visionPoints = normalizePoints(content.vision_points, fallbackContent.vision_points);

  return (
    <main className={Styles.mainContainer}>
      {/* Section 1: Header Section */}
      <section className={Styles.headerSection}>
        <div className={Styles.headerContent}>
          <p className={Styles.subtitle}>{content.header_subtitle || fallbackContent.header_subtitle}</p>
          <h1 className={Styles.title}>{content.header_title || fallbackContent.header_title}</h1>
          <p className={Styles.description}>
            {content.header_description || fallbackContent.header_description}
          </p>
        </div>
      </section>

      {/* Section 2: Director Talk Section */}
      <section className={Styles.directorSection}>
        <div className={Styles.directorWrapper}>
          {/* Director Left Column: Image + Name + Role */}
          <div className={Styles.directorLeftColumn}>
            <div className={Styles.directorImageContainer}>
              {content.director_photo_url ? (
                <Image
                  className={Styles.directorImage}
                  src={content.director_photo_url}
                  alt={content.director_name || fallbackContent.director_name}
                  width={800}
                  height={1000}
                  sizes="(max-width: 1024px) 100vw, 400px"
                  unoptimized
                />
              ) : (
                <div className={`${Styles.directorImage} ${Styles.directorImagePlaceholder}`}>No Photo</div>
              )}
            </div>
            <h2 className={Styles.directorTitle}>
              {content.director_name || fallbackContent.director_name}
            </h2>
            <p className={Styles.directorRole}>
              {content.director_role || fallbackContent.director_role}
            </p>
          </div>

          {/* Director Right Column: Text Content */}
          <div className={Styles.directorRightColumn}>
            <p className={Styles.directorText}>
              {content.director_intro || fallbackContent.director_intro}
            </p>

            <div className={Styles.directorQuote}>
              {content.director_quote || fallbackContent.director_quote}
            </div>

            <p className={Styles.directorText}>
              {content.director_body || fallbackContent.director_body}
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
              <h3 className={Styles.cardTitle}>{content.mission_title || fallbackContent.mission_title}</h3>
              <p className={Styles.cardDescription}>
                {content.mission_description || fallbackContent.mission_description}
              </p>
              <ul className={Styles.cardList}>
                {missionPoints.map((point) => (
                  <li key={point} className={Styles.cardListItem}>
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            {/* Vision Card */}
            <div className={Styles.card}>
              <div className={Styles.cardIcon}>
                <Eye size={28} />
              </div>
              <h3 className={Styles.cardTitle}>{content.vision_title || fallbackContent.vision_title}</h3>
              <p className={Styles.cardDescription}>
                {content.vision_description || fallbackContent.vision_description}
              </p>
              <ul className={Styles.cardList}>
                {visionPoints.map((point) => (
                  <li key={point} className={Styles.cardListItem}>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}