import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  Bookmark,
  CheckCircle2,
  ChevronDown,
  Grid3X3,
  List,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  TrendingDown,
  TrendingUp,
  Users,
  X,
  Zap,
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
      {
        title: 'Copy Trading Marketplace | Tronnlix Trade',
      },
      {
        name: 'description',
        content:
          'Explore verified trading strategies, compare performance and risk, and choose an approach that fits your investment goals.',
      },
      {
        property: 'og:title',
        content: 'Copy Trading Marketplace | Tronnlix Trade',
      },
      {
        property: 'og:description',
        content:
          'Explore verified trading strategies and compare performance, risk and experience.',
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
    ],
  }),
  component: CopyPage,
});

type SortKey = 'roi' | 'followers' | 'risk' | 'name';
type ViewMode = 'grid' | 'list';
type RiskFilter = 'all' | 'low' | 'medium' | 'high';

function CopyPage() {
  const [traders, setTraders] = useState<Trader[]>([]);
  const [loading, setLoading] = useState(true);
  const [signed, setSigned] = useState(false);

  const [query, setQuery] = useState('');
  const [risk, setRisk] = useState<RiskFilter>('all');
  const [sort, setSort] = useState<SortKey>('roi');
  const [view, setView] = useState<ViewMode>('grid');

  const [mobileFilters, setMobileFilters] = useState(false);
  const [selectedTrader, setSelectedTrader] = useState<string | null>(null);
  const [bookmarked, setBookmarked] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const [{ data: traderData }, { data: userData }] =
        await Promise.all([
          supabase.from('traders').select('*'),
          supabase.auth.getUser(),
        ]);

      if (!mounted) return;

      setTraders(traderData ?? []);
      setSigned(!!userData.user);
      setLoading(false);
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    let rows = [...traders];

    if (q) {
      rows = rows.filter((trader) => {
        return (
          trader.name.toLowerCase().includes(q) ||
          (trader.strategy ?? '').toLowerCase().includes(q) ||
          (trader.risk_level ?? '').toLowerCase().includes(q)
        );
      });
    }

    if (risk !== 'all') {
      rows = rows.filter(
        (trader) => trader.risk_level?.toLowerCase() === risk
      );
    }

    rows.sort((a, b) => {
      if (sort === 'roi') {
        return Number(b.roi_12m) - Number(a.roi_12m);
      }

      if (sort === 'followers') {
        return Number(b.followers) - Number(a.followers);
      }

      if (sort === 'risk') {
        return String(a.risk_level).localeCompare(
          String(b.risk_level)
        );
      }

      return a.name.localeCompare(b.name);
    });

    return rows;
  }, [traders, query, risk, sort]);

  const featured = useMemo(
    () => traders.filter((trader) => trader.featured).slice(0, 3),
    [traders]
  );

  const toggleBookmark = (id: string) => {
    setBookmarked((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const clearFilters = () => {
    setQuery('');
    setRisk('all');
    setSort('roi');
  };

  return (
    <>
      <SiteHeader />

      <main className="min-h-dvh bg-background">
        {/* ============================================================
            HERO
        ============================================================ */}

        <section className="relative overflow-hidden border-b border-border/60">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
          >
            <div className="absolute -left-32 top-0 h-[420px] w-[420px] rounded-full bg-primary/[0.035] blur-3xl" />

            <div
              className="absolute inset-0 opacity-[0.035]"
              style={{
                backgroundImage:
                  'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)',
                backgroundSize: '72px 72px',
                maskImage:
                  'linear-gradient(to bottom, black, transparent 80%)',
              }}
            />

            <svg
              className="absolute right-[-8%] top-12 hidden h-[360px] w-[620px] text-primary/[0.09] lg:block"
              viewBox="0 0 620 360"
              fill="none"
            >
              <path
                d="M0 280C42 274 51 221 91 234C125 245 131 183 174 195C215 207 223 238 262 207C300 177 312 199 345 163C378 127 408 160 438 122C467 86 495 109 520 72C548 32 574 49 620 18"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M0 310C55 306 70 277 110 285C149 293 165 247 199 256C240 268 252 246 286 230C321 214 350 225 384 193C423 157 444 185 477 149C510 113 546 135 573 99C593 72 607 62 620 55"
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="5 7"
              />
            </svg>
          </div>

          <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-16 sm:px-8 sm:pb-20 sm:pt-24 lg:px-10 lg:pt-28">
            <div className="grid gap-14 lg:grid-cols-[minmax(0,1.15fr)_390px] lg:items-end lg:gap-20">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground backdrop-blur">
                  <Sparkles className="h-3 w-3 text-primary" />
                  Copy trading marketplace
                </div>

                <h1 className="mt-7 max-w-4xl font-display text-[42px] font-medium leading-[1.02] tracking-[-0.045em] text-foreground sm:text-6xl lg:text-[72px]">
                  Don't just watch the market.
                  <span className="block text-muted-foreground/70">
                    Choose how you want to trade it.
                  </span>
                </h1>

                <p className="mt-7 max-w-2xl text-[16px] leading-8 text-muted-foreground sm:text-[17px]">
                  Explore experienced trading strategies, understand the risk
                  behind the numbers, and decide which approach belongs in
                  your portfolio.
                </p>

                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <Button
                    asChild
                    className="h-12 rounded-xl px-6 shadow-sm"
                  >
                    <Link
                      to={signed ? '/traders' : '/auth'}
                      search={
                        signed ? undefined : { mode: 'register' }
                      }
                    >
                      {signed
                        ? 'Explore the marketplace'
                        : 'Create your account'}
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    className="h-12 rounded-xl px-6"
                  >
                    <Link to="/pricing">
                      Understand the fees
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Market snapshot */}
              <div className="relative">
                <div className="absolute -inset-5 rounded-[32px] bg-primary/[0.025] blur-2xl" />

                <div className="relative overflow-hidden rounded-[24px] border border-border/70 bg-card/70 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.05)] backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Marketplace
                      </p>
                      <p className="mt-1 text-sm font-medium">
                        Strategy snapshot
                      </p>
                    </div>

                    <span className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Live data
                    </span>
                  </div>

                  <div className="mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border/60 bg-border/60">
                    <Snapshot
                      label="Strategies"
                      value={traders.length.toString()}
                    />
                    <Snapshot
                      label="Featured"
                      value={featured.length.toString()}
                    />
                    <Snapshot
                      label="Risk levels"
                      value="3"
                    />
                    <Snapshot
                      label="Control"
                      value="24/7"
                    />
                  </div>

                  <div className="mt-5 flex items-start gap-3 rounded-xl bg-muted/50 p-4">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

                    <p className="text-xs leading-5 text-muted-foreground">
                      Your capital remains under your control. Copy
                      relationships can be paused or stopped according to
                      the platform's rules.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            FEATURED STRATEGIES
        ============================================================ */}

        {featured.length > 0 && (
          <section className="border-b border-border/60 bg-muted/[0.22]">
            <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
              <div className="flex items-end justify-between gap-5">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-primary">
                    Curated strategies
                  </p>
                  <h2 className="mt-2 font-display text-2xl tracking-[-0.025em] sm:text-3xl">
                    Featured this week
                  </h2>
                </div>

                <span className="hidden text-xs text-muted-foreground sm:block">
                  Selected by the Tronnlix team
                </span>
              </div>

              <div className="mt-7 grid gap-4 lg:grid-cols-3">
                {featured.map((trader, index) => (
                  <FeaturedTrader
                    key={trader.id}
                    trader={trader}
                    index={index}
                    signed={signed}
                    bookmarked={bookmarked.includes(trader.id)}
                    onBookmark={() => toggleBookmark(trader.id)}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ============================================================
            MARKETPLACE
        ============================================================ */}

        <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16 lg:px-10">
          <div className="flex flex-col gap-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-muted-foreground">
                  All strategies
                </p>

                <h2 className="mt-2 font-display text-3xl tracking-[-0.035em] sm:text-4xl">
                  Find your approach
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                  Compare performance, risk and investor activity before
                  opening a copy relationship.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden items-center rounded-xl border border-border/70 bg-background p-1 sm:flex">
                  <ViewToggle
                    active={view === 'grid'}
                    onClick={() => setView('grid')}
                    label="Grid"
                  >
                    <Grid3X3 className="h-3.5 w-3.5" />
                  </ViewToggle>

                  <ViewToggle
                    active={view === 'list'}
                    onClick={() => setView('list')}
                    label="List"
                  >
                    <List className="h-3.5 w-3.5" />
                  </ViewToggle>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileFilters(true)}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-border/70 bg-background px-3 text-xs font-semibold text-foreground sm:hidden"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Filters
                </button>
              </div>
            </div>

            {/* Desktop filter bar */}
            <div className="hidden items-center gap-2 border-y border-border/60 py-3 sm:flex">
              <div className="relative min-w-[240px] flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search strategies, names or risk levels"
                  className="h-10 w-full rounded-xl border border-border/70 bg-muted/20 pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>

              <FilterSelect
                value={risk}
                onChange={(value) => setRisk(value as RiskFilter)}
                options={[
                  ['all', 'All risk levels'],
                  ['low', 'Lower risk'],
                  ['medium', 'Medium risk'],
                  ['high', 'Higher risk'],
                ]}
              />

              <FilterSelect
                value={sort}
                onChange={(value) => setSort(value as SortKey)}
                options={[
                  ['roi', 'Highest ROI'],
                  ['followers', 'Most followed'],
                  ['risk', 'Risk level'],
                  ['name', 'Name'],
                ]}
              />

              {(query || risk !== 'all') && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear
                </button>
              )}
            </div>

            {/* Results */}
            <div>
              <div className="mb-5 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {filtered.length}
                  </span>{' '}
                  {filtered.length === 1 ? 'strategy' : 'strategies'}
                </p>

                <p className="hidden text-xs text-muted-foreground sm:block">
                  Performance figures are historical
                </p>
              </div>

              {loading ? (
                <TraderSkeletons />
              ) : filtered.length === 0 ? (
                <Empty
                  eyebrow="No results"
                  title="Nothing matches those filters"
                  body="Try a different search term or broaden your risk selection."
                  icon={Search}
                  action={{
                    label: 'Clear filters',
                    onClick: clearFilters,
                  }}
                  compact
                />
              ) : view === 'grid' ? (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {filtered.map((trader, index) => (
                    <TraderCard
                      key={trader.id}
                      trader={trader}
                      signed={signed}
                      index={index}
                      bookmarked={bookmarked.includes(trader.id)}
                      selected={selectedTrader === trader.id}
                      onBookmark={() => toggleBookmark(trader.id)}
                      onSelect={() =>
                        setSelectedTrader(
                          selectedTrader === trader.id
                            ? null
                            : trader.id
                        )
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="overflow-hidden rounded-[20px] border border-border/70 bg-card">
                  {filtered.map((trader, index) => (
                    <TraderRow
                      key={trader.id}
                      trader={trader}
                      signed={signed}
                      index={index}
                      bookmarked={bookmarked.includes(trader.id)}
                      onBookmark={() => toggleBookmark(trader.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-border/60 pt-6">
              <p className="max-w-3xl text-[11px] leading-5 text-muted-foreground">
                Copy trading involves risk, including possible loss of
                capital. Historical performance, ROI and other statistics
                are not guarantees of future results. Information shown on
                this marketplace should be considered before making an
                investment decision.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Mobile filter drawer */}
      {mobileFilters && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <button
            type="button"
            aria-label="Close filters"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileFilters(false)}
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="absolute inset-x-0 bottom-0 rounded-t-[28px] border-t border-border bg-background p-5 pb-[calc(20px+env(safe-area-inset-bottom))] shadow-2xl"
          >
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-border" />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Marketplace
                </p>
                <h3 className="mt-1 text-xl font-semibold">
                  Filter strategies
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setMobileFilters(false)}
                className="grid h-9 w-9 place-items-center rounded-full bg-muted"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <label className="text-xs font-semibold">
                  Search
                </label>

                <div className="relative mt-2">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search traders"
                    className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold">
                  Risk
                </label>

                <div className="mt-2 grid grid-cols-2 gap-2">
                  {[
                    ['all', 'All risk'],
                    ['low', 'Lower risk'],
                    ['medium', 'Medium risk'],
                    ['high', 'Higher risk'],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setRisk(value as RiskFilter)
                      }
                      className={[
                        'rounded-xl border px-3 py-3 text-left text-xs font-semibold transition-colors',
                        risk === value
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border text-muted-foreground',
                      ].join(' ')}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold">
                  Sort
                </label>

                <select
                  value={sort}
                  onChange={(event) =>
                    setSort(event.target.value as SortKey)
                  }
                  className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
                >
                  <option value="roi">Highest ROI</option>
                  <option value="followers">Most followed</option>
                  <option value="risk">Risk level</option>
                  <option value="name">Name</option>
                </select>
              </div>

              <Button
                className="h-11 w-full rounded-xl"
                onClick={() => setMobileFilters(false)}
              >
                Show {filtered.length} strategies
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      <SiteFooter />
    </>
  );
}

/* ================================================================
   SMALL COMPONENTS
================================================================ */

function Snapshot({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="bg-background p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">
        {label}
      </p>

      <p className="mt-2 font-display text-xl tabular-nums">
        {value}
      </p>
    </div>
  );
}

function ViewToggle({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={`${label} view`}
      onClick={onClick}
      className={[
        'grid h-8 w-8 place-items-center rounded-lg transition-colors',
        active
          ? 'bg-foreground text-background'
          : 'text-muted-foreground hover:text-foreground',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 appearance-none rounded-xl border border-border/70 bg-background py-0 pl-3 pr-9 text-xs font-medium outline-none transition-colors focus:border-primary"
      >
        {options.map(([optionValue, label]) => (
          <option key={optionValue} value={optionValue}>
            {label}
          </option>
        ))}
      </select>

      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

/* ================================================================
   FEATURED TRADER
================================================================ */

function FeaturedTrader({
  trader,
  index,
  signed,
  bookmarked,
  onBookmark,
}: {
  trader: Trader;
  index: number;
  signed: boolean;
  bookmarked: boolean;
  onBookmark: () => void;
}) {
  const minInvestment = Number(
    (trader as unknown as { min_investment?: number })
      .min_investment ?? 100
  );

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.45,
        delay: index * 0.07,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group relative overflow-hidden rounded-[22px] border border-border/70 bg-background p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_18px_50px_rgba(15,23,42,0.07)]"
    >
      <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-primary/[0.035] blur-3xl transition-transform duration-500 group-hover:scale-150" />

      <div className="relative flex items-start justify-between">
        <div className="flex items-center gap-3">
          <TraderAvatar trader={trader} size="lg" />

          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold tracking-[-0.015em]">
                {trader.name}
              </h3>

              <BadgeCheck className="h-4 w-4 text-primary" />
            </div>

            <p className="mt-1 text-[11px] text-muted-foreground">
              Featured strategy
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onBookmark}
          aria-label={
            bookmarked
              ? `Remove ${trader.name} from bookmarks`
              : `Bookmark ${trader.name}`
          }
          className={[
            'grid h-9 w-9 place-items-center rounded-full border transition-colors',
            bookmarked
              ? 'border-primary/30 bg-primary/5 text-primary'
              : 'border-border/70 text-muted-foreground hover:text-foreground',
          ].join(' ')}
        >
          <Bookmark
            className="h-4 w-4"
            fill={bookmarked ? 'currentColor' : 'none'}
          />
        </button>
      </div>

      <div className="relative mt-6 flex items-end justify-between gap-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            12 month ROI
          </p>

          <p className="mt-1 font-display text-3xl tracking-[-0.04em] text-emerald-600 dark:text-emerald-400">
            +{trader.roi_12m}%
          </p>
        </div>

        <MiniChart positive />
      </div>

      <div className="mt-6 grid grid-cols-3 divide-x divide-border/60 border-y border-border/60 py-4">
        <Metric
          label="Risk"
          value={trader.risk_level ?? 'Medium'}
        />

        <Metric
          label="Followers"
          value={Number(trader.followers).toLocaleString()}
        />

        <Metric
          label="Min. entry"
          value={money(minInvestment)}
        />
      </div>

      <p className="mt-4 line-clamp-2 text-xs leading-5 text-muted-foreground">
        {trader.strategy ??
          'A systematic approach to navigating global markets.'}
      </p>

      <Button
        asChild
        className="mt-5 h-10 w-full rounded-xl"
      >
        <Link
          to={signed ? '/traders' : '/auth'}
          search={signed ? undefined : { mode: 'register' }}
        >
          {signed ? 'View strategy' : 'Create account'}
          <ArrowUpRight className="ml-2 h-3.5 w-3.5" />
        </Link>
      </Button>
    </motion.article>
  );
}

/* ================================================================
   TRADER CARD
================================================================ */

function TraderCard({
  trader,
  signed,
  index,
  bookmarked,
  selected,
  onBookmark,
  onSelect,
}: {
  trader: Trader;
  signed: boolean;
  index: number;
  bookmarked: boolean;
  selected: boolean;
  onBookmark: () => void;
  onSelect: () => void;
}) {
  const minInvestment = Number(
    (trader as unknown as { min_investment?: number })
      .min_investment ?? 100
  );

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.42,
        delay: Math.min(index * 0.045, 0.18),
        ease: [0.22, 1, 0.36, 1],
      }}
      className={[
        'group relative overflow-hidden rounded-[22px] border bg-card p-5 transition-all duration-300',
        selected
          ? 'border-primary/40 shadow-[0_18px_60px_rgba(15,23,42,0.08)]'
          : 'border-border/70 hover:-translate-y-0.5 hover:border-border hover:shadow-[0_18px_55px_rgba(15,23,42,0.065)]',
      ].join(' ')}
    >
      {/* Accent */}
      <div
        className="absolute right-0 top-0 h-28 w-28 rounded-full bg-primary/[0.035] blur-3xl transition-transform duration-500 group-hover:scale-150"
        aria-hidden="true"
      />

      <div className="relative">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <TraderAvatar trader={trader} />

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="truncate text-[15px] font-semibold tracking-[-0.02em]">
                  {trader.name}
                </h3>

                {trader.featured && (
                  <Star
                    className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400"
                    aria-label="Featured"
                  />
                )}

                <BadgeCheck
                  className="h-3.5 w-3.5 shrink-0 text-primary"
                  aria-label="Verified"
                />
              </div>

              <p className="mt-1 truncate text-[11px] text-muted-foreground">
                {trader.strategy ?? 'Global markets strategy'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onBookmark}
            aria-label={
              bookmarked
                ? `Remove ${trader.name} from bookmarks`
                : `Bookmark ${trader.name}`
            }
            className={[
              'grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors',
              bookmarked
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            ].join(' ')}
          >
            <Bookmark
              className="h-3.5 w-3.5"
              fill={bookmarked ? 'currentColor' : 'none'}
            />
          </button>
        </div>

        <div className="mt-7 flex items-end justify-between">
          <div>
            <p className="text-[9.5px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              12m return
            </p>

            <p className="mt-1 font-display text-[31px] leading-none tracking-[-0.04em] text-emerald-600 dark:text-emerald-400">
              +{trader.roi_12m}%
            </p>
          </div>

          <MiniChart positive />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-4">
          <Metric
            label="Risk"
            value={trader.risk_level ?? 'Medium'}
          />

          <Metric
            label="Followers"
            value={Number(trader.followers).toLocaleString()}
          />

          <Metric
            label="AUM"
            value={formatCompactMoney(
              Number(
                (trader as unknown as { aum?: number }).aum ?? 0
              )
            )}
          />

          <Metric
            label="Minimum"
            value={money(minInvestment)}
          />
        </div>

        <div className="mt-5 flex items-center gap-2">
          <RiskBadge level={trader.risk_level ?? 'Medium'} />

          <span className="text-[10px] text-muted-foreground">
            Historical data
          </span>
        </div>

        <div className="mt-5 grid grid-cols-[1fr_auto] gap-2">
          <Button
            asChild
            className="h-10 rounded-xl"
          >
            <Link
              to={signed ? '/traders' : '/auth'}
              search={
                signed ? undefined : { mode: 'register' }
              }
            >
              {signed ? 'View strategy' : 'Start exploring'}
              <ArrowUpRight className="ml-2 h-3.5 w-3.5" />
            </Link>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={onSelect}
            className={[
              'h-10 rounded-xl px-3',
              selected
                ? 'border-primary/30 bg-primary/5 text-primary'
                : '',
            ].join(' ')}
          >
            <BarChart3 className="h-4 w-4" />
            <span className="sr-only">Compare</span>
          </Button>
        </div>

        {selected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 overflow-hidden rounded-xl bg-muted/50 p-4"
          >
            <div className="flex items-center gap-2 text-xs font-semibold">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              Added to comparison
            </div>

            <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
              Comparison tools can help you examine risk and historical
              performance side by side.
            </p>
          </motion.div>
        )}
      </div>
    </motion.article>
  );
}

/* ================================================================
   TRADER ROW
================================================================ */

function TraderRow({
  trader,
  signed,
  index,
  bookmarked,
  onBookmark,
}: {
  trader: Trader;
  signed: boolean;
  index: number;
  bookmarked: boolean;
  onBookmark: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.25,
        delay: Math.min(index * 0.025, 0.15),
      }}
      className="group grid gap-4 border-b border-border/60 px-5 py-5 last:border-b-0 md:grid-cols-[minmax(240px,1.5fr)_110px_110px_120px_110px] md:items-center"
    >
      <div className="flex min-w-0 items-center gap-3">
        <TraderAvatar trader={trader} />

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate text-sm font-semibold">
              {trader.name}
            </h3>

            <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-primary" />

            {trader.featured && (
              <Star className="h-3 w-3 shrink-0 fill-amber-400 text-amber-400" />
            )}
          </div>

          <p className="mt-1 truncate text-[11px] text-muted-foreground">
            {trader.strategy}
          </p>
        </div>
      </div>

      <div>
        <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">
          12m ROI
        </p>

        <p className="mt-1 text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
          +{trader.roi_12m}%
        </p>
      </div>

      <div>
        <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">
          Followers
        </p>

        <p className="mt-1 text-sm font-semibold tabular-nums">
          {Number(trader.followers).toLocaleString()}
        </p>
      </div>

      <div>
        <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">
          Risk
        </p>

        <div className="mt-1">
          <RiskBadge level={trader.risk_level ?? 'Medium'} />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onBookmark}
          aria-label={
            bookmarked
              ? `Remove ${trader.name} from bookmarks`
              : `Bookmark ${trader.name}`
          }
          className={[
            'grid h-9 w-9 place-items-center rounded-lg transition-colors',
            bookmarked
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          ].join(' ')}
        >
          <Bookmark
            className="h-3.5 w-3.5"
            fill={bookmarked ? 'currentColor' : 'none'}
          />
        </button>

        <Button
          asChild
          size="sm"
          variant="outline"
          className="h-9 rounded-lg"
        >
          <Link
            to={signed ? '/traders' : '/auth'}
            search={signed ? undefined : { mode: 'register' }}
          >
            Open
            <ArrowUpRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}

/* ================================================================
   AVATAR
================================================================ */

function TraderAvatar({
  trader,
  size = 'md',
}: {
  trader: Trader;
  size?: 'md' | 'lg';
}) {
  const name = trader.name || 'Trader';

  const initials = name
    .split(' ')
    .map((part) => part.charAt(0))
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const avatarUrl =
    (trader as unknown as { avatar_url?: string | null })
      .avatar_url ?? null;

  return (
    <div
      className={[
        'relative shrink-0 overflow-hidden rounded-[14px] border border-border/60 bg-muted',
        size === 'lg' ? 'h-12 w-12' : 'h-10 w-10',
      ].join(' ')}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="grid h-full w-full place-items-center bg-gradient-to-br from-primary/15 via-primary/5 to-transparent font-display text-sm font-semibold text-primary">
          {initials}
        </div>
      )}
    </div>
  );
}

/* ================================================================
   METRICS
================================================================ */

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <p className="truncate text-[9px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 truncate text-[13px] font-semibold tabular-nums">
        {value}
      </p>
    </div>
  );
}

function RiskBadge({ level }: { level: string }) {
  const normalized = level.toLowerCase();

  const low = normalized.includes('low');
  const high = normalized.includes('high');

  const className = low
    ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
    : high
      ? 'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300'
      : 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {level}
    </span>
  );
}

/* ================================================================
   CHART
================================================================ */

function MiniChart({ positive }: { positive: boolean }) {
  return (
    <div className="h-12 w-[100px] overflow-hidden">
      <svg
        viewBox="0 0 100 48"
        className="h-full w-full text-emerald-500"
        fill="none"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d={
            positive
              ? 'M0 38 C8 35 11 40 17 33 C24 25 27 30 33 26 C39 22 42 27 49 19 C57 11 62 19 69 13 C77 7 83 12 88 6 C94 1 97 5 100 2'
              : 'M0 10 C8 13 12 9 18 16 C26 24 31 20 37 27 C45 34 52 28 60 34 C68 41 75 34 82 39 C90 45 96 39 100 44'
          }
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

/* ================================================================
   SKELETONS
================================================================ */

function TraderSkeletons() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-[22px] border border-border/60 bg-card p-5"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-[14px] bg-muted" />

            <div className="space-y-2">
              <div className="h-3 w-28 animate-pulse rounded-full bg-muted" />
              <div className="h-2.5 w-20 animate-pulse rounded-full bg-muted" />
            </div>
          </div>

          <div className="mt-8">
            <div className="h-2.5 w-20 animate-pulse rounded-full bg-muted" />
            <div className="mt-3 h-9 w-24 animate-pulse rounded-lg bg-muted" />
          </div>

          <div className="mt-7 grid grid-cols-2 gap-5">
            {Array.from({ length: 4 }).map((_, metric) => (
              <div key={metric} className="space-y-2">
                <div className="h-2 w-12 animate-pulse rounded-full bg-muted" />
                <div className="h-3 w-16 animate-pulse rounded-full bg-muted" />
              </div>
            ))}
          </div>

          <div className="mt-6 h-10 animate-pulse rounded-xl bg-muted" />
        </div>
      ))}
    </div>
  );
}

/* ================================================================
   FORMATTERS
================================================================ */

function formatCompactMoney(value: number) {
  if (!value) return 'N/A';

  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1)}B`;
  }

  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }

  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }

  return `$${value.toLocaleString()}`;
}
