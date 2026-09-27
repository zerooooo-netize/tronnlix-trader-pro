import { createFileRoute, Link } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowUpRight,
  ArrowRight,
  BarChart3,
  Clock3,
  Coins,
  Globe2,
  Info,
  LineChart,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export const Route = createFileRoute('/markets')({
  head: () => ({
    meta: [
      { title: 'Markets, Tronnlix Trade' },
      {
        name: 'description',
        content:
          'Explore major forex markets, metals and crypto CFDs with context behind every move.',
      },
      { property: 'og:title', content: 'Markets, Tronnlix Trade' },
      {
        property: 'og:description',
        content:
          'Explore major forex markets, metals and crypto CFDs with context behind every move.',
      },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
  }),
  component: MarketsPage,
});

type Category = 'forex-majors' | 'forex-minors' | 'metals' | 'crypto';

type Quote = {
  symbol: string;
  name: string;
  price: string;
  change: string;
  positive: boolean;
  spread: string;
};

const CATEGORIES: { id: Category; label: string; icon: React.ElementType }[] = [
  { id: 'forex-majors', label: 'Forex majors', icon: Globe2 },
  { id: 'forex-minors', label: 'Forex minors', icon: BarChart3 },
  { id: 'metals', label: 'Metals', icon: Coins },
  { id: 'crypto', label: 'Crypto CFDs', icon: LineChart },
];

const QUOTES: Record<Category, Quote[]> = {
  'forex-majors': [
    { symbol: 'EUR / USD', name: 'Euro / US dollar', price: '1.0842', change: '+0.32%', positive: true, spread: '0.6' },
    { symbol: 'GBP / USD', name: 'British pound / US dollar', price: '1.2736', change: '+0.18%', positive: true, spread: '0.8' },
    { symbol: 'USD / JPY', name: 'US dollar / Japanese yen', price: '149.82', change: '-0.11%', positive: false, spread: '0.7' },
    { symbol: 'USD / CHF', name: 'US dollar / Swiss franc', price: '0.9014', change: '+0.09%', positive: true, spread: '1.0' },
    { symbol: 'AUD / USD', name: 'Australian dollar / US dollar', price: '0.6589', change: '-0.24%', positive: false, spread: '0.9' },
    { symbol: 'USD / CAD', name: 'US dollar / Canadian dollar', price: '1.3548', change: '+0.14%', positive: true, spread: '1.1' },
  ],
  'forex-minors': [
    { symbol: 'EUR / GBP', name: 'Euro / British pound', price: '0.8512', change: '+0.10%', positive: true, spread: '1.2' },
    { symbol: 'EUR / JPY', name: 'Euro / Japanese yen', price: '162.44', change: '+0.22%', positive: true, spread: '1.3' },
    { symbol: 'GBP / JPY', name: 'British pound / Japanese yen', price: '190.86', change: '+0.35%', positive: true, spread: '1.6' },
    { symbol: 'AUD / JPY', name: 'Australian dollar / Japanese yen', price: '98.72', change: '-0.18%', positive: false, spread: '1.5' },
  ],
  metals: [
    { symbol: 'XAU / USD', name: 'Gold spot', price: '2,318.40', change: '+0.46%', positive: true, spread: '0.35' },
    { symbol: 'XAG / USD', name: 'Silver spot', price: '27.42', change: '+0.62%', positive: true, spread: '0.03' },
    { symbol: 'XPT / USD', name: 'Platinum spot', price: '964.20', change: '-0.21%', positive: false, spread: '1.20' },
  ],
  crypto: [
    { symbol: 'BTC / USD', name: 'Bitcoin', price: '63,412.80', change: '+1.24%', positive: true, spread: '25' },
    { symbol: 'ETH / USD', name: 'Ethereum', price: '3,104.60', change: '+0.88%', positive: true, spread: '4' },
    { symbol: 'SOL / USD', name: 'Solana', price: '148.72', change: '-1.15%', positive: false, spread: '1.5' },
  ],
};

const SESSIONS = [
  { city: 'Sydney', open: 22, close: 7 },
  { city: 'Tokyo', open: 0, close: 9 },
  { city: 'London', open: 8, close: 17 },
  { city: 'New York', open: 13, close: 22 },
] as const;

function MarketsPage() {
  const [category, setCategory] = useState<Category>('forex-majors');
  const quotes = QUOTES[category];

  const hour = new Date().getUTCHours();

  const sessionState = useMemo(
    () =>
      SESSIONS.map((s) => {
        const open =
          s.open < s.close
            ? hour >= s.open && hour < s.close
            : hour >= s.open || hour < s.close;
        return { ...s, open };
      }),
    [hour]
  );

  return (
    <>
      <SiteHeader />
      <main className="bg-background">
        {/* ---------------------------------------------------------
         * Hero + board
         * ------------------------------------------------------- */}
        <section className="relative overflow-hidden border-b border-border/70">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06] text-foreground [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]"
          />
          <div className="mx-auto max-w-7xl px-5 pb-16 pt-20 sm:px-8 sm:pb-20 sm:pt-28">
            <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-16">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Markets
                  <span className="mx-2 text-border">/</span>
                  Global coverage
                </span>
                <h1 className="mt-6 max-w-[20ch] font-display text-4xl font-medium leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl">
                  Find your perspective on global markets.
                </h1>
                <p className="mt-8 max-w-2xl text-[16.5px] leading-8 text-muted-foreground sm:text-lg">
                  Follow the pairs, metals and crypto instruments that shape the
                  week. Illustrative prices only, not live quotes or executable
                  rates.
                </p>
                <div className="mt-8 flex flex-wrap gap-2">
                  <Button asChild className="h-11 rounded-full px-5">
                    <Link to="/auth" search={{ mode: 'register' }}>
                      Open an account
                      <ArrowUpRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-11 rounded-full px-5">
                    <Link to="/copy-trading">Follow a strategy</Link>
                  </Button>
                </div>
              </div>

              {/* Session clock */}
              <aside className="lg:pt-12">
                <div className="rounded-2xl border border-border/70 bg-card/60 p-5 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Market sessions
                    </p>
                    <Clock3 className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <ul className="mt-4 space-y-2.5">
                    {sessionState.map((s) => (
                      <li
                        key={s.city}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-foreground/85">{s.city}</span>
                        <span className="inline-flex items-center gap-1.5 text-xs">
                          <span
                            aria-hidden="true"
                            className={`h-1.5 w-1.5 rounded-full ${
                              s.open ? 'bg-emerald-500' : 'bg-muted-foreground/40'
                            }`}
                          />
                          <span
                            className={
                              s.open
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-muted-foreground'
                            }
                          >
                            {s.open ? 'Open' : 'Closed'}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 border-t border-border/60 pt-3 text-[11px] text-muted-foreground">
                    Times shown in UTC. Actual hours may vary on holidays.
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------
         * Market board
         * ------------------------------------------------------- */}
        <section className="border-b border-border/70 bg-secondary/40 py-14 sm:py-16">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            {/* Category tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {CATEGORIES.map(({ id, label, icon: Icon }) => {
                const active = category === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setCategory(id)}
                    className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition-colors ${
                      active
                        ? 'border-primary/40 bg-primary/10 text-primary'
                        : 'border-border/70 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                );
              })}
              <span className="ml-auto text-[11px] text-muted-foreground">
                {quotes.length} instruments
              </span>
            </div>

            {/* Quote table */}
            <div className="mt-6 overflow-hidden rounded-2xl border border-border/70 bg-background">
              <div className="hidden grid-cols-[1.5fr_1fr_.8fr_.6fr] gap-4 border-b border-border/60 bg-muted/30 px-5 py-3 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground md:grid">
                <span>Instrument</span>
                <span className="text-right">Last (illustrative)</span>
                <span className="text-right">Change</span>
                <span className="text-right">Spread</span>
              </div>
              <ul className="divide-y divide-border/60">
                {quotes.map((q, i) => (
                  <motion.li
                    key={q.symbol}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.22,
                      delay: Math.min(i * 0.02, 0.12),
                    }}
                    className="grid grid-cols-1 gap-3 px-5 py-4 transition-colors hover:bg-muted/30 md:grid-cols-[1.5fr_1fr_.8fr_.6fr] md:items-center md:gap-4"
                  >
                    <div className="min-w-0">
                      <p className="text-[14px] font-medium tracking-tight text-foreground">
                        {q.symbol}
                      </p>
                      <p className="mt-0.5 truncate text-[11.5px] text-muted-foreground">
                        {q.name}
                      </p>
                    </div>
                    <div className="flex items-center justify-between md:justify-end">
                      <span className="text-[11px] text-muted-foreground md:hidden">
                        Last
                      </span>
                      <span className="font-display text-[15px] tabular-nums text-foreground">
                        {q.price}
                      </span>
                    </div>
                    <div className="flex items-center justify-between md:justify-end">
                      <span className="text-[11px] text-muted-foreground md:hidden">
                        Change
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 font-display text-[14px] tabular-nums ${
                          q.positive
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {q.positive ? (
                          <TrendingUp className="h-3.5 w-3.5" />
                        ) : (
                          <TrendingDown className="h-3.5 w-3.5" />
                        )}
                        {q.change}
                      </span>
                    </div>
                    <div className="flex items-center justify-between md:justify-end">
                      <span className="text-[11px] text-muted-foreground md:hidden">
                        Spread
                      </span>
                      <span className="text-[12.5px] tabular-nums text-muted-foreground">
                        {q.spread} pips
                      </span>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </div>

            <p className="mt-4 flex items-start gap-2 text-xs leading-6 text-muted-foreground">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Prices and spreads are illustrative examples for design purposes.
              They are not live market data and are not executable.
            </p>
          </div>
        </section>

        {/* ---------------------------------------------------------
         * Context
         * ------------------------------------------------------- */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto grid max-w-7xl gap-12 px-5 py-24 sm:px-8 md:grid-cols-[.85fr_1.15fr] md:gap-20"
        >
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Context first
            </span>
            <h2 className="mt-5 font-display text-4xl leading-[1.05] tracking-tight text-foreground md:text-5xl">
              Numbers mean more when you know what moved them.
            </h2>
          </div>
          <div className="md:pt-8">
            <div className="grid gap-6 sm:grid-cols-2">
              {[
                {
                  title: 'Major FX',
                  body: 'The most widely followed pairs. Deep liquidity, tight spreads and clear session behaviour.',
                },
                {
                  title: 'Metals',
                  body: 'Gold, silver and platinum, often used as a hedge. Sensitive to rates and geopolitical news.',
                },
                {
                  title: 'Crypto CFDs',
                  body: 'Higher volatility, wider spreads, longer hours. Size positions accordingly.',
                },
                {
                  title: 'Session behaviour',
                  body: 'Volatility clusters around London and New York. Plan entries around liquidity, not headlines.',
                },
              ].map((c) => (
                <div
                  key={c.title}
                  className="rounded-2xl border border-border/70 bg-card/40 p-5"
                >
                  <p className="text-sm font-medium text-foreground">{c.title}</p>
                  <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
                    {c.body}
                  </p>
                </div>
              ))}
            </div>
            <Link
              to="/about"
              className="group mt-8 inline-flex items-center gap-2 border-b border-foreground pb-2 text-sm font-semibold text-foreground"
            >
              How we think about risk
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </motion.section>

        {/* ---------------------------------------------------------
         * Closing CTA, ties into copy trading
         * ------------------------------------------------------- */}
        <section className="border-t border-border/70 py-20 sm:py-24">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-5 sm:px-8 md:flex-row md:items-end">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Next
              </span>
              <h2 className="mt-5 max-w-[22ch] font-display text-4xl leading-[1.05] tracking-tight text-foreground md:text-6xl">
                Turn market context into a strategy you follow.
              </h2>
              <p className="mt-5 max-w-xl text-[15px] leading-7 text-muted-foreground">
                Pick a trading expert whose approach fits your view. Allocate
                from your balance and manage the relationship on your terms.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:items-center">
              <Button size="lg" asChild className="h-12 rounded-full px-6">
                <Link to="/copy-trading">
                  Explore copy trading
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                asChild
                variant="outline"
                className="h-12 rounded-full px-6"
              >
                <Link to="/auth" search={{ mode: 'register' }}>
                  Open an account
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
