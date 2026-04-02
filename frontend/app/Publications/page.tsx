'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from './Publications.module.css';
import { getPublications, type PublicationItem } from '@/lib/api';

export default function PublicationsPage() {
    const [items, setItems] = useState<PublicationItem[]>([]);
    const [selectedType, setSelectedType] = useState('all');
    const [selectedYear, setSelectedYear] = useState('all');

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            try {
                const data = await getPublications();
                if (isMounted) {
                    setItems(data);
                }
            } catch {
                if (isMounted) {
                    setItems([]);
                }
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, []);

    const typeOptions = useMemo(() => {
        const values = Array.from(new Set(items.map((item) => item.publication_type))).filter(Boolean);
        return ['all', ...values];
    }, [items]);

    const yearOptions = useMemo(() => {
        const values = Array.from(new Set(items.map((item) => String(item.year || 'unknown'))));
        return ['all', ...values];
    }, [items]);

    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            const typeMatch = selectedType === 'all' || item.publication_type === selectedType;
            const yearMatch = selectedYear === 'all' || String(item.year || 'unknown') === selectedYear;
            return typeMatch && yearMatch;
        });
    }, [items, selectedType, selectedYear]);

    return (
        <main className={styles.mainContainer}>
            <section className={styles.sectionInner}>
                <header className={styles.header}>
                    <p className={styles.subtitle}>Scientific Output</p>
                    <h1 className={styles.title}>Scientific Production</h1>
                    <p className={styles.description}>
                        Publications are loaded from the backend API and can be filtered by type and year.
                    </p>
                </header>

                <div className={styles.filterRow}>
                    <select className={styles.filter} value={selectedType} onChange={(event) => setSelectedType(event.target.value)}>
                        {typeOptions.map((value) => (
                            <option key={value} value={value}>
                                {value === 'all' ? 'All types' : value}
                            </option>
                        ))}
                    </select>

                    <select className={styles.filter} value={selectedYear} onChange={(event) => setSelectedYear(event.target.value)}>
                        {yearOptions.map((value) => (
                            <option key={value} value={value}>
                                {value === 'all' ? 'All years' : value}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.grid}>
                    {filteredItems.map((item) => (
                        <article key={item.id} className={styles.card}>
                            <h3>{item.title}</h3>
                            <div className={styles.meta}>
                                <span className={styles.tag}>{item.publication_type}</span>
                                <span className={styles.tag}>{item.year || 'N/A'}</span>
                                <span className={styles.tag}>{item.team_slug || 'no-team'}</span>
                            </div>
                            <p className={styles.text}>{item.abstract || 'No abstract available.'}</p>
                            <p className={styles.text}>
                                Authors: {item.authors.length ? item.authors.map((author) => author.full_name).join(', ') : 'Not specified'}
                            </p>
                        </article>
                    ))}

                    {filteredItems.length === 0 && (
                        <div className={styles.empty}>No publications found. Seed demo data and refresh this page.</div>
                    )}
                </div>
            </section>
        </main>
    );
}