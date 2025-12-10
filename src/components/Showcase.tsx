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
  const [primaryIndex, setPrimaryIndex] = useState(0);
  const [secondaryIndex, setSecondaryIndex] = useState(0);

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

  const filteredPosts = useMemo(() => {
    if (!activeTag) return posts;
    return posts.filter((post) => {
      const target = activeTag.toLowerCase();
      return [post.keyword_text, post.text].some((field) =>
        field ? field.toLowerCase().includes(target) : false
      );
    });
  }, [activeTag, posts]);

  const primaryGrid = filteredPosts.slice(0, 9);
  const secondaryGrid = filteredPosts.slice(9, 18);

  useEffect(() => {
    setPrimaryIndex(0);
    setSecondaryIndex(0);
  }, [activeTag, filteredPosts.length]);

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
            <p className="text-sm text-[var(--text-secondary)]">Swipe through and tap to share instantly.</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
              {[
                { title: "Fresh drops", posts: primaryGrid, index: primaryIndex, setIndex: setPrimaryIndex },
                { title: "More to share", posts: secondaryGrid, index: secondaryGrid.length ? secondaryIndex : primaryIndex, setIndex: secondaryGrid.length ? setSecondaryIndex : setPrimaryIndex },
              ]
                .filter((group) => group.posts.length > 0)
                .map((group, gridIdx) => {
                  const currentPost = group.posts[group.index % group.posts.length];
                  return (
                    <div
                      key={gridIdx}
                      className="rounded-2xl p-2"
                    >
                      <div className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
                        <span>{group.title}</span>
                        <span className="flex items-center gap-2 text-[10px] rounded-full bg-white/10 px-2 py-1">
                          <span className="h-2.5 w-2.5 rounded-full bg-[#25D366]" />
                          {activeTag || "All"}
                        </span>
                      </div>

                      {postsLoading ? (
                        <div className="flex h-full items-center justify-center py-10">
                          <span className="h-12 w-12 animate-spin rounded-full border-2 border-white/20 border-t-white/70" />
                        </div>
                      ) : (
                        <div className="relative flex items-center justify-center">
                          <button
                            aria-label="Previous status"
                            onClick={() => group.setIndex((prev) => (prev - 1 + group.posts.length) % group.posts.length)}
                            className="absolute -left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/30 px-2 py-2 text-white shadow hover:bg-black/50"
                          >
                            ‹
                          </button>
                          <a
                            href={`https://wa.me/?text=${encodeURIComponent(
                              `${currentPost.text}\n\nMeanIn.com/${currentPost.public_slug || ""}`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="group relative block aspect-[9/16] w-full max-w-[320px] overflow-hidden rounded-[22px] bg-gradient-to-b from-[#0d8a78] via-[#0f7f71] to-[#0a5f52] text-white shadow-[0_20px_48px_rgba(0,0,0,0.32)] transition hover:scale-[1.01]"
                          >
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.16),transparent_38%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.12),transparent_32%)]" />
                            <div className="absolute inset-x-4 top-4 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.2em]">
                              <span className="flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-full bg-[#25D366] shadow-[0_0_0_3px_rgba(255,255,255,0.12)]" />
                                Status
                              </span>
                              <span className="flex items-center gap-1 rounded-full bg-white/15 px-2 py-1 text-[10px]">
                                <span>📤</span>
                                Share
                              </span>
                            </div>
                            <div className="relative flex h-full flex-col justify-center px-5 text-center">
                              <p className="text-lg font-semibold leading-relaxed sm:text-xl">
                                {currentPost.text}
                              </p>
                            </div>
                            <div className="absolute inset-x-4 bottom-4 flex items-center justify-between text-xs text-white/80">
                              <span className="truncate">{currentPost.keyword_text}</span>
                              <span className="rounded-full bg-white/15 px-2 py-1 text-[11px] font-semibold">
                                MeanIn
                              </span>
                            </div>
                          </a>
                          <button
                            aria-label="Next status"
                            onClick={() => group.setIndex((prev) => (prev + 1) % group.posts.length)}
                            className="absolute -right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/30 px-2 py-2 text-white shadow hover:bg-black/50"
                          >
                            ›
                          </button>
                        </div>
                      )}

                      <div className="mt-3 flex items-center justify-center gap-2">
                        {group.posts.map((_, dotIdx) => (
                          <button
                            key={dotIdx}
                            onClick={() => group.setIndex(dotIdx)}
                            className={`h-2.5 w-2.5 rounded-full transition ${dotIdx === group.index % group.posts.length ? "bg-white" : "bg-white/30"}`}
                            aria-label={`Go to status ${dotIdx + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
      )}
    </section>
  );
}
