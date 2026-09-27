import { Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { ArrowUpRight, Clock3, CircleDot, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SiteHeader } from './site-header';
import { SiteFooter } from './site-footer';

type InfoItem = { title: string; body: string };

type InfoPageProps = {
  eyebrow: string;
  title: string;
  body: string;
  items: InfoItem[];
  /** Optional second paragraph shown under the title on wide screens */
  lead?: string;
  /** Optional closing headline. Defaults to a generic CTA line. */
  closingTitle?: string;
  /** Optional closing support line. */
  closingBody?: string;
};

export function InfoPage({
  eyebrow,
  title,
  body,
  items,
  lead,
  closingTitle = 'Ready when you are.',
  closingBody = 'Open an account in a few minutes. No card required to explore the platform.',
}: InfoPageProps) {
  const readingMinutes = Math.max(
    2,
    Math.round(
      (body.split(/\s+/).length +
        items.reduce((n, i) => n + i.body.split(/\s+/).length, 0)) /
        200
    )
  );

  return (
    <>
      <SiteHeader />
      <main className="bg-background">
        {/* ---------------------------------------------------------------
         * Intro: asymmetric hero
         * ------------------------------------------------------------- */}
        <section className="relative overflow-hidden">
          {/* Quiet decorative grid, no images, no AI illustration */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:56px_56px] text-foreground [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]"
          />
          <div className="mx-auto max-w-7xl px-5 pb-16 pt-20 sm:px-8 sm:pb-24 sm:pt-28">
            <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-16">
              <div>
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
                >
                  {eyebrow}
                  <span className="mx-2 text-border">/</span>
                  Tronnlix Trade
                </motion.p>

                <motion.h1
                  id="info-title"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
                  className="mt-6 max-w-[22ch] font-display text-4xl font-medium leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-[68px]"
                >
                  {title}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="mt-8 max-w-2xl text-[16.5px] leading-8 text-muted-foreground sm:text-lg"
                >
                  {body}
                </motion.p>

                {lead && (
                  <p className="mt-4 max-w-2xl text-[15px] leading-7 text-muted-foreground/80">
                    {lead}
                  </p>
                )}
              </div>

              {/* Context rail */}
              <aside className="lg:pt-24">
                <div className="rounded-2xl border border-border/70 bg-card/60 p-5 backdrop-blur-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    On this page
                  </p>
                  <ul className="mt-3 space-y-2">
                    {items.map((item, i) => (
                      <li key={item.title} className="flex items-baseline gap-2.5 text-sm">
                        <span className="tabular-nums text-xs text-muted-foreground/70">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="text-foreground/85">{item.title}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5 flex items-center gap-4 border-t border-border/60 pt-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 className="h-3.5 w-3.5" />
                      {readingMinutes} min read
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <CircleDot className="h-3.5 w-3.5 text-emerald-500" />
                      Updated 2026
                    </span>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------
         * Items: editorial numbered grid
         * ------------------------------------------------------------- */}
        <section
          aria-labelledby="info-title"
          className="border-y border-border/70 bg-secondary/40"
        >
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="grid divide-y divide-border/60 md:grid-cols-3 md:divide-x md:divide-y-0">
              {items.map((item, i) => (
                <motion.article
                  key={item.title}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{
                    duration: 0.4,
                    delay: i * 0.05,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="group relative px-0 py-10 md:px-8 md:py-14 md:first:pl-0 md:last:pr-0"
                >
                  <span className="font-display text-xs tabular-nums text-primary">
                    {String(i + 1).padStart(2, '0')}
                    <span className="ml-1 text-muted-foreground/60">/</span>
                  </span>

                  <h2 className="mt-6 font-display text-[22px] font-medium leading-snug tracking-tight text-foreground">
                    {item.title}
                  </h2>

                  <p className="mt-3 max-w-prose text-[14px] leading-7 text-muted-foreground">
                    {item.body}
                  </p>

                  {/* Quiet hover indicator, no button, keeps it editorial */}
                  <span
                    aria-hidden="true"
                    className="mt-6 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground/0 transition-colors duration-200 group-hover:text-primary"
                  >
                    Learn more
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------
         * Closing CTA
         * ------------------------------------------------------------- */}
        <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
          <div className="grid items-end gap-10 md:grid-cols-[minmax(0,1fr)_auto]">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Next step
              </span>
              <h2 className="mt-5 max-w-[18ch] font-display text-3xl font-medium leading-[1.1] tracking-tight text-foreground sm:text-4xl md:text-5xl">
                {closingTitle}
              </h2>
              <p className="mt-4 max-w-xl text-[15px] leading-7 text-muted-foreground">
                {closingBody}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row md:flex-col md:items-end">
              <Button size="lg" asChild className="group h-12 rounded-full px-6">
                <Link to="/auth" search={{ mode: 'register' }}>
                  Open an account
                  <ArrowUpRight className="ml-1 h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="h-12 rounded-full border-border/70 px-6"
              >
                <Link to="/contact">
                  <MessageCircle className="mr-1.5 h-4 w-4" />
                  Talk to support
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
