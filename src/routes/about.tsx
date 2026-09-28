import { createFileRoute, Link } from '@tanstack/react-router';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Eye,
  Gauge,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export const Route = createFileRoute('/about')({
  head: () => ({
    meta: [
      {
        title: 'About Tronnlix Trade | Built around clarity',
      },
      {
        name: 'description',
        content:
          'Learn how Tronnlix Trade approaches markets, copy trading, transparency and account control.',
      },
      {
        property: 'og:title',
        content: 'About Tronnlix Trade | Built around clarity',
      },
      {
        property: 'og:description',
        content:
          'Learn how Tronnlix Trade approaches markets, copy trading, transparency and account control.',
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
  component: About,
});

const PRINCIPLES = [
  {
    number: '01',
    icon: Eye,
    title: 'Clarity first',
    body:
      'Account activity, funding status and strategy information should be understandable without decoding a wall of financial jargon.',
  },
  {
    number: '02',
    icon: Gauge,
    title: 'Context before action',
    body:
      'Performance means more when risk, timeframe and strategy context are visible alongside it.',
  },
  {
    number: '03',
    icon: LockKeyhole,
    title: 'Control stays visible',
    body:
      'Important account actions should be easy to find, clearly labeled and confirmed before they take effect.',
  },
  {
    number: '04',
    icon: ShieldCheck,
    title: 'Transparency matters',
    body:
      'We distinguish illustrative information from live account or market information so the interface does not create false certainty.',
  },
] as const;

function About() {
  const reduceMotion = useReducedMotion();

  const reveal = {
    initial: reduceMotion ? false : { opacity: 0, y: 18 },
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
        <section className="relative border-b border-border">
          <div className="page-container py-20 md:py-28 lg:py-36">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 22 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{
                duration: 0.75,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20"
            >
              <div>
                <div className="flex items-center gap-3">
                  <span className="h-px w-8 bg-primary" />
                  <span className="eyebrow">About Tronnlix</span>
                </div>

                <p className="mt-7 max-w-xs text-sm leading-6 text-muted-foreground">
                  A trading platform designed around information, context and
                  control.
                </p>
              </div>

              <div>
                <h1 className="max-w-5xl font-display text-[clamp(3.3rem,7vw,7.5rem)] font-medium leading-[0.9] tracking-[-0.055em]">
                  Trading deserves
                  <br />
                  <span className="text-muted-foreground">
                    a clearer point of view.
                  </span>
                </h1>

                <p className="mt-9 max-w-2xl text-lg leading-8 text-muted-foreground md:text-xl">
                  Tronnlix Trade is built around a simple principle: the path
                  from discovering an opportunity to making a decision should
                  feel deliberate, understandable and controlled.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* =========================================================
         * STATEMENT
         * ======================================================= */}
        <motion.section
          {...reveal}
          className="page-container grid gap-12 py-24 md:grid-cols-[1fr_1.4fr] md:py-32 lg:gap-24"
        >
          <div>
            <span className="eyebrow">The idea</span>

            <div className="mt-7 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              Information should serve the decision
            </div>
          </div>

          <div>
            <p className="font-display text-3xl leading-[1.12] tracking-[-0.025em] md:text-5xl">
              Every number should tell you something. Every action should feel
              intentional. Every important choice should remain visible.
            </p>

            <p className="mt-8 max-w-2xl text-base leading-8 text-muted-foreground">
              That thinking shapes how we approach the platform. Markets,
              strategy profiles, funding and account activity should work
              together rather than compete for attention.
            </p>
          </div>
        </motion.section>

        {/* =========================================================
         * PRINCIPLES
         * ======================================================= */}
        <section className="border-y border-border bg-secondary/50">
          <div className="page-container py-20 md:py-28">
            <motion.div {...reveal} className="mb-12">
              <span className="eyebrow">Our principles</span>

              <h2 className="mt-5 max-w-3xl font-display text-4xl leading-[1] tracking-[-0.035em] md:text-6xl">
                Four ideas behind
                <br />
                <span className="text-muted-foreground">
                  the experience.
                </span>
              </h2>
            </motion.div>

            <div className="grid gap-px overflow-hidden rounded-3xl border border-border bg-border md:grid-cols-2">
              {PRINCIPLES.map(
                ({ number, icon: Icon, title, body }, index) => (
                  <motion.article
                    key={number}
                    {...reveal}
                    transition={{
                      duration: 0.55,
                      delay: index * 0.06,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="group min-h-[300px] bg-background p-7 md:p-9"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border transition-colors group-hover:bg-secondary">
                        <Icon
                          className="h-5 w-5 text-primary"
                          strokeWidth={1.5}
                        />
                      </div>

                      <span className="font-mono text-[10px] text-muted-foreground">
                        {number}
                      </span>
                    </div>

                    <div className="mt-20">
                      <h3 className="font-display text-2xl tracking-tight md:text-3xl">
                        {title}
                      </h3>

                      <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground">
                        {body}
                      </p>
                    </div>
                  </motion.article>
                ),
              )}
            </div>
          </div>
        </section>

        {/* =========================================================
         * HOW IT FITS TOGETHER
         * ======================================================= */}
        <section className="page-container py-24 md:py-32">
          <motion.div
            {...reveal}
            className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-24"
          >
            <div>
              <span className="eyebrow">The experience</span>

              <h2 className="mt-6 font-display text-4xl leading-[1.02] tracking-[-0.035em] md:text-6xl">
                From discovery
                <br />
                <span className="text-muted-foreground">
                  to decision.
                </span>
              </h2>
            </div>

            <div className="space-y-0">
              {[
                {
                  number: '01',
                  title: 'Explore',
                  body:
                    'Start with the markets and instruments that interest you. Understand what is moving before considering an allocation.',
                },
                {
                  number: '02',
                  title: 'Compare',
                  body:
                    'Review copy trading strategies using performance, risk and strategy context rather than a single headline number.',
                },
                {
                  number: '03',
                  title: 'Allocate',
                  body:
                    'Choose how much capital to allocate based on your own objectives and risk considerations.',
                },
                {
                  number: '04',
                  title: 'Monitor',
                  body:
                    'Keep your account activity and strategy allocations visible from your personal workspace.',
                },
              ].map(({ number, title, body }) => (
                <div
                  key={number}
                  className="grid gap-5 border-t border-border py-7 md:grid-cols-[80px_0.55fr_1fr] md:items-start"
                >
                  <span className="font-mono text-xs text-muted-foreground">
                    {number}
                  </span>

                  <h3 className="font-display text-2xl tracking-tight">
                    {title}
                  </h3>

                  <p className="max-w-lg text-sm leading-7 text-muted-foreground">
                    {body}
                  </p>
                </div>
              ))}

              <div className="border-t border-border" />
            </div>
          </motion.div>
        </section>

        {/* =========================================================
         * RESPONSIBLE COMMUNICATION
         * ======================================================= */}
        <section className="bg-[#0c0d0f] py-24 text-white md:py-32">
          <div className="page-container">
            <motion.div
              {...reveal}
              className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-24"
            >
              <div>
                <span className="eyebrow text-white/45">
                  A deliberate interface
                </span>

                <div className="mt-7 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                  <ShieldCheck className="h-5 w-5 text-white/75" />
                </div>
              </div>

              <div>
                <h2 className="max-w-3xl font-display text-4xl leading-[1] tracking-[-0.035em] md:text-6xl">
                  Clear about what is
                  <br />
                  <span className="text-white/45">
                    real, illustrative or pending.
                  </span>
                </h2>

                <p className="mt-8 max-w-2xl text-base leading-8 text-white/55">
                  Financial interfaces need to communicate status carefully.
                  Illustrative market figures should not look like executable
                  prices. Account actions should show their current state.
                  Strategy performance should be presented with appropriate
                  context.
                </p>

                <div className="mt-10 grid gap-3 sm:grid-cols-3">
                  {[
                    'Market context',
                    'Account status',
                    'Strategy context',
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs text-white/65"
                    >
                      <Check className="h-3.5 w-3.5 text-white/70" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* =========================================================
         * CLOSING
         * ======================================================= */}
        <section className="relative overflow-hidden py-24 md:py-36">
          <div className="absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />

          <motion.div
            {...reveal}
            className="page-container relative"
          >
            <div className="mx-auto max-w-4xl text-center">
              <span className="eyebrow">Explore Tronnlix Trade</span>

              <h2 className="mt-6 font-display text-5xl leading-[0.95] tracking-[-0.045em] md:text-7xl">
                See the platform
                <br />
                <span className="text-muted-foreground">
                  for yourself.
                </span>
              </h2>

              <p className="mx-auto mt-7 max-w-xl text-base leading-7 text-muted-foreground">
                Browse the markets, explore strategy profiles and discover how
                the platform is structured before deciding what comes next.
              </p>

              <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                <Button
                  size="lg"
                  asChild
                  className="h-12 rounded-full px-7"
                >
                  <Link to="/auth" search={{ mode: 'register' }}>
                    Open an account
                    <ArrowUpRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>

                <Button
                  size="lg"
                  asChild
                  variant="outline"
                  className="h-12 rounded-full px-7"
                >
                  <Link to="/markets">
                    Explore markets
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
