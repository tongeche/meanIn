'use client';

import { useEffect, useMemo, useState } from 'react';

type Category = { label: string; slug: string; bg_gradient?: string | null; text_color?: string | null; accent_color?: string | null };
type ShowcasePost = { id: string; text: string; keyword_text: string; public_slug: string; created_at: string };

// Keep category labels short for mobile while preserving the full value on hover
function formatCategoryLabel(cat: string) {
  return cat.length > 16 ? `${cat.slice(0, 16)}…` : cat;
}

export function Showcase() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [posts, setPosts] = useState<ShowcasePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    (async () => {
      try {
        const res = await fetch(`/api/showcase`);
        const data = await res.json();

        if (!isMounted) return;
        if (data.categories?.length) {
          setCategories(data.categories);
          setActiveTag(data.categories[0]?.slug || data.categories[0]?.label || null);
        }
        if (data.posts?.length) {
          setPosts(data.posts);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching showcase:', error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!activeTag) return;
    let isMounted = true;
    setPostsLoading(true);

    (async () => {
      try {
        const res = await fetch(`/api/showcase?tag=${encodeURIComponent(activeTag)}`);
        const data = await res.json();
        if (!isMounted) return;
        if (Array.isArray(data.posts)) {
          setPosts(data.posts);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error fetching posts for tag:", error);
        }
      } finally {
        if (isMounted) {
          setPostsLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [activeTag]);

  const statusSlides = useMemo(() => {
    if (posts.length === 0) return [];
    const pool = [...posts];
    // Fisher-Yates shuffle for randomness
    for (let i = pool.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const desired = 20;
    const selected = pool.slice(0, Math.min(desired, pool.length));
    if (selected.length < desired) {
      const looped: ShowcasePost[] = [];
      for (let i = 0; i < desired; i += 1) {
        looped.push(selected[i % selected.length]);
      }
      return looped;
    }
    return selected;
  }, [posts]);

  const marqueeSlides = useMemo(
    () => (statusSlides.length ? [...statusSlides, ...statusSlides] : []),
    [statusSlides]
  );

  if (!loading && categories.length === 0) {
    return null;
  }

  return (
    <section id="showcase" className="relative w-full py-12 sm:py-16">
      <style jsx global>{`
        @keyframes showcase-marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        @keyframes status-marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-semibold text-[var(--text-primary)] mb-2">
          Made by MeanIn
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">Recent tags and meanings crafted for you</p>
      </div>

      {/* Tag Marquee */}
      {categories.length > 0 && (
        <div className="relative mb-10 overflow-hidden">
          <div
            className="flex gap-8 whitespace-nowrap"
            style={{ animation: "showcase-marquee 24s linear infinite", width: "200%" }}
          >
            {[...categories, ...categories].map((cat, idx) => {
              const isActive = activeTag === cat.slug || activeTag === cat.label;
              return (
                <button
                  key={`${cat.slug}-${idx}`}
                  onClick={() => setActiveTag(cat.slug || cat.label)}
                  className={`inline-flex items-center px-4 py-2 text-lg font-semibold ${
                    isActive ? 'text-[var(--text-primary)] border border-[var(--text-primary)] rounded-full' : 'text-[var(--text-secondary)] border border-transparent'
                  } bg-transparent transition`}
                  title={cat.label || cat.slug}
                >
                  {formatCategoryLabel(cat.label || cat.slug)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && categories.length === 0 && (
        <div className="flex flex-wrap justify-center gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <span
              key={i}
              className="h-10 w-28 animate-pulse rounded-full bg-[var(--card-bg)]"
            />
          ))}
        </div>
      )}

      {/* WhatsApp-style shareable cards */}
      {!loading && (
        <div className="mt-12 space-y-4">
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-[var(--text-primary)]">Share-ready WhatsApp cards</h3>
            <p className="text-sm text-[var(--text-secondary)]">Auto-scrolling picks—tap any card to share instantly.</p>
          </div>

          <div className="relative">
              {postsLoading || marqueeSlides.length === 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
                  {Array.from({ length: 10 }).map((_, idx) => (
                    <div key={idx} className="aspect-[9/16] rounded-2xl bg-white/10 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="relative overflow-hidden">
                  <div
                    className="flex gap-4"
                    style={{
                      width: `${marqueeSlides.length * 170}px`,
                      animation: "status-marquee 30s linear infinite",
                    }}
                  >
                    {marqueeSlides.map((post, idx) => {
                      const shareUrl = `https://wa.me/?text=${encodeURIComponent(
                        `${post.text}\n\nMeanIn.com/${post.public_slug || ""}`
                      )}`;
                      return (
                        <a
                          key={`${post.id}-${idx}`}
                          href={shareUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="group relative block aspect-[9/16] w-[160px] min-w-[160px] overflow-hidden rounded-[22px] bg-gradient-to-b from-[#0d8a78] via-[#0f7f71] to-[#0a5f52] text-white shadow-[0_20px_48px_rgba(0,0,0,0.32)] transition hover:scale-[1.02]"
                        >
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.16),transparent_38%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.12),transparent_32%)]" />
                          
                          <div className="relative flex h-full flex-col justify-center px-4 text-center">
                            <p className="text-base font-semibold leading-relaxed sm:text-lg line-clamp-8">
                              {post.text}
                            </p>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
      )}
    </section>
  );
}
