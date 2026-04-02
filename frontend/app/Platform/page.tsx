'use client';

import { useEffect, useState } from 'react';
import styles from './Platform.module.css';
import { getEvents, getGalleries, getProjects, type EventItem, type GalleryItem, type ProjectItem } from '@/lib/api';

export default function PlatformPage() {
    const [projects, setProjects] = useState<ProjectItem[]>([]);
    const [events, setEvents] = useState<EventItem[]>([]);
    const [galleries, setGalleries] = useState<GalleryItem[]>([]);

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            try {
                const [projectsData, eventsData, galleriesData] = await Promise.all([
                    getProjects(),
                    getEvents(),
                    getGalleries(),
                ]);

                if (!isMounted) {
                    return;
                }

                setProjects(projectsData);
                setEvents(eventsData);
                setGalleries(galleriesData);
            } catch {
                if (!isMounted) {
                    return;
                }

                setProjects([]);
                setEvents([]);
                setGalleries([]);
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, []);

    const galleryImages = galleries.flatMap((gallery) => gallery.images).slice(0, 6);

    return (
        <main className={styles.mainContainer}>
            <section className={styles.sectionInner}>
                <header className={styles.header}>
                    <p className={styles.subtitle}>Platforms & Equipment</p>
                    <h1 className={styles.title}>Platforms and Equipment</h1>
                    <p className={styles.description}>
                        This section is now connected to backend entities for projects, events, and galleries.
                    </p>
                </header>

                <div className={styles.grid}>
                    <article className={styles.card}>
                        <h2 className={styles.cardTitle}>Research Projects</h2>
                        <ul className={styles.list}>
                            {projects.slice(0, 6).map((project) => (
                                <li key={project.id} className={styles.item}>
                                    <p className={styles.itemTitle}>{project.title}</p>
                                    <p className={styles.itemMeta}>Status: {project.status} | Team: {project.team_slug}</p>
                                </li>
                            ))}
                        </ul>
                        {projects.length === 0 && <div className={styles.empty}>No projects found.</div>}
                    </article>

                    <article className={styles.card}>
                        <h2 className={styles.cardTitle}>Upcoming & Recent Events</h2>
                        <ul className={styles.list}>
                            {events.slice(0, 6).map((event) => (
                                <li key={event.id} className={styles.item}>
                                    <p className={styles.itemTitle}>{event.title}</p>
                                    <p className={styles.itemMeta}>{event.event_date || 'N/A'} | {event.location || 'Location TBD'}</p>
                                </li>
                            ))}
                        </ul>
                        {events.length === 0 && <div className={styles.empty}>No events found.</div>}
                    </article>
                </div>

                <article className={styles.card} style={{ marginTop: '1rem' }}>
                    <h2 className={styles.cardTitle}>Gallery Highlights</h2>
                    {galleryImages.length > 0 ? (
                        <div className={styles.galleryWrap}>
                            {galleryImages.map((image) => (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img key={image.id} src={image.image_url} alt={image.caption || 'Gallery image'} className={styles.image} loading="lazy" />
                            ))}
                        </div>
                    ) : (
                        <div className={styles.empty}>No gallery images found.</div>
                    )}
                </article>
            </section>
        </main>
    );
}