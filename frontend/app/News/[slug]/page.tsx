'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getNewsBySlug, type NewsItem } from '@/lib/api';

export default function NewsDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;

  const [item, setItem] = useState<NewsItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!slug) {
      setIsLoading(false);
      setHasError(true);
      return;
    }

    let isMounted = true;

    const loadNews = async () => {
      try {
        setIsLoading(true);
        setHasError(false);
        const data = await getNewsBySlug(slug);
        if (isMounted) {
          setItem(data);
        }
      } catch {
        if (isMounted) {
          setItem(null);
          setHasError(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadNews();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (hasError) {
    return (
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 1rem' }}>
        <p style={{ color: 'var(--text-subtle)' }}>News</p>
        <h1 style={{ marginTop: '0.5rem' }}>Article not found</h1>
        <Link href="/News" style={{ color: 'var(--brand)' }}>Back to news</Link>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 1rem' }}>
      <p style={{ color: 'var(--text-subtle)' }}>News</p>
      <h1 style={{ marginTop: '0.5rem' }}>{isLoading ? 'Loading article...' : item?.title}</h1>
      {!isLoading && item?.cover_image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.cover_image_url}
          alt={item.title}
          style={{ width: '100%', borderRadius: '12px', margin: '1rem 0 1.5rem', maxHeight: '420px', objectFit: 'cover' }}
        />
      )}
      <p style={{ lineHeight: 1.7, color: 'var(--text-muted)' }}>
        {!isLoading ? (item?.body || item?.excerpt || 'Article body is being updated.') : 'Please wait...'}
      </p>
      <div style={{ marginTop: '1.5rem' }}>
        <Link href="/News" style={{ color: 'var(--brand)' }}>Back to news</Link>
      </div>
    </main>
  );
}
