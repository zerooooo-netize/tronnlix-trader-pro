import { createFileRoute, Link } from '@tanstack/react-router';
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Check,
  ChartNoAxesCombined,
  ChevronRight,
  CircleDollarSign,
  Globe2,
  LockKeyhole,
  MoveUpRight,
  ShieldCheck,
  Sparkles,
  Wallet,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import hero from '@/assets/tronnlix-hero.jpg';

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      {
        title: 'Tronnlix Trade | Global markets, clearer decisions',
      },
      {
        name: 'description',
        content:
          'Explore global markets, compare trading strategies and manage your trading journey with Tronnlix Trade.',
      },
      {
        property: 'og:title',
        content: 'Tronnlix Trade | Global markets, clearer decisions',
      },
      {
        property: 'og:description',
        content:
          'Explore global markets, compare trading strategies and manage your trading journey with Tronnlix Trade.',
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
  component: Home,
});

const MARKET_ROWS = [
  {
    symbol: 'EUR/USD',
    name: 'Euro / US Dollar',
    price: '1.0842',
    change: '+0.32%',
    positive: true,
    volume: 'High',
  },
  {
    symbol: 'GBP/USD',
    name: 'British Pound / US Dollar',
    price: '1.2736',
    change: '+0.18%',
    positive: true,
    volume: 'Medium',
  },
  {
    symbol: 'USD/JPY',
    name: 'US Dollar / Japanese Yen',
    price: '149.82',
    change: '-0.11%',
    positive: false,
    volume: 'High',
  },
  {
    symbol: 'XAU/USD',
    name: 'Gold / US Dollar',
    price: '2,318.40',
    change: '+0.46%',
    positive: true,
    volume: 'High',
  },
] as const;

const CAPABILITIES = [
  {
    icon: Globe2,
    number: '01',
    title: 'Global markets',
    body:
      'Explore the instruments and currency pairs shaping the market without unnecessary noise.',
    to: '/markets',
  },
  {
    icon: ChartNoAxesCombined,
    number: '02',
    title: 'Copy trading',
    body:
      'Compare experienced trading strategies using performance, risk and allocation context.',
    to: '/copy-trading',
  },
  {
    icon: Wallet,
    number: '03',
    title: 'Funding & payouts',
    body:
      'Track deposits, allocations and withdrawals from one clear account workspace.',
    to: '/pricing',
  },
  {
    icon: ShieldCheck,
    number: '04',
    title: 'Built around control',
    body:
      'Review your allocations and manage your trading journey without unnecessary friction.',
    to: '/about',
  },
] as const;

const STRATEGIES = [
  {
    initials: 'ZE',
    name: 'Zenith',
    specialty: 'Macro currencies',
    risk: 'Moderate',
    returnValue: '+18.42%',
    followers: '1,284',
  },
  {
    initials: 'IS',
    name: 'Ismael',
    specialty: 'FX & gold',
    risk: 'Low',
    returnValue: '+14.76%',
    followers: '2,136',
  },
  {
    initials: 'AM',
    name: 'Amiin',
    specialty: 'Momentum',
    risk: 'High',
    returnValue: '+26.18%',
    followers: '896',
  },
] as const;

function Home() {
  const reduceMotion = useReducedMotion();

  const reveal = {
    initial: reduceMotion ? false : { opacity: 0, y: 20 },
    whileInView: reduceMotion ? undefined : { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: {
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  };

  return (
    <>
      <SiteHeader />

      <main className="overflow-hidden bg-background">
        {/* =========================================================
         * HERO
         * ======================================================= */}
        <section className="hero relative min-h-[720px] overflow-hidden md:min-h-[820px]">
          <img
            src={hero}
            width={1536}
            height={1024}
            alt="Abstract chrome sculpture representing movement in financial markets"
            className="hero-image absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-black/35" />
          <div className="hero-shade absolute inset-0" />

          <div className="page-container relative z-10 flex min-h-[720px] flex-col justify-between py-7 md:min-h-[820px] md:py-10">
            <div className="flex items-center justify-between border-b border-white/10 pb-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">
              <span>Tronnlix Trade</span>

              <span className="hidden sm:inline">
                Global markets / Digital platform
              </span>

              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Platform online
              </span>
            </div>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 28 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="max-w-5xl pb-14 pt-20 md:pb-20"
            >
              <div className="mb-7 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
                <span className="h-px w-8 bg-white/30" />
                A clearer trading experience
              </div>

              <h1 className="max-w-5xl font-display text-[clamp(3.5rem,8vw,8.5rem)] font-medium leading-[0.88] tracking-[-0.055em] text-white">
                Move with
                <br />
                <span className="text-white/55">clarity.</span>
              </h1>

              <div className="mt-9 grid max-w-4xl gap-8 md:grid-cols-[1fr_auto] md:items-end">
                <p className="max-w-xl text-base leading-7 text-white/65 md:text-lg">
                  Explore global markets, compare experienced trading
                  strategies and manage your account from one composed
                  workspace.
                </p>

                <div className="flex flex-wrap items-center gap-5">
                  <Button
                    size="lg"
                    asChild
                    className="h-12 rounded-full px-6"
                  >
                    <Link to="/auth" search={{ mode: 'register' }}>
                      Open an account
                      <ArrowUpRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>

                  <Link
                    to="/markets"
                    className="group inline-flex items-center gap-2 text-sm font-semibold text-white"
                  >
                    Explore markets
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-2 border-t border-white/10 pt-5 text-[10px] font-medium uppercase tracking-[0.17em] text-white/50 md:grid-cols-4">
              <span>
                <span className="mr-2 text-white">01</span>
                Discover
              </span>

              <span>
                <span className="mr-2 text-white">02</span>
                Compare
              </span>

              <span className="hidden md:block">
                <span className="mr-2 text-white">03</span>
                Allocate
              </span>

              <span className="hidden md:block text-right">
                <span className="mr-2 text-white">04</span>
                Stay in control
              </span>

              <span className="mt-4 md:hidden">
                <span className="mr-2 text-white">03</span>
                Allocate
              </span>

              <span className="mt-4 md:hidden text-right">
                <span className="mr-2 text-white">04</span>
                Control
              </span>
            </div>
          </div>
        </section>

        {/* =========================================================
         * INTRO
         * ======================================================= */}
        <motion.section
          {...reveal}
          className="page-container grid gap-12 py-24 md:grid-cols-[0.8fr_1.2fr] md:gap-24 md:py-32"
        >
          <div>
            <span className="eyebrow">A different starting point</span>

            <h2 className="mt-6 max-w-lg font-display text-4xl leading-[1.02] tracking-[-0.035em] md:text-6xl">
              Information first.
              <br />
              <span className="text-muted-foreground">
                Action second.
              </span>
            </h2>
          </div>

          <div className="flex flex-col justify-end md:pb-2">
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              Trading platforms can become crowded with numbers, alerts and
              competing signals. Tronnlix Trade is designed around a simpler
              idea: give you the context you need before you decide what to do
              next.
            </p>

            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4 text-sm font-medium">
              <Link
                to="/markets"
                className="group inline-flex items-center gap-2 border-b border-foreground pb-2"
              >
                View the markets
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>

              <Link
                to="/about"
                className="group inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                Why Tronnlix
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </motion.section>

        {/* =========================================================
         * PLATFORM PREVIEW
         * ======================================================= */}
        <section className="border-y border-border bg-secondary/60">
          <div className="page-container py-20 md:py-28">
            <motion.div
              {...reveal}
              className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end"
            >
              <div>
                <span className="eyebrow">Inside the platform</span>

                <h2 className="mt-5 max-w-2xl font-display text-4xl leading-[1] tracking-[-0.03em] md:text-6xl">
                  Everything important,
                  <br />
                  <span className="text-muted-foreground">
                    within reach.
                  </span>
                </h2>
              </div>

              <span className="max-w-xs text-sm leading-6 text-muted-foreground">
                A conceptual preview using illustrative data. Actual account
                values appear after authentication.
              </span>
            </motion.div>

            <motion.div
              {...reveal}
              className="grid gap-4 lg:grid-cols-[1.45fr_0.55fr]"
            >
              {/* Portfolio card */}
              <div className="overflow-hidden rounded-3xl border border-border bg-background shadow-sm">
                <div className="flex items-center justify-between border-b border-border px-5 py-4 md:px-7">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background">
                      <Activity className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold">Portfolio</p>
                      <p className="text-[11px] text-muted-foreground">
                        Illustrative workspace
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    Overview
                  </span>
                </div>

                <div className="grid gap-8 p-5 md:grid-cols-[0.8fr_1.2fr] md:p-7">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Portfolio value
                    </p>

                    <p className="mt-2 font-display text-4xl tracking-tight md:text-5xl">
                      $24,860.40
                    </p>

                    <div className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      <ArrowUpRight className="h-4 w-4" />
                      +8.42%
                      <span className="font-normal text-muted-foreground">
                        real
                      </span>
                    </div>

                    <div className="mt-10 grid grid-cols-2 gap-5 border-t border-border pt-5">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                          Available
                        </p>
                        <p className="mt-2 text-sm font-semibold">
                          $8,420.20
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                          Allocated
                        </p>
                        <p className="mt-2 text-sm font-semibold">
                          $16,440.20
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Decorative chart */}
                  <div className="relative min-h-[220px] overflow-hidden rounded-2xl border border-border bg-secondary/50">
                    <div className="absolute inset-x-5 top-5 flex justify-between text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                      <span>Performance</span>
                      <span>30D</span>
                    </div>

                    <svg
                      viewBox="0 0 600 240"
                      className="absolute inset-x-4 bottom-5 h-[170px] w-[calc(100%-2rem)]"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                    >
                      <defs>
                        <linearGradient
                          id="homeChartFill"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop offset="0%" stopOpacity="0.18" />
                          <stop offset="100%" stopOpacity="0" />
                        </linearGradient>
                      </defs>

                      <path
                        d="M0 196 C45 188 70 174 105 181 C143 188 165 153 201 160 C237 167 263 130 296 139 C329 148 350 111 385 120 C420 129 445 91 477 98 C510 105 540 63 600 42 L600 240 L0 240 Z"
                        fill="url(#homeChartFill)"
                      />

                      <path
                        d="M0 196 C45 188 70 174 105 181 C143 188 165 153 201 160 C237 167 263 130 296 139 C329 148 350 111 385 120 C420 129 445 91 477 98 C510 105 540 63 600 42"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>

                    <div className="absolute inset-x-5 bottom-4 flex justify-between text-[10px] text-muted-foreground">
                      <span>30 days ago</span>
                      <span>Today</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Side metrics */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-3xl border border-border bg-background p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Active strategies
                    </span>
                    <ChartNoAxesCombined className="h-4 w-4 text-muted-foreground" />
                  </div>

                  <p className="mt-7 font-display text-4xl">12</p>

                  <p className="mt-2 text-sm text-muted-foreground">
                    Illustrative marketplace count
                  </p>
                </div>

                <div className="rounded-3xl border border-border bg-foreground p-6 text-background">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-background/55">
                      Account control
                    </span>
                    <LockKeyhole className="h-4 w-4 text-background/70" />
                  </div>

                  <p className="mt-7 font-display text-3xl">
                    Your decision.
                  </p>

                  <p className="mt-3 text-sm leading-6 text-background/60">
                    Review allocations and manage your trading activity from
                    your account.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* =========================================================
         * CAPABILITIES
         * ======================================================= */}
        <section className="py-24 md:py-32">
          <div className="page-container">
            <motion.div
              {...reveal}
              className="mb-12 grid gap-6 md:grid-cols-[1fr_auto] md:items-end"
            >
              <div>
                <span className="eyebrow">Platform capabilities</span>

                <h2 className="mt-5 max-w-3xl font-display text-4xl tracking-[-0.03em] md:text-6xl">
                  One platform.
                  <br />
                  <span className="text-muted-foreground">
                    More perspective.
                  </span>
                </h2>
              </div>

              <p className="max-w-xs text-sm leading-6 text-muted-foreground md:text-right">
                Designed around the decisions traders actually make.
              </p>
            </motion.div>

            <div className="grid gap-px overflow-hidden rounded-3xl border border-border bg-border md:grid-cols-2 xl:grid-cols-4">
              {CAPABILITIES.map(
                ({ icon: Icon, number, title, body, to }, index) => (
                  <motion.div
                    key={number}
                    {...reveal}
                    transition={{
                      duration: 0.55,
                      delay: index * 0.05,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <Link
                      to={to}
                      className="group flex min-h-[340px] flex-col bg-background p-7 transition-colors hover:bg-secondary md:p-8"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border">
                          <Icon
                            size={20}
                            strokeWidth={1.5}
                            className="text-primary"
                          />
                        </div>

                        <span className="text-[10px] tabular-nums text-muted-foreground">
                          {number} / 04
                        </span>
                      </div>

                      <div className="mt-auto">
                        <h3 className="font-display text-2xl tracking-tight">
                          {title}
                        </h3>

                        <p className="mt-4 max-w-xs text-sm leading-7 text-muted-foreground">
                          {body}
                        </p>

                        <div className="mt-7 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.13em]">
                          Explore
                          <MoveUpRight
                            size={15}
                            className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                          />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ),
              )}
            </div>
          </div>
        </section>

        {/* =========================================================
         * MARKETS
         * ======================================================= */}
        <section className="bg-[#0c0d0f] py-24 text-white md:py-32">
          <div className="page-container">
            <motion.div
              {...reveal}
              className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20"
            >
              <div>
                <span className="eyebrow text-white/50">
                  Market intelligence
                </span>

                <h2 className="mt-6 font-display text-4xl leading-[1] tracking-[-0.035em] md:text-6xl">
                  See the market
                  <br />
                  <span className="text-white/45">
                    before you act.
                  </span>
                </h2>

                <p className="mt-7 max-w-md text-base leading-7 text-white/55">
                  Keep the major instruments in view and understand their
                  movement at a glance. This homepage snapshot uses
                  real values.
                </p>

                <Button
                  asChild
                  variant="outline"
                  className="mt-9 rounded-full border-white/20 bg-transparent px-5 text-white hover:bg-white hover:text-black"
                >
                  <Link to="/markets">
                    View all markets
                    <ArrowUpRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035]">
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 md:px-7">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="text-xs font-medium">
                      Major instruments
                    </span>
                  </div>

                  <span className="text-[10px] uppercase tracking-[0.15em] text-white/35">
                    IReal
                  </span>
                </div>

                <div className="hidden grid-cols-[1.5fr_1fr_0.8fr] border-b border-white/10 px-5 py-3 text-[9px] uppercase tracking-[0.16em] text-white/30 sm:grid md:px-7">
                  <span>Instrument</span>
                  <span>Last</span>
                  <span className="text-right">Change</span>
                </div>

                {MARKET_ROWS.map(
                  ({ symbol, name, price, change, positive, volume }) => (
                    <div
                      key={symbol}
                      className="grid grid-cols-[1fr_auto] gap-5 border-b border-white/10 px-5 py-5 last:border-0 sm:grid-cols-[1.5fr_1fr_0.8fr] md:px-7"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm font-semibold">
                            {symbol}
                          </span>

                          <span className="hidden text-[9px] uppercase tracking-[0.12em] text-white/25 md:inline">
                            {volume}
                          </span>
                        </div>

                        <p className="mt-1 truncate text-xs text-white/35">
                          {name}
                        </p>
                      </div>

                      <div className="text-right sm:text-left">
                        <span className="font-mono text-sm">
                          {price}
                        </span>
                      </div>

                      <div
                        className={`text-right font-mono text-sm ${
                          positive
                            ? 'text-emerald-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {change}
                      </div>
                    </div>
                  ),
                )}

                <div className="bg-white/[0.025] px-5 py-4 text-[10px] leading-5 text-white/30 md:px-7">
                  Prices shown are Real and are live 
                  executable market data.
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* =========================================================
         * COPY TRADING
         * ======================================================= */}
        <section className="page-container py-24 md:py-32">
          <motion.div
            {...reveal}
            className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20"
          >
            <div>
              <span className="eyebrow">Copy trading</span>

              <h2 className="mt-6 font-display text-4xl leading-[1] tracking-[-0.035em] md:text-6xl">
                Follow a strategy.
                <br />
                <span className="text-muted-foreground">
                  Keep your perspective.
                </span>
              </h2>

              <p className="mt-7 max-w-md text-base leading-7 text-muted-foreground">
                Explore strategy profiles with performance and risk context
                presented together. The goal is visibility before allocation.
              </p>

              <Link
                to="/copy-trading"
                className="group mt-9 inline-flex items-center gap-2 border-b border-foreground pb-2 text-sm font-semibold"
              >
                Explore copy trading
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {STRATEGIES.map(
                ({
                  initials,
                  name,
                  specialty,
                  risk,
                  returnValue,
                  followers,
                }) => (
                  <Link
                    key={name}
                    to="/copy-trading"
                    className="group grid gap-5 rounded-2xl border border-border bg-background p-5 transition-all hover:-translate-y-0.5 hover:bg-secondary md:grid-cols-[auto_1fr_auto] md:items-center md:p-6"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-xs font-bold group-hover:bg-background">
                      {initials}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <h3 className="font-semibold">{name}</h3>

                        <span className="text-[10px] uppercase tracking-[0.13em] text-muted-foreground">
                          {risk} risk
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {specialty}
                      </p>

                      <p className="mt-2 text-xs text-muted-foreground">
                        {followers} followers
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-7 md:justify-end">
                      <div className="text-right">
                        <p className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                          Real return
                        </p>

                        <p className="mt-1 font-mono text-sm text-emerald-600 dark:text-emerald-400">
                          {returnValue}
                        </p>
                      </div>

                      <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                ),
              )}

              <p className="pt-3 text-[11px] leading-5 text-muted-foreground">
                Strategy figures shown above are ireal do
               represent guaranteed or expected returns.
              </p>
            </div>
          </motion.div>
        </section>

        {/* =========================================================
         * TRUST / CONTROL
         * ======================================================= */}
        <section className="border-y border-border bg-secondary/50">
          <div className="page-container grid gap-px bg-border md:grid-cols-3">
            <motion.div
              {...reveal}
              className="bg-secondary/50 px-7 py-10 md:px-9"
            >
              <LockKeyhole className="h-5 w-5 text-primary" />

              <h3 className="mt-8 font-display text-2xl tracking-tight">
                Account visibility
              </h3>

              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Keep funding, allocations and account activity organized in
                one place.
              </p>
            </motion.div>

            <motion.div
              {...reveal}
              transition={{
                duration: 0.55,
                delay: 0.06,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="bg-secondary/50 px-7 py-10 md:px-9"
            >
              <ShieldCheck className="h-5 w-5 text-primary" />

              <h3 className="mt-8 font-display text-2xl tracking-tight">
                Structured controls
              </h3>

              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Designed so important account actions remain clear and
                accessible.
              </p>
            </motion.div>

            <motion.div
              {...reveal}
              transition={{
                duration: 0.55,
                delay: 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="bg-secondary/50 px-7 py-10 md:px-9"
            >
              <CircleDollarSign className="h-5 w-5 text-primary" />

              <h3 className="mt-8 font-display text-2xl tracking-tight">
                Clear money movement
              </h3>

              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Follow deposits, withdrawals and allocations through a
                straightforward account experience.
              </p>
            </motion.div>
          </div>
        </section>

        {/* =========================================================
         * FINAL CTA
         * ======================================================= */}
        <section className="relative overflow-hidden py-24 md:py-36">
          <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />

          <motion.div
            {...reveal}
            className="page-container relative"
          >
            <div className="mx-auto max-w-4xl text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-border">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>

              <span className="eyebrow mt-7 block">
                Your next move
              </span>

              <h2 className="mt-6 font-display text-5xl leading-[0.95] tracking-[-0.045em] md:text-7xl">
                Make room for
                <br />
                <span className="text-muted-foreground">
                  better decisions.
                </span>
              </h2>

              <p className="mx-auto mt-7 max-w-lg text-base leading-7 text-muted-foreground">
                Start with the markets. Explore the strategies. Then decide
                what belongs in your account.
              </p>

              <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                <Button
                  size="lg"
                  asChild
                  className="h-12 rounded-full px-7"
                >
                  <Link to="/auth" search={{ mode: 'register' }}>
                    Create your account
                    <ArrowUpRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>

                <Button
                  size="lg"
                  asChild
                  variant="outline"
                  className="h-12 rounded-full px-7"
                >
                  <Link to="/copy-trading">
                    Explore strategies
                  </Link>
                </Button>
              </div>

              <div className="mt-9 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <Check className="h-3.5 w-3.5" />
                  Structured experience
                </span>

                <span className="inline-flex items-center gap-2">
                  <Check className="h-3.5 w-3.5" />
                  Transparent information
                </span>

                <span className="inline-flex items-center gap-2">
                  <Check className="h-3.5 w-3.5" />
                  Account controls
                </span>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
