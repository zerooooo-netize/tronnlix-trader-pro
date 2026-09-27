import { createFileRoute, Link } from '@tanstack/react-router';
import {
  ArrowRight,
  ArrowUpRight,
  MoveUpRight,
  ShieldCheck,
  ChartNoAxesCombined,
  Globe2,
  Wallet,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import hero from '@/assets/tronnlix-hero.jpg';

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'Tronnlix Trade, a clearer view of global markets' },
      {
        name: 'description',
        content:
          'Explore global markets and follow experienced trading strategies with Tronnlix Trade.',
      },
      { property: 'og:title', content: 'Tronnlix Trade, a clearer view of global markets' },
      {
        property: 'og:description',
        content:
          'Explore global markets and follow experienced trading strategies with Tronnlix Trade.',
      },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
  }),
  component: Home,
});

const CAPABILITIES = [
  {
    icon: Globe2,
    num: '01',
    title: 'Global markets',
    body: 'Follow the currency pairs and instruments that shape the week, without the noise.',
    to: '/markets',
  },
  {
    icon: ChartNoAxesCombined,
    num: '02',
    title: 'Copy trading',
    body: 'Compare strategies by risk, returns and experience. Allocate at your own pace.',
    to: '/copy-trading',
  },
  {
    icon: Wallet,
    num: '03',
    title: 'Funding and payouts',
    body: 'Deposit, withdraw and track every movement from a single, honest ledger.',
    to: '/pricing',
  },
  {
    icon: ShieldCheck,
    num: '04',
    title: 'Control at every step',
    body: 'Pause, resume or stop an allocation whenever your view changes.',
    to: '/about',
  },
] as const;

const MARKET_ROWS = [
  { pair: 'EUR / USD', price: '1.0842', change: '+0.32%', positive: true },
  { pair: 'GBP / USD', price: '1.2736', change: '+0.18%', positive: true },
  { pair: 'USD / JPY', price: '149.82', change: '-0.11%', positive: false },
  { pair: 'XAU / USD', price: '2,318.40', change: '+0.46%', positive: true },
] as const;

function Home() {
  return (
    <>
      <SiteHeader />
      <main className="bg-background">
        {/* ---------------------------------------------------------
         * Hero
         * ------------------------------------------------------- */}
        <section className="hero relative">
          <img
            src={hero}
            width={1536}
            height={1024}
            alt="Sculptural chrome form representing market movement"
            className="hero-image"
          />
          <div className="hero-shade" />
          <div className="page-container relative z-10 flex min-h-[600px] flex-col justify-between py-10 md:min-h-[680px]">
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[.18em] text-hero-muted">
              <span>Markets without the noise</span>
              <span className="hidden md:block">Trading, considered.</span>
            </div>

            <motion.div
              initial={{ y: 22, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="pb-12 md:pb-20"
            >
              <span className="eyebrow text-hero-muted">Tronnlix / Global markets</span>
              <h1 className="mt-6 max-w-[820px] font-display text-[clamp(3.2rem,6vw,6.6rem)] font-medium leading-[.98] tracking-[-0.01em] text-hero-foreground">
                Tronnlix Trade
                <br />
                <em className="not-italic font-normal text-hero-accent">
                  Move with clarity.
                </em>
              </h1>
              <p className="mt-8 max-w-[480px] text-base leading-7 text-hero-muted">
                Take a more deliberate approach to trading. Explore global
                markets, follow expert strategies, and stay in control of every
                move.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-5">
                <Button size="lg" asChild className="h-12 rounded-full px-6">
                  <Link to="/auth" search={{ mode: 'register' }}>
                    Open an account
                    <ArrowUpRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                <Link
                  to="/copy-trading"
                  className="group inline-flex items-center gap-2 text-sm font-semibold text-hero-foreground hover:text-hero-accent"
                >
                  Explore copy trading
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </motion.div>

            <div className="grid grid-cols-3 gap-4 border-t border-hero-line pt-6 text-[11px] uppercase tracking-widest text-hero-muted">
              <span>
                <span className="mr-2 text-hero-accent">01</span>Discover
              </span>
              <span>
                <span className="mr-2 text-hero-accent">02</span>Allocate
              </span>
              <span>
                <span className="mr-2 text-hero-accent">03</span>Stay in control
              </span>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------
         * Approach
         * ------------------------------------------------------- */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="page-container grid gap-12 py-24 md:grid-cols-[.9fr_1.1fr] md:gap-24"
        >
          <div>
            <span className="eyebrow">The Tronnlix approach</span>
            <h2 className="mt-6 font-display text-4xl leading-[1.05] tracking-tight md:text-6xl">
              Built for decisions,
              <br />
              <span className="text-muted-foreground">not distractions.</span>
            </h2>
          </div>
          <div className="md:pt-12">
            <p className="max-w-xl text-lg leading-8 text-muted-foreground">
              Every number should tell you something. Every action should feel
              intentional. Tronnlix Trade brings your account, funding and copy
              strategies into one composed workspace.
            </p>
            <Link
              to="/about"
              className="group mt-8 inline-flex items-center gap-2 border-b border-foreground pb-2 text-sm font-semibold"
            >
              The way we think
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </motion.section>

        {/* ---------------------------------------------------------
         * Capabilities
         * ------------------------------------------------------- */}
        <section className="bg-secondary py-20 sm:py-24">
          <div className="page-container">
            <div className="mb-12 flex items-end justify-between gap-6">
              <div>
                <span className="eyebrow">Capabilities</span>
                <h2 className="mt-5 font-display text-4xl tracking-tight md:text-5xl">
                  One place. More perspective.
                </h2>
              </div>
              <span className="hidden text-xs text-muted-foreground md:block">
                Designed to keep you moving
              </span>
            </div>

            <div className="grid gap-px overflow-hidden rounded-2xl bg-border md:grid-cols-2 xl:grid-cols-4">
              {CAPABILITIES.map(({ icon: Icon, num, title, body, to }) => (
                <Link
                  key={num}
                  to={to}
                  className="group relative bg-secondary px-7 py-8 transition-colors hover:bg-background"
                >
                  <div className="flex items-start justify-between">
                    <Icon size={26} strokeWidth={1.4} className="text-primary" />
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {num} / {String(CAPABILITIES.length).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="mt-20 font-display text-2xl tracking-tight">
                    {title}
                  </h3>
                  <p className="mt-4 max-w-xs text-sm leading-7 text-muted-foreground">
                    {body}
                  </p>
                  <MoveUpRight
                    size={18}
                    className="mt-8 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
                  />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------
         * Market snapshot
         * ------------------------------------------------------- */}
        <section className="page-container grid gap-14 py-24 md:grid-cols-[1fr_1fr]">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="market-panel"
          >
            <div className="flex justify-between text-xs text-market-muted">
              <span className="uppercase tracking-[.16em]">Market snapshot</span>
              <span>Illustrative</span>
            </div>

            <div className="mt-10 font-display text-3xl leading-tight text-market-foreground sm:text-4xl">
              The bigger picture.
            </div>

            <div className="mt-10">
              <div className="grid grid-cols-3 border-b border-market-line pb-3 text-[10.5px] uppercase tracking-[.16em] text-market-muted">
                <span>Pair</span>
                <span className="text-center">Last</span>
                <span className="text-right">Change</span>
              </div>
              {MARKET_ROWS.map(({ pair, price, change, positive }) => (
                <div
                  key={pair}
                  className="grid grid-cols-3 border-b border-market-line py-4 text-sm text-market-foreground last:border-b-0"
                >
                  <span className="font-medium">{pair}</span>
                  <span className="text-center tabular-nums">{price}</span>
                  <span
                    className={`text-right tabular-nums ${
                      positive ? 'text-market-positive' : 'text-rose-400'
                    }`}
                  >
                    {change}
                  </span>
                </div>
              ))}
            </div>

            <p className="mt-8 text-xs text-market-muted">
              Illustrative prices. Not live market data.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col justify-center"
          >
            <span className="eyebrow">Strategy meets clarity</span>
            <h2 className="mt-6 font-display text-4xl leading-[1.05] tracking-tight md:text-5xl">
              Follow an approach.
              <br />
              Not a feeling.
            </h2>
            <p className="mt-7 max-w-md text-base leading-8 text-muted-foreground">
              Explore trader strategies with risk context up front. Choose an
              allocation that fits your goals, and pause or stop whenever you
              need to.
            </p>
            <Button asChild variant="outline" className="mt-9 w-fit rounded-full px-5">
              <Link to="/copy-trading">
                Explore strategies
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </section>

        {/* ---------------------------------------------------------
         * Closing CTA
         * ------------------------------------------------------- */}
        <section className="border-t border-border py-20 sm:py-24">
          <div className="page-container flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
            <div>
              <span className="eyebrow">Your next move</span>
              <h2 className="mt-5 font-display text-4xl leading-[1.05] tracking-tight md:text-6xl">
                Make space for
                <br />
                better decisions.
              </h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:items-center">
              <Button size="lg" asChild className="h-12 rounded-full px-6">
                <Link to="/auth" search={{ mode: 'register' }}>
                  Create your account
                  <ArrowUpRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                asChild
                variant="outline"
                className="h-12 rounded-full px-6"
              >
                <Link to="/copy-trading">See strategies</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
