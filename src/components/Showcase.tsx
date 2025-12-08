'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface ShowcasePost {
  id: string;
  text: string;
  keyword_text: string;
  public_slug: string;
  created_at: string;
}

// Generate a color based on keyword for consistent card backgrounds
function getCardGradient(keyword: string): string {
  const hash = keyword.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const gradients = [
    '#1a1a2e, #16213e, #0f3460',
    '#2d1b4e, #462255, #5e3a6e',
    '#1e3a5f, #2e5a7e, #3d7a9e',
    '#2c3e50, #34495e, #4a6278',
    '#1f1f2e, #2a2a40, #383850',
    '#0d1b2a, #1b263b, #415a77',
  ];
  return gradients[hash % gradients.length];
}

export function Showcase() {
  const [posts, setPosts] = useState<ShowcasePost[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShowcase();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory]);

  const fetchShowcase = async () => {
    try {
      const params = new URLSearchParams();
      if (activeCategory !== 'All') {
        params.set('category', activeCategory);
      }
      
      const res = await fetch(`/api/showcase?${params}`);
      const data = await res.json();
      
      setPosts(data.posts || []);
      if (data.categories?.length && categories.length === 0) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error fetching showcase:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (post: ShowcasePost) => {
    const shareUrl = `${window.location.origin}/p/${post.public_slug}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `"${post.keyword_text}" decoded`,
          text: post.text,
          url: shareUrl,
        });
      } catch {
        // User cancelled or share failed, copy to clipboard as fallback
        await navigator.clipboard.writeText(shareUrl);
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
    }
  };

  // If no posts, don't render the section
  if (!loading && posts.length === 0) {
    return null;
  }

  return (
    <section id="showcase" className="relative w-full py-12 sm:py-16">
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-3xl sm:text-4xl font-semibold text-[var(--text-primary)] mb-4">
          Meet beautiful meanings
          <br />
          <span className="text-[var(--text-secondary)]">decoded with MeanIn</span>
        </h2>
      </div>

      {/* Category Tabs */}
      {categories.length > 0 && (
        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center gap-1 p-1 rounded-full bg-[var(--card-bg)] border border-[var(--border-color)]">
            <button
              onClick={() => setActiveCategory('All')}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                activeCategory === 'All'
                  ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                  activeCategory === cat
                    ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[4/3] rounded-xl bg-[var(--card-bg)]" />
              <div className="mt-3 h-5 w-24 rounded bg-[var(--card-bg)]" />
              <div className="mt-1 h-4 w-20 rounded bg-[var(--card-bg)]" />
            </div>
          ))}
        </div>
      )}

      {/* Posts Grid */}
      {!loading && posts.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, index) => (
            <div key={post.id} className="group">
              {/* Card Preview */}
              <Link
                href={`/p/${post.public_slug}`}
                className="block relative aspect-[4/3] rounded-xl overflow-hidden border border-[var(--border-color)] transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-lg"
              >
                {/* Animated gradient background */}
                <div
                  className="absolute inset-0 animate-gradient-shift"
                  style={{
                    background: `linear-gradient(135deg, ${getCardGradient(post.keyword_text)})`,
                    backgroundSize: '200% 200%',
                    animationDelay: `${index * 0.5}s`,
                  }}
                />
                {/* Share Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleShare(post);
                  }}
                  className="absolute top-3 right-3 p-2 rounded-lg bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white/70 hover:text-white transition-all opacity-0 group-hover:opacity-100 z-10"
                  aria-label="Share or download"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
                    <polyline points="16 6 12 2 8 6" />
                    <line x1="12" y1="2" x2="12" y2="15" />
                  </svg>
                </button>

                {/* Card Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <p className="text-white/80 text-sm sm:text-base leading-relaxed line-clamp-4">
                    &ldquo;{post.text}&rdquo;
                  </p>
                </div>
              </Link>

              {/* Title + Arrow */}
              <Link
                href={`/p/${post.public_slug}`}
                className="mt-3 flex items-center gap-1"
              >
                <span className="text-[var(--text-primary)] font-medium group-hover:text-[var(--electric-blue)] transition-colors">
                  {post.keyword_text}
                </span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[var(--text-primary)] group-hover:text-[var(--electric-blue)] transition-all group-hover:translate-x-0.5"
                >
                  <line x1="7" y1="17" x2="17" y2="7" />
                  <polyline points="7 7 17 7 17 17" />
                </svg>
              </Link>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}