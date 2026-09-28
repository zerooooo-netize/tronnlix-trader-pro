import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  Coins,
  Globe2,
  Info,
  LineChart,
  MoveUpRight,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export const Route = createFileRoute('/markets')({
  head: () => ({
    meta: [
      { title: 'Markets | Tronnlix Trade' },
      {
        name: 'description',
        content:
          'Explore major forex pairs, metals and crypto instruments with market context and illustrative pricing.',
      },
      {
        property: 'og:title',
        content: 'Markets | Tronnlix Trade',
      },
      {
        property: 'og:description',
        content:
          'Explore major forex pairs, metals and crypto instruments with market context and illustrative pricing.',
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

  component: MarketsPage,
});

type Category =
  | 'forex-majors'
  | 'forex-minors'
  | 'metals'
  | 'crypto';

type Quote = {
  symbol: string;
  name: string;
  price: string;
  change: string;
  positive: boolean;
  spread: string;
  market: string;
};

const CATEGORIES: {
  id: Category;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
}[] = [
  {
    id: 'forex-majors',
    label: 'Forex majors',
    shortLabel: 'Majors',
    icon: Globe2,
  },
  {
    id: 'forex-minors',
    label: 'Forex minors',
    shortLabel: 'Minors',
    icon: BarChart3,
  },
  {
    id: 'metals',
    label: 'Metals',
    shortLabel: 'Metals',
    icon: Coins,
  },
  {
    id: 'crypto',
    label: 'Crypto CFDs',
    shortLabel: 'Crypto',
    icon: LineChart,
  },
];

const QUOTES: Record<Category, Quote[]> = {
  'forex-majors': [
    {
      symbol: 'EUR / USD',
      name: 'Euro / US dollar',
      price: '1.0842',
      change: '+0.32%',
      positive: true,
      spread: '0.6',
      market: 'FX',
    },
    {
      symbol: 'GBP / USD',
      name: 'British pound / US dollar',
      price: '1.2736',
      change: '+0.18%',
      positive: true,
      spread: '0.8',
      market: 'FX',
    },
    {
      symbol: 'USD / JPY',
      name: 'US dollar / Japanese yen',
      price: '149.82',
      change: '-0.11%',
      positive: false,
      spread: '0.7',
      market: 'FX',
    },
    {
      symbol: 'USD / CHF',
      name: 'US dollar / Swiss franc',
      price: '0.9014',
      change: '+0.09%',
      positive: true,
      spread: '1.0',
      market: 'FX',
    },
    {
      symbol: 'AUD / USD',
      name: 'Australian dollar / US dollar',
      price: '0.6589',
      change: '-0.24%',
      positive: false,
      spread: '0.9',
      market: 'FX',
    },
    {
      symbol: 'USD / CAD',
      name: 'US dollar / Canadian dollar',
      price: '1.3548',
      change: '+0.14%',
      positive: true,
      spread: '1.1',
      market: 'FX',
    },
  ],

  'forex-minors': [
    {
      symbol: 'EUR / GBP',
      name: 'Euro / British pound',
      price: '0.8512',
      change: '+0.10%',
      positive: true,
      spread: '1.2',
      market: 'FX',
    },
    {
      symbol: 'EUR / JPY',
      name: 'Euro / Japanese yen',
      price: '162.44',
      change: '+0.22%',
      positive: true,
      spread: '1.3',
      market: 'FX',
    },
    {
      symbol: 'GBP / JPY',
      name: 'British pound / Japanese yen',
      price: '190.86',
      change: '+0.35%',
      positive: true,
      spread: '1.6',
      market: 'FX',
    },
    {
      symbol: 'AUD / JPY',
      name: 'Australian dollar / Japanese yen',
      price: '98.72',
      change: '-0.18%',
      positive: false,
      spread: '1.5',
      market: 'FX',
    },
  ],

  metals: [
    {
      symbol: 'XAU / USD',
      name: 'Gold spot',
      price: '2,318.40',
      change: '+0.46%',
      positive: true,
      spread: '0.35',
      market: 'Metal',
    },
    {
      symbol: 'XAG / USD',
      name: 'Silver spot',
      price: '27.42',
      change: '+0.62%',
      positive: true,
      spread: '0.03',
      market: 'Metal',
    },
    {
      symbol: 'XPT / USD',
      name: 'Platinum spot',
      price: '964.20',
      change: '-0.21%',
      positive: false,
      spread: '1.20',
      market: 'Metal',
    },
  ],

  crypto: [
    {
      symbol: 'BTC / USD',
      name: 'Bitcoin',
      price: '63,412.80',
      change: '+1.24%',
      positive: true,
      spread: '25',
      market: 'Crypto',
    },
    {
      symbol: 'ETH / USD',
      name: 'Ethereum',
      price: '3,104.60',
      change: '+0.88%',
      positive: true,
      spread: '4',
      market: 'Crypto',
    },
    {
      symbol: 'SOL / USD',
      name: 'Solana',
      price: '148.72',
      change: '-1.15%',
      positive: false,
      spread: '1.5',
      market: 'Crypto',
    },
  ],
};

const SESSIONS = [
  {
    city: 'Sydney',
    open: 22,
    close: 7,
  },
  {
    city: 'Tokyo',
    open: 0,
    close: 9,
  },
  {
    city: 'London',
    open: 8,
    close: 17,
  },
  {
    city: 'New York',
    open: 13,
    close: 22,
  },
] as const;

function MarketsPage() {
  const [category, setCategory] =
    useState<Category>('forex-majors');

  const [now, setNow] = useState(() => new Date());

  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(new Date());
    }, 60_000);

    return () => window.clearInterval(interval);
  }, []);

  const quotes = QUOTES[category];

  const hour = now.getUTCHours();

  const minute = now.getUTCMinutes();

  const utcTime = now.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  });

  const sessionState = useMemo(
    () =>
      SESSIONS.map((session) => {
        const isOpen =
          session.open < session.close
            ? hour >= session.open && hour < session.close
            : hour >= session.open || hour < session.close;

        return {
          ...session,
          isOpen,
        };
      }),
    [hour],
  );

  const openSessions = sessionState.filter(
    (session) => session.isOpen,
  ).length;

  const advancing = quotes.filter((quote) => quote.positive).length;

  const declining = quotes.length - advancing;

  const strongestMove = [...quotes].sort(
    (a, b) =>
      Math.abs(Number.parseFloat(b.change)) -
      Math.abs(Number.parseFloat(a.change)),
  )[0];

  return (
    <>
      <SiteHeader />

      <main className="bg-background">
        {/* ============================================================
         * HERO
         * ========================================================== */}
        <section className="relative overflow-hidden border-b border-border/70">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
          >
            <div className="absolute -left-32 top-20 h-80 w-80 rounded-full bg-primary/[0.07] blur-3xl" />

            <div className="absolute right-[-120px] top-[-100px] h-96 w-96 rounded-full bg-blue-500/[0.06] blur-3xl" />

            <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_72%)]" />
          </div>

          <div className="relative mx-auto max-w-7xl px-5 pb-14 pt-16 sm:px-8 sm:pb-20 sm:pt-24 lg:pt-28">
            <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end lg:gap-20">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.17em] text-muted-foreground">
                  <span>Markets</span>
                  <span className="text-border">/</span>
                  <span>Global coverage</span>
                </div>

                <motion.h1
                  initial={
                    reduceMotion
                      ? false
                      : {
                          opacity: 0,
                          y: 10,
                        }
                  }
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: reduceMotion ? 0 : 0.45,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="mt-6 max-w-[760px] font-display text-4xl font-medium leading-[1.02] tracking-[-0.035em] text-foreground sm:text-5xl md:text-6xl lg:text-[68px]"
                >
                  Markets move.
                  <br />
                  <span className="text-muted-foreground">
                    Stay oriented.
                  </span>
                </motion.h1>

                <p className="mt-7 max-w-2xl text-[15px] leading-7 text-muted-foreground sm:text-[16px] sm:leading-8">
                  Explore the instruments that shape global trading
                  sessions, from major currency pairs to metals and
                  crypto CFDs.
                </p>

                <div className="mt-8 flex flex-wrap gap-2.5">
                  <Button
                    asChild
                    className="h-11 rounded-xl px-5"
                  >
                    <Link
                      to="/auth"
                      search={{ mode: 'register' }}
                    >
                      Open an account
                      <ArrowUpRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    className="h-11 rounded-xl px-5"
                  >
                    <Link to="/copy-trading">
                      Explore strategies
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Market pulse */}
              <div className="lg:pb-1">
                <div className="overflow-hidden rounded-3xl border border-border/70 bg-card/60 shadow-sm backdrop-blur">
                  <div className="border-b border-border/60 px-5 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary">
                          <Activity className="h-4 w-4" />
                        </span>

                        <div>
                          <p className="text-sm font-medium text-foreground">
                            Market pulse
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            Illustrative session snapshot
                          </p>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        UTC {utcTime}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 divide-x divide-border/60">
                    <PulseMetric
                      label="Open"
                      value={`${openSessions}/4`}
                    />

                    <PulseMetric
                      label="Advancing"
                      value={String(advancing)}
                      positive
                    />

                    <PulseMetric
                      label="Declining"
                      value={String(declining)}
                      negative
                    />
                  </div>

                  <div className="border-t border-border/60 bg-muted/20 px-5 py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">
                          Largest move
                        </p>
                        <p className="mt-1 text-sm font-medium text-foreground">
                          {strongestMove.symbol}
                        </p>
                      </div>

                      <div
                        className={`font-display text-lg tabular-nums ${
                          strongestMove.positive
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {strongestMove.change}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
         * MARKET BOARD
         * ========================================================== */}
        <section className="border-b border-border/70 bg-secondary/25 py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Instrument board
                </p>

                <h2 className="mt-2 font-display text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
                  Watch what matters.
                </h2>
              </div>

              <div className="text-left sm:text-right">
                <p className="text-xs text-muted-foreground">
                  {quotes.length} instruments
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  Illustrative values
                </p>
              </div>
            </div>

            {/* Category navigation */}
            <div className="mt-7 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIES.map(
                ({ id, label, shortLabel, icon: Icon }) => {
                  const active = category === id;

                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setCategory(id)}
                      aria-pressed={active}
                      className={`group inline-flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium transition-all ${
                        active
                          ? 'border-primary/30 bg-primary/10 text-primary shadow-sm'
                          : 'border-border/70 bg-background/50 text-muted-foreground hover:bg-background hover:text-foreground'
                      }`}
                    >
                      <Icon
                        className={`h-3.5 w-3.5 ${
                          active
                            ? 'text-primary'
                            : 'text-muted-foreground'
                        }`}
                      />

                      <span className="sm:hidden">
                        {shortLabel}
                      </span>

                      <span className="hidden sm:inline">
                        {label}
                      </span>
                    </button>
                  );
                },
              )}
            </div>

            {/* Table */}
            <div className="mt-5 overflow-hidden rounded-3xl border border-border/70 bg-background shadow-sm">
              <div className="hidden grid-cols-[1.7fr_.8fr_.8fr_.65fr] gap-6 border-b border-border/60 bg-muted/25 px-6 py-3.5 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground md:grid">
                <span>Instrument</span>
                <span className="text-right">Last</span>
                <span className="text-right">24h</span>
                <span className="text-right">Spread</span>
              </div>

              <ul className="divide-y divide-border/60">
                {quotes.map((quote, index) => (
                  <MarketRow
                    key={quote.symbol}
                    quote={quote}
                    index={index}
                    reduceMotion={reduceMotion}
                  />
                ))}
              </ul>
            </div>

            <div className="mt-4 flex items-start gap-2 text-[11px] leading-5 text-muted-foreground">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />

              <p>
                Prices and spreads shown here are illustrative examples
                for product presentation. They are not live market data
                and cannot be used as executable rates.
              </p>
            </div>
          </div>
        </section>

        {/* ============================================================
         * SESSION MAP
         * ========================================================== */}
        <section className="border-b border-border/70 py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="grid gap-12 lg:grid-cols-[.72fr_1.28fr] lg:gap-20">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Global sessions
                </p>

                <h2 className="mt-5 max-w-[500px] font-display text-4xl font-medium leading-[1.04] tracking-[-0.025em] text-foreground md:text-5xl">
                  Know where the market is in its day.
                </h2>

                <p className="mt-5 max-w-md text-[14px] leading-7 text-muted-foreground">
                  Forex liquidity changes throughout the day. Session
                  overlap can also change how actively different pairs
                  trade.
                </p>

                <div className="mt-7 flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock3 className="h-3.5 w-3.5" />
                  Current time: UTC {utcTime}
                </div>
              </div>

              <div className="rounded-3xl border border-border/70 bg-card/40 p-5 sm:p-6">
                <div className="space-y-1">
                  {sessionState.map((session, index) => (
                    <SessionRow
                      key={session.city}
                      city={session.city}
                      open={session.open}
                      close={session.close}
                      isOpen={session.isOpen}
                      index={index}
                    />
                  ))}
                </div>

                <div className="mt-5 border-t border-border/60 pt-4 text-[10.5px] leading-5 text-muted-foreground">
                  Session times are shown in UTC. Actual market
                  availability can differ around weekends and holidays.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
         * MARKET CONTEXT
         * ========================================================== */}
        <section className="border-b border-border/70 bg-secondary/25 py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:gap-20">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Market context
                </p>

                <h2 className="mt-5 font-display text-4xl font-medium leading-[1.04] tracking-[-0.025em] text-foreground md:text-5xl">
                  A price is only part of the picture.
                </h2>

                <p className="mt-5 max-w-md text-[14px] leading-7 text-muted-foreground">
                  Different instruments respond to different drivers.
                  Understanding that context can help you build a more
                  deliberate approach to risk.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <ContextCard
                  number="01"
                  title="Major FX"
                  body="The most widely followed currency pairs, typically associated with deep liquidity and active global sessions."
                />

                <ContextCard
                  number="02"
                  title="Metals"
                  body="Gold, silver and platinum can react to interest rates, currencies, inflation expectations and broader risk sentiment."
                />

                <ContextCard
                  number="03"
                  title="Crypto CFDs"
                  body="Digital assets can experience larger price swings and operate across a wider trading window."
                />

                <ContextCard
                  number="04"
                  title="Session overlap"
                  body="London and New York overlap during part of the day, creating a period traders often monitor for increased activity."
                />
              </div>
            </div>

            <Link
              to="/about"
              className="group mt-10 inline-flex items-center gap-2 text-sm font-semibold text-foreground"
            >
              How we approach risk
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </section>

        {/* ============================================================
         * CTA
         * ========================================================== */}
        <section className="relative overflow-hidden py-20 sm:py-28">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-[-120px] top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-primary/[0.055] blur-3xl"
          />

          <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
            <div className="overflow-hidden rounded-[28px] border border-border/70 bg-card/45 p-7 shadow-sm sm:p-10 lg:p-12">
              <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
                <div>
                  <div className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                    Next step
                  </div>

                  <h2 className="mt-5 max-w-[700px] font-display text-4xl font-medium leading-[1.03] tracking-[-0.03em] text-foreground md:text-5xl lg:text-6xl">
                    Find a strategy that fits your approach.
                  </h2>

                  <p className="mt-5 max-w-xl text-[14px] leading-7 text-muted-foreground">
                    Explore trading experts, compare their approaches and
                    decide how you want to allocate your capital.
                  </p>
                </div>

                <div className="flex shrink-0 flex-col gap-2.5 sm:flex-row">
                  <Button
                    size="lg"
                    asChild
                    className="h-12 rounded-xl px-6"
                  >
                    <Link to="/copy-trading">
                      Explore copy trading
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>

                  <Button
                    size="lg"
                    asChild
                    variant="outline"
                    className="h-12 rounded-xl px-6"
                  >
                    <Link
                      to="/auth"
                      search={{ mode: 'register' }}
                    >
                      Open an account
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

/* ================================================================
 * MARKET ROW
 * ================================================================ */

function MarketRow({
  quote,
  index,
  reduceMotion,
}: {
  quote: Quote;
  index: number;
  reduceMotion: boolean | null;
}) {
  return (
    <motion.li
      initial={
        reduceMotion
          ? false
          : {
              opacity: 0,
              y: 5,
            }
      }
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: reduceMotion ? 0 : 0.2,
        delay: reduceMotion ? 0 : Math.min(index * 0.025, 0.12),
      }}
      className="group grid grid-cols-1 gap-4 px-5 py-4.5 transition-colors hover:bg-muted/25 sm:px-6 md:grid-cols-[1.7fr_.8fr_.8fr_.65fr] md:items-center md:gap-6"
    >
      {/* Instrument */}
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-[10px] font-bold ${
            quote.positive
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
          }`}
        >
          {quote.symbol.slice(0, 2)}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate text-[13.5px] font-semibold tracking-tight text-foreground">
              {quote.symbol}
            </p>

            <span className="hidden rounded-md bg-muted px-1.5 py-0.5 text-[8.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground sm:inline">
              {quote.market}
            </span>
          </div>

          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
            {quote.name}
          </p>
        </div>
      </div>

      {/* Mobile metrics */}
      <div className="grid grid-cols-3 gap-3 md:contents">
        <MetricCell
          label="Last"
          value={quote.price}
        />

        <MetricCell
          label="24h"
          value={quote.change}
          positive={quote.positive}
        />

        <MetricCell
          label="Spread"
          value={`${quote.spread} pips`}
        />
      </div>
    </motion.li>
  );
}

/* ================================================================
 * METRIC
 * ================================================================ */

function MetricCell({
  label,
  value,
  positive,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="flex items-center justify-between md:block md:text-right">
      <span className="text-[9.5px] font-medium uppercase tracking-[0.12em] text-muted-foreground md:hidden">
        {label}
      </span>

      <span
        className={`font-display text-[13px] tabular-nums ${
          positive === undefined
            ? 'text-foreground'
            : positive
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-rose-600 dark:text-rose-400'
        }`}
      >
        {value}
      </span>
    </div>
  );
}

/* ================================================================
 * PULSE METRIC
 * ================================================================ */

function PulseMetric({
  label,
  value,
  positive,
  negative,
}: {
  label: string;
  value: string;
  positive?: boolean;
  negative?: boolean;
}) {
  return (
    <div className="px-4 py-4">
      <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">
        {label}
      </p>

      <p
        className={`mt-1 font-display text-lg tabular-nums ${
          positive
            ? 'text-emerald-600 dark:text-emerald-400'
            : negative
              ? 'text-rose-600 dark:text-rose-400'
              : 'text-foreground'
        }`}
      >
        {value}
      </p>
    </div>
  );
}

/* ================================================================
 * SESSION ROW
 * ================================================================ */

function SessionRow({
  city,
  open,
  close,
  isOpen,
  index,
}: {
  city: string;
  open: number;
  close: number;
  isOpen: boolean;
  index: number;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        x: -5,
      }}
      whileInView={{
        opacity: 1,
        x: 0,
      }}
      viewport={{
        once: true,
        amount: 0.4,
      }}
      transition={{
        duration: 0.25,
        delay: index * 0.04,
      }}
      className="group flex items-center gap-4 rounded-2xl px-3 py-3 transition-colors hover:bg-muted/30"
    >
      <div className="w-20 shrink-0">
        <p className="text-sm font-medium text-foreground">
          {city}
        </p>
      </div>

      <div className="relative h-8 flex-1">
        <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-border" />

        <div
          className={`absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full transition-all ${
            isOpen ? 'bg-primary' : 'bg-muted-foreground/25'
          }`}
          style={{
            left: `${(open / 24) * 100}%`,
            width: `${(
              (((close - open + 24) % 24) || 24) /
                24
            ) * 100}%`,
          }}
        />

        <span
          className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-muted-foreground/40"
          style={{
            left: `${(open / 24) * 100}%`,
          }}
        />

        <span
          className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-muted-foreground/40"
          style={{
            left: `${(close / 24) * 100}%`,
          }}
        />
      </div>

      <div className="w-20 shrink-0 text-right">
        <span
          className={`inline-flex items-center gap-1.5 text-[10px] font-semibold ${
            isOpen
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-muted-foreground'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isOpen
                ? 'bg-emerald-500'
                : 'bg-muted-foreground/35'
            }`}
          />

          {isOpen ? 'Open' : 'Closed'}
        </span>
      </div>
    </motion.div>
  );
}

/* ================================================================
 * CONTEXT CARD
 * ================================================================ */

function ContextCard({
  number,
  title,
  body,
}: {
  number: string;
  title: string;
  body: string;
}) {
  return (
    <motion.div
      whileHover={{
        y: -2,
      }}
      transition={{
        duration: 0.18,
      }}
      className="group rounded-3xl border border-border/70 bg-background p-5 shadow-sm transition-colors hover:border-border sm:p-6"
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold tabular-nums text-muted-foreground">
          {number}
        </span>

        <MoveUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
      </div>

      <h3 className="mt-9 text-sm font-semibold text-foreground">
        {title}
      </h3>

      <p className="mt-2 text-[12.5px] leading-6 text-muted-foreground">
        {body}
      </p>
    </motion.div>
  );
}
