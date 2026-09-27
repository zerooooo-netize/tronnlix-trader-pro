import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  BadgeCheck,
  Grid3X3,
  List,
  Loader2,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Empty } from '@/components/status';
import { supabase } from '@/integrations/supabase/client';
import { money } from '@/lib/format';
import type { Database } from '@/integrations/supabase/types';

type Trader = Database['public']['Tables']['traders']['Row'];

export const Route = createFileRoute('/copy-trading')({
  head: () => ({
    meta: [
      { title: 'Copy trading, a considered way to follow markets. Tronnlix Trade' },
      {
        name: 'description',
        content:
          'Compare trading strategies by risk, ROI and experience. Follow a strategy that matches your view.',
      },
      { property: 'og:title', content: 'Copy trading, Tronnlix Trade' },
      {
        property: 'og:description',
        content:
          'Compare trading strategies by risk, ROI and experience. Follow a strategy that matches your view.',
      },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
  }),
  component: CopyPage,
});

type SortKey = 'roi' | 'followers' | 'risk' | 'name';
type ViewMode = 'grid' | 'list';

function CopyPage() {
  const [traders, setTraders] = useState<Trader[]>([]);
  const [loading, setLoading] = useState(true);
  const [signed, setSigned] = useState(false);
  const [query, setQuery] = useState('');
  const [risk, setRisk] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [sort, setSort] = useState<SortKey>('roi');
  const [view, setView] = useState<ViewMode>('grid');

  useEffect(() => {
    supabase
      .from('traders')
      .select('*')
      .then(({ data }) => {
        setTraders(data ?? []);
        setLoading(false);
      });
    supabase.auth.getUser().then(({ data }) => setSigned(!!data.user));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = traders;
    if (q) {
      rows = rows.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          (t.strategy ?? '').toLowerCase().includes(q)
      );
    }
    if (risk !== 'all') rows = rows.filter((t) => t.risk_level === risk);
    return [...rows].sort((a, b) => {
      if (sort === 'roi') return Number(b.roi_12m) - Number(a.roi_12m);
      if (sort === 'followers') return Number(b.followers) - Number(a.followers);
      if (sort === 'risk') return String(a.risk_level).localeCompare(String(b.risk_level));
      return a.name.localeCompare(b.name);
    });
  }, [traders, query, risk, sort]);

  return (
    <>
      <SiteHeader />
      <main className="bg-background">
        {/* Hero, asymmetric */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06] text-foreground [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]"
          />
          <div className="mx-auto max-w-7xl px-5 pb-14 pt-20 sm:px-8 sm:pb-20 sm:pt-28">
            <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Copy trading
                  <span className="mx-2 text-border">/</span>
                  Explore strategies
                </span>
                <h1 className="mt-6 max-w-[20ch] font-display text-4xl font-medium leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl">
                  Follow a strategy, keep control of your capital.
                </h1>
                <p className="mt-8 max-w-2xl text-[16.5px] leading-8 text-muted-foreground sm:text-lg">
                  Compare approach, risk and experience before you follow. Every
                  allocation stays yours to pause, resume or stop at any time.
                </p>
                <div className="mt-8 flex flex-wrap gap-2">
                  <Button asChild className="h-11 rounded-full px-5">
                    <Link to={signed ? '/traders' : '/auth'} search={signed ? undefined : { mode: 'register' }}>
                      {signed ? 'Open my marketplace' : 'Open an account'}
                      <ArrowUpRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-11 rounded-full px-5">
                    <Link to="/pricing">See fees</Link>
                  </Button>
                </div>
              </div>

              <aside className="lg:pt-16">
                <div className="rounded-2xl border border-border/70 bg-card/60 p-5 backdrop-blur-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    What you get
                  </p>
                  <ul className="mt-4 space-y-3 text-sm">
                    {[
                      { icon: ShieldCheck, label: 'Risk score on every strategy' },
                      { icon: TrendingUp, label: 'Transparent 12 month returns' },
                      { icon: Users, label: 'Followers and AUM in one place' },
                      { icon: BadgeCheck, label: 'Only reviewed profiles are listed' },
                    ].map(({ icon: Icon, label }) => (
                      <li key={label} className="flex items-center gap-2.5 text-muted-foreground">
                        <Icon className="h-4 w-4 shrink-0 text-primary" />
                        <span>{label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* Marketplace */}
        <section className="border-y border-border/70 bg-secondary/40 py-14 sm:py-16">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            {/* Toolbar */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-2xl tracking-tight text-foreground">
                  Trading experts
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {filtered.length} {filtered.length === 1 ? 'profile' : 'profiles'} available
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by name"
                    className="h-9 w-full rounded-full border border-border/70 bg-background/60 pl-9 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 sm:w-56"
                  />
                </div>

                <select
                  value={risk}
                  onChange={(e) => setRisk(e.target.value as typeof risk)}
                  className="h-9 rounded-full border border-border/70 bg-background/60 px-3 text-[13px] text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="all">All risk</option>
                  <option value="low">Low risk</option>
                  <option value="medium">Medium risk</option>
                  <option value="high">High risk</option>
                </select>

                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="h-9 rounded-full border border-border/70 bg-background/60 px-3 text-[13px] text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="roi">Sort by ROI</option>
                  <option value="followers">Sort by followers</option>
                  <option value="risk">Sort by risk</option>
                  <option value="name">Sort by name</option>
                </select>

                <div className="hidden items-center rounded-full border border-border/70 bg-background/60 p-0.5 sm:flex">
                  {(['grid', 'list'] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setView(v)}
                      aria-label={`${v} view`}
                      className={`grid h-8 w-8 place-items-center rounded-full transition-colors ${
                        view === v ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      {v === 'grid' ? <Grid3X3 className="h-3.5 w-3.5" /> : <List className="h-3.5 w-3.5" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="mt-8">
              {loading ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-72 animate-pulse rounded-2xl bg-background/60" />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <Empty
                  eyebrow="No match"
                  title="No profiles match your filters"
                  body="Try a different risk level or clear your search."
                  icon={Search}
                  action={{
                    label: 'Clear filters',
                    onClick: () => {
                      setQuery('');
                      setRisk('all');
                    },
                  }}
                  compact
                />
              ) : view === 'grid' ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {filtered.map((t, i) => (
                    <TraderCard key={t.id} trader={t} signed={signed} index={i} />
                  ))}
                </div>
              ) : (
                <ul className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/70 bg-background">
                  {filtered.map((t, i) => (
                    <TraderRow key={t.id} trader={t} signed={signed} index={i} />
                  ))}
                </ul>
              )}
            </div>

            <p className="mt-6 text-xs leading-6 text-muted-foreground">
              Sample profiles and hypothetical performance figures are shown for
              illustration. They are not verified trader returns. Copy trading
              carries risk, including loss of capital. Past performance does not
              predict future results.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

/* ----------------------------------------------------------------- */

function initials(name: string) {
  return name
    .split(' ')
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function riskTone(level: string) {
  const l = level.toLowerCase();
  if (l.includes('low')) return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20';
  if (l.includes('high')) return 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20';
  return 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20';
}

function TraderCard({
  trader,
  signed,
  index,
}: {
  trader: Trader;
  signed: boolean;
  index: number;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: 0.4,
        delay: Math.min(index * 0.04, 0.2),
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group flex flex-col rounded-2xl border border-border/70 bg-background p-5 transition-colors hover:border-primary/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 font-display text-base font-medium text-primary">
          {initials(trader.name)}
        </div>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10.5px] font-medium uppercase tracking-wide ${riskTone(
            trader.risk_level ?? ''
          )}`}
        >
          {trader.risk_level} risk
        </span>
      </div>

      <h3 className="mt-5 flex items-center gap-1.5 font-display text-xl tracking-tight text-foreground">
        {trader.name}
        {trader.featured && (
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-label="Featured" />
        )}
      </h3>
      <p className="mt-2 min-h-[2.5rem] text-[13px] leading-6 text-muted-foreground">
        {trader.strategy}
      </p>

      <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-border/60 pt-4">
        <div>
          <dt className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            12m ROI
          </dt>
          <dd className="mt-1 font-display text-lg tabular-nums text-emerald-600 dark:text-emerald-400">
            +{trader.roi_12m}%
          </dd>
        </div>
        <div>
          <dt className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Followers
          </dt>
          <dd className="mt-1 font-display text-lg tabular-nums text-foreground">
            {Number(trader.followers).toLocaleString()}
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex items-center justify-between text-[11.5px] text-muted-foreground">
        <span>Minimum {money(Number((trader as unknown as { min_investment?: number }).min_investment ?? 100))}</span>
        <span>Illustrative</span>
      </div>

      <div className="mt-5 flex-1" />

      <Button asChild variant="outline" className="mt-4 w-full justify-between">
        <Link to={signed ? '/traders' : '/auth'} search={signed ? undefined : { mode: 'register' }}>
          {signed ? 'Open in marketplace' : 'Open an account to copy'}
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </Button>
    </motion.article>
  );
}

function TraderRow({
  trader,
  signed,
  index,
}: {
  trader: Trader;
  signed: boolean;
  index: number;
}) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 4 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.02, 0.15) }}
      className="flex flex-col gap-4 bg-background px-5 py-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 font-display text-sm font-medium text-primary">
          {initials(trader.name)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-[14px] font-medium text-foreground">
            {trader.name}
            {trader.featured && (
              <Star className="ml-1.5 inline h-3 w-3 fill-amber-400 text-amber-400" />
            )}
          </p>
          <p className="mt-1 truncate text-[11.5px] text-muted-foreground">
            {trader.strategy}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-4 self-end sm:self-auto">
        <span className="hidden text-[11.5px] text-muted-foreground sm:inline">
          <span className="font-display text-emerald-600 dark:text-emerald-400">+{trader.roi_12m}%</span>{' '}
          12m
        </span>
        <span className="text-[11.5px] text-muted-foreground">
          {Number(trader.followers).toLocaleString()} followers
        </span>
        <span
          className={`hidden rounded-full border px-2 py-0.5 text-[10.5px] font-medium uppercase tracking-wide sm:inline ${riskTone(
            trader.risk_level ?? ''
          )}`}
        >
          {trader.risk_level}
        </span>
        <Button asChild size="sm" variant="outline" className="rounded-full">
          <Link to={signed ? '/traders' : '/auth'} search={signed ? undefined : { mode: 'register' }}>
            {signed ? 'Open' : 'Register'}
            <ArrowUpRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </div>
    </motion.li>
  );
}
