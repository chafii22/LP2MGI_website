'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CalendarDays } from 'lucide-react';
import styles from './News.module.css';
import { getNews, type NewsItem } from '@/lib/api';

type NewsCategory = 'All' | string;

type NewsCardItem = {
	slug: string;
	title: string;
	excerpt: string;
	category: string;
	publishedAt: string;
	imageUrl: string;
};

const fallbackNewsItems: NewsCardItem[] = [
	{
		slug: 'ai-healthcare-symposium-2026',
		title: 'AI for Healthcare Symposium 2026',
		excerpt:
			'Researchers and industry experts gathered at LP2MGI to discuss practical AI-driven diagnostics, predictive analytics, and ethical frameworks for future healthcare systems.',
		category: 'Conference',
		publishedAt: 'March 02, 2026',
		imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80',
	},
	{
		slug: 'smart-campus-innovation-day',
		title: 'Smart Campus Innovation Day',
		excerpt:
			'Students and faculty showcased prototypes focused on IoT-enabled classrooms, resource optimization, and intelligent monitoring for a smarter and greener campus.',
		category: 'Event',
		publishedAt: 'February 18, 2026',
		imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80',
	},
	{
		slug: 'data-science-bootcamp-spring',
		title: 'Data Science Bootcamp - Spring Session',
		excerpt:
			'A hands-on workshop series introducing machine learning pipelines, model evaluation, and deployment fundamentals for early-career researchers and master students.',
		category: 'Workshop',
		publishedAt: 'January 29, 2026',
		imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=900&q=80',
	},
	{
		slug: 'renewable-systems-research-meetup',
		title: 'Renewable Systems Research Meetup',
		excerpt:
			'The lab organized an interdisciplinary event around smart-grid modeling and sustainable control systems to accelerate energy transition research outcomes.',
		category: 'Event',
		publishedAt: 'January 12, 2026',
		imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=900&q=80',
	},
];

function formatDate(value: string | null): string {
	if (!value) {
		return 'Date not specified';
	}

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return value;
	}

	return new Intl.DateTimeFormat('en-US', {
		month: 'long',
		day: '2-digit',
		year: 'numeric',
	}).format(date);
}

function getCategoryClass(category: string): string {
	const value = category.toLowerCase();

	if (value.includes('event')) {
		return styles.categoryTagEvent;
	}

	if (value.includes('conference')) {
		return styles.categoryTagConference;
	}

	if (value.includes('workshop')) {
		return styles.categoryTagWorkshop;
	}

	return styles.categoryTagConference;
}

export default function NewsPage() {
	const [newsItems, setNewsItems] = useState<NewsCardItem[]>([]);
	const [activeFilter, setActiveFilter] = useState<NewsCategory>('All');

	useEffect(() => {
		let isMounted = true;

		const loadNews = async () => {
			try {
				const data = await getNews();
				if (!isMounted) {
					return;
				}

				const mappedItems = data.map((item: NewsItem) => ({
					slug: item.slug,
					title: item.title,
					excerpt: item.excerpt || item.body || 'News details are being updated.',
					category: item.category || 'General',
					publishedAt: formatDate(item.published_at),
					imageUrl: item.cover_image_url || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80',
				}));

				setNewsItems(mappedItems);
			} catch {
				if (isMounted) {
					setNewsItems([]);
				}
			}
		};

		loadNews();

		return () => {
			isMounted = false;
		};
	}, []);

	const newsToRender = newsItems.length ? newsItems : fallbackNewsItems;

	const categoryFilters = useMemo<NewsCategory[]>(() => {
		const categories = Array.from(new Set(newsToRender.map((item) => item.category)));
		return ['All', ...categories];
	}, [newsToRender]);

	const filteredNews = useMemo(() => {
		if (activeFilter === 'All') {
			return newsToRender;
		}

		return newsToRender.filter((item) => item.category === activeFilter);
	}, [activeFilter, newsToRender]);

	return (
		<main className={styles.mainContainer}>
			<section className={styles.headerSection}>
				<div className={styles.headerContent}>
					<p className={styles.subtitle}>Stay Updated</p>
					<h1 className={styles.title}>Latest News</h1>
				</div>
			</section>

			<section className={styles.newsSection}>
				<div className={styles.newsContent}>
					<div className={styles.filterBar}>
						{categoryFilters.map((filter) => {
							const isActive = activeFilter === filter;

							return (
								<button
									key={filter}
									type="button"
									className={`${styles.filterButton} ${isActive ? styles.filterButtonActive : ''}`}
									onClick={() => setActiveFilter(filter)}
								>
									{filter}
								</button>
							);
						})}
					</div>

					<div className={styles.newsList}>
						{filteredNews.map((item) => (
							<article key={item.slug} className={styles.newsCard}>
								<div className={styles.imageWrapper}>
									{/* eslint-disable-next-line @next/next/no-img-element */}
									<img src={item.imageUrl} alt={item.title} className={styles.newsImage} loading="lazy" />
								</div>

								<div className={styles.newsBody}>
									<div className={styles.cardMeta}>
										<span className={`${styles.categoryTag} ${getCategoryClass(item.category)}`}>
											{item.category}
										</span>
										<span className={styles.publishDate}>
											<CalendarDays size={14} className={styles.dateIcon} aria-hidden="true" />
											{item.publishedAt}
										</span>
									</div>

									<h2 className={styles.newsTitle}>{item.title}</h2>
									<p className={styles.newsExcerpt}>{item.excerpt}</p>

									<Link href={`/News/${item.slug}`} className={styles.readMoreButton}>
										Read More
									</Link>
								</div>
							</article>
						))}
					</div>
				</div>
			</section>
		</main>
	);
}
