import { createFileRoute, Link } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  LifeBuoy,
  Search,
  ShieldCheck,
  Wallet,
  Users,
  ArrowUpRight,
  BookOpen,
} from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Button } from '@/components/ui/button';
import { Empty } from '@/components/status';

export const Route = createFileRoute('/faq')({
  head: () => ({
    meta: [
      { title: 'FAQ, Tronnlix Trade' },
      {
        name: 'description',
        content:
          'Answers about verification, deposits, withdrawals, copy trading and account security.',
      },
      { property: 'og:title', content: 'FAQ, Tronnlix Trade' },
      {
        property: 'og:description',
        content:
          'Answers about verification, deposits, withdrawals, copy trading and account security.',
      },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: FAQ_GROUPS.flatMap((g) =>
            g.items.map((i) => ({
              '@type': 'Question',
              name: i.q,
              acceptedAnswer: { '@type': 'Answer', text: i.a },
            }))
          ),
        }),
      },
    ],
  }),
  component: FaqPage,
});

type FaqItem = { q: string; a: string };
type FaqGroup = {
  id: string;
  caption: string;
  title: string;
  icon: React.ElementType;
  items: FaqItem[];
};

export const FAQ_GROUPS: FaqGroup[] = [
  {
    id: 'getting-started',
    caption: 'Getting started',
    title: 'Your first steps',
    icon: BookOpen,
    items: [
      {
        q: 'How do I open an account?',
        a: 'Create an account with your email, confirm the verification link we send you, then complete your profile. Verification unlocks deposits, withdrawals and copy trading.',
      },
      {
        q: 'What do I need to complete verification?',
        a: 'Submit your personal details for manual review. Identity document uploads are not yet automated, so approval requires an independent check by our team.',
      },
      {
        q: 'How long does review take?',
        a: 'Most reviews are handled within one business day. If we need anything else, we will reach out through your support inbox, not by email link.',
      },
    ],
  },
  {
    id: 'deposits',
    caption: 'Funding',
    title: 'Deposits and withdrawals',
    icon: Wallet,
    items: [
      {
        q: 'How do I deposit funds?',
        a: 'Choose a receiving wallet, send the exact amount on the matching network, then report the transaction hash. Your deposit stays pending until we verify it.',
      },
      {
        q: 'Can I deposit on a different network?',
        a: 'No. Only send on the network shown on the deposit page. Transfers on the wrong network can be permanently lost and cannot be recovered.',
      },
      {
        q: 'How do withdrawals work?',
        a: 'Request a withdrawal from your wallet and enter the destination address. Requests are reviewed manually and once approved, funds are reserved.',
      },
      {
        q: 'Are there fees?',
        a: 'Deposit and withdrawal fees are shown on each wallet before you confirm. Fees vary by coin and network.',
      },
    ],
  },
  {
    id: 'copy-trading',
    caption: 'Copy trading',
    title: 'Following strategies',
    icon: Users,
    items: [
      {
        q: 'How does copy trading work?',
        a: 'Review strategy profiles, compare risk and returns, then allocate an amount from your available balance. You can pause, resume or stop an allocation at any time.',
      },
      {
        q: 'Are returns guaranteed?',
        a: 'No. Trading carries risk, including loss of capital. Example figures shown on strategy profiles are illustrative and do not represent live verified returns.',
      },
      {
        q: 'Can I follow more than one strategy?',
        a: 'Yes. You can allocate to as many strategies as your available balance allows and manage each allocation independently.',
      },
    ],
  },
  {
    id: 'security',
    caption: 'Account',
    title: 'Security and access',
    icon: ShieldCheck,
    items: [
      {
        q: 'How is my account protected?',
        a: 'Accounts support strong passwords, session management and two factor authentication when enabled. Suspicious activity is logged to your activity trail.',
      },
      {
        q: 'What if I lose access to my email?',
        a: 'Contact support from within your account if you can still sign in. If you cannot, use the account recovery flow on the login page.',
      },
      {
        q: 'Where can I see my past actions?',
        a: 'Every account action is visible under Profile and security, in the Activity log section.',
      },
    ],
  },
];

function FaqPage() {
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(FAQ_GROUPS[0]?.items[0]?.q ?? null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FAQ_GROUPS;
    return FAQ_GROUPS.map((g) => ({
      ...g,
      items: g.items.filter(
        (i) => i.q.toLowerCase().includes(q) || i.a.toLowerCase().includes(q)
      ),
    })).filter((g) => g.items.length > 0);
  }, [query]);

  const totalMatches = filtered.reduce((n, g) => n + g.items.length, 0);

  return (
    <>
      <SiteHeader />
      <main className="bg-background">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06] text-foreground [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]"
          />
          <div className="mx-auto max-w-7xl px-5 pb-12 pt-20 sm:px-8 sm:pb-16 sm:pt-28">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Help
                  <span className="mx-2 text-border">/</span>
                  FAQ
                </span>
                <h1 className="mt-6 max-w-[22ch] font-display text-4xl font-medium leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl">
                  The important questions, answered.
                </h1>
                <p className="mt-8 max-w-2xl text-[16.5px] leading-8 text-muted-foreground sm:text-lg">
                  Short, plain answers about verification, funding, copy trading
                  and security. If something is missing, support is one message
                  away.
                </p>
              </div>

              <aside className="lg:pt-16">
                <div className="rounded-2xl border border-border/70 bg-card/60 p-5 backdrop-blur-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    On this page
                  </p>
                  <ul className="mt-3 space-y-2 text-sm">
                    {FAQ_GROUPS.map((g) => (
                      <li key={g.id}>
                        <a
                          href={`#${g.id}`}
                          className="flex items-center gap-2.5 text-foreground/85 hover:text-primary"
                        >
                          <g.icon className="h-3.5 w-3.5 text-primary" />
                          {g.caption}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* Search + accordion */}
        <section className="border-y border-border/70 bg-secondary/40 py-12 sm:py-16">
          <div className="mx-auto max-w-4xl px-5 sm:px-8">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search the FAQ"
                className="h-12 w-full rounded-full border border-border/70 bg-background/60 pl-11 pr-4 text-[14px] text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-label="Search frequently asked questions"
              />
              {query && (
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[11.5px] text-muted-foreground">
                  {totalMatches} {totalMatches === 1 ? 'result' : 'results'}
                </span>
              )}
            </div>

            {filtered.length === 0 ? (
              <div className="mt-8">
                <Empty
                  eyebrow="No match"
                  title="Nothing matched your search"
                  body="Try a different word or contact support and we will help directly."
                  icon={Search}
                  action={{
                    label: 'Clear search',
                    onClick: () => setQuery(''),
                  }}
                  secondaryAction={{
                    label: 'Contact support',
                    href: '/contact',
                    variant: 'ghost',
                  }}
                  compact
                />
              </div>
            ) : (
              <div className="mt-10 space-y-12">
                {filtered.map((group) => (
                  <section key={group.id} id={group.id} className="scroll-mt-24">
                    <div className="flex items-center gap-2.5">
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                        <group.icon className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          {group.caption}
                        </p>
                        <h2 className="font-display text-xl tracking-tight text-foreground">
                          {group.title}
                        </h2>
                      </div>
                    </div>

                    <ul className="mt-5 divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/70 bg-background">
                      {group.items.map((item) => {
                        const isOpen = openId === item.q;
                        return (
                          <li key={item.q}>
                            <button
                              type="button"
                              onClick={() => setOpenId(isOpen ? null : item.q)}
                              aria-expanded={isOpen}
                              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/40"
                            >
                              <span className="text-[14px] font-medium text-foreground">
                                {item.q}
                              </span>
                              <ChevronDown
                                className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                                  isOpen ? 'rotate-180' : ''
                                }`}
                              />
                            </button>
                            <AnimatePresence initial={false}>
                              {isOpen && (
                                <motion.div
                                  key="content"
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                                  className="overflow-hidden"
                                >
                                  <p className="border-t border-border/40 px-5 py-4 text-[13.5px] leading-7 text-muted-foreground">
                                    {item.a}
                                  </p>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Closing CTA */}
        <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
          <div className="grid items-end gap-10 md:grid-cols-[minmax(0,1fr)_auto]">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Still stuck
              </span>
              <h2 className="mt-5 max-w-[20ch] font-display text-3xl font-medium leading-[1.1] tracking-tight text-foreground sm:text-4xl md:text-5xl">
                A real person is one message away.
              </h2>
              <p className="mt-4 max-w-xl text-[15px] leading-7 text-muted-foreground">
                Send a support request from your account and we will reply in your
                inbox. Most requests are answered within one business day.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:flex-col md:items-end">
              <Button asChild className="h-12 rounded-full px-6">
                <Link to="/contact">
                  <LifeBuoy className="mr-1.5 h-4 w-4" />
                  Contact support
                  <ArrowUpRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-12 rounded-full px-6">
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
