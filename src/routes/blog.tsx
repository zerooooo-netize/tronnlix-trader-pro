import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  Calendar,
  Clock3,
  Loader2,
  PenLine,
  Search,
  Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Empty } from '@/components/status';
import { supabase } from '@/integrations/supabase/client';
import { date } from '@/lib/format';

export const Route = createFileRoute('/blog')({
  head: () => ({
    meta: [
      { title: 'Insights, Tronnlix Trade' },
      {
        name: 'description',
        content:
          'Perspectives on markets, strategy and disciplined investing from the Tronnlix Trade team.',
      },
      { property: 'og:title', content: 'Insights, Tronnlix Trade' },
      {
        property: 'og:description',
        content:
          'Perspectives on markets, strategy and disciplined investing from the Tronnlix Trade team.',
      },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
  }),
  component: BlogPage,
});

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_url: string | null;
  category: string | null;
  author_name: string | null;
  reading_minutes: number | null;
  published_at: string | null;
  featured: boolean | null;
};

function readingTimeFromExcerpt(text: string | null | undefined) {
  if (!text) return 3;
  return Math.max(2, Math.round(text.split(/\s+/).length / 40));
}

function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'all' | string>('all');

  useEffect(() => {
    supabase
      .from('posts')
      .select('*')
      .order('featured', { ascending: false })
      .order('published_at', { ascending: false })
      .then(({ data }) => {
        setPosts((data ?? []) as Post[]);
        setLoading(false);
      });
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => p.category && set.add(p.category));
    return ['all', ...Array.from(set)];
  }, [posts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      if (category !== 'all' && p.category !== category) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        (p.excerpt ?? '').toLowerCase().includes(q) ||
        (p.author_name ?? '').toLowerCase().includes(q)
      );
    });
  }, [posts, query, category]);

  const [featured, ...rest] = filtered;

  return (
    <>
      <SiteHeader />
      <main className="bg-background">
        {/* Hero */}
        <section className="border-b border-border/70">
          <div className="mx-auto max-w-6xl px-5 pb-12 pt-20 sm:px-8 sm:pb-16 sm:pt-28">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-16">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Insights
                  <span className="mx-2 text-border">/</span>
                  The Tronnlix desk
                </span>
                <h1 className="mt-6 max-w-[22ch] font-display text-4xl font-medium leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl">
                  The thinking behind every move.
                </h1>
                <p className="mt-6 max-w-2xl text-[16px] leading-8 text-muted-foreground">
                  Short, useful pieces on markets, risk and how to stay in control
                  when conditions change. No predictions, no hype.
                </p>
              </div>

              <aside className="lg:pt-20">
                <div className="rounded-2xl border border-border/70 bg-card/60 p-5 backdrop-blur-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    What we write about
                  </p>
                  <ul className="mt-4 space-y-2.5 text-[13px] text-muted-foreground">
                    <li>Risk before reward</li>
                    <li>Process over predictions</li>
                    <li>Reviewing outcomes in context</li>
                  </ul>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* Toolbar */}
        <section className="border-b border-border/70 bg-secondary/40 py-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search insights"
                className="h-10 w-full rounded-full border border-border/70 bg-background/60 pl-9 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {categories.length > 1 && (
              <div className="flex flex-wrap items-center gap-1.5">
                {categories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    className={`rounded-full border px-3 py-1.5 text-[12px] font-medium capitalize transition-colors ${
                      category === c
                        ? 'border-primary/40 bg-primary/10 text-primary'
                        : 'border-border/70 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Posts */}
        <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-16">
          {loading ? (
            <div className="space-y-10">
              <div className="h-72 animate-pulse rounded-3xl bg-secondary/60" />
              <div className="grid gap-6 md:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-56 animate-pulse rounded-2xl bg-secondary/60" />
                ))}
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <Empty
              eyebrow="Nothing published yet"
              title="No insights yet"
              body="The first pieces are being written. Sign in and we will let you know when they land, or explore the market board in the meantime."
              icon={PenLine}
              action={{ label: 'Open an account', href: '/auth?mode=register' }}
              secondaryAction={{ label: 'Explore markets', href: '/markets', variant: 'ghost' }}
            />
          ) : (
            <>
              {/* Featured post */}
              {featured && (
                <motion.article
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="group relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-secondary/60 via-background to-background p-6 sm:p-10"
                >
                  <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:items-center">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                        {featured.category && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-muted/50 px-2.5 py-0.5 font-medium uppercase tracking-wide">
                            <Tag className="h-3 w-3" />
                            {featured.category}
                          </span>
                        )}
                        {featured.published_at && (
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {date(featured.published_at)}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1.5">
                          <Clock3 className="h-3.5 w-3.5" />
                          {featured.reading_minutes ?? readingTimeFromExcerpt(featured.excerpt)} min read
                        </span>
                      </div>

                      <h2 className="mt-4 font-display text-3xl font-medium leading-tight tracking-tight text-foreground sm:text-4xl">
                        {featured.title}
                      </h2>

                      {featured.excerpt && (
                        <p className="mt-4 max-w-xl text-[14.5px] leading-7 text-muted-foreground">
                          {featured.excerpt}
                        </p>
                      )}

                      <div className="mt-6 flex items-center gap-3">
                        {featured.author_name && (
                          <span className="text-[12.5px] text-muted-foreground">
                            By {featured.author_name}
                          </span>
                        )}
                        <Button asChild className="h-10 rounded-full px-5">
                          <Link to="/blog/$slug" params={{ slug: featured.slug }}>
                            Read the piece
                            <ArrowUpRight className="ml-1 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>

                    {featured.cover_url && (
                      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border/70 bg-muted/30">
                        <img
                          src={featured.cover_url}
                          alt=""
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                          loading="lazy"
                        />
                      </div>
                    )}
                  </div>
                </motion.article>
              )}

              {/* Rest of the posts */}
              {rest.length > 0 && (
                <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {rest.map((p, i) => (
                    <motion.article
                      key={p.id}
                      initial={{ opacity: 0, y: 6 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{
                        duration: 0.3,
                        delay: Math.min(i * 0.04, 0.2),
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="group flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-background transition-colors hover:border-primary/40"
                    >
                      {p.cover_url && (
                        <div className="relative aspect-[16/9] overflow-hidden bg-muted/30">
                          <img
                            src={p.cover_url}
                            alt=""
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                            loading="lazy"
                          />
                        </div>
                      )}
                      <div className="flex flex-1 flex-col p-5">
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                          {p.category && (
                            <span className="font-medium uppercase tracking-wide">
                              {p.category}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1.5">
                            <Clock3 className="h-3.5 w-3.5" />
                            {p.reading_minutes ?? readingTimeFromExcerpt(p.excerpt)} min
                          </span>
                        </div>

                        <h3 className="mt-3 font-display text-xl leading-snug tracking-tight text-foreground">
                          {p.title}
                        </h3>

                        {p.excerpt && (
                          <p className="mt-3 line-clamp-3 text-[13px] leading-6 text-muted-foreground">
                            {p.excerpt}
                          </p>
                        )}

                        <div className="mt-5 flex-1" />

                        <div className="flex items-center justify-between border-t border-border/60 pt-4 text-[11.5px] text-muted-foreground">
                          <span>
                            {p.published_at ? date(p.published_at) : 'Draft'}
                            {p.author_name ? ` · ${p.author_name}` : ''}
                          </span>
                          <Link
                            to="/blog/$slug"
                            params={{ slug: p.slug }}
                            className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                          >
                            Read
                            <ArrowUpRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
