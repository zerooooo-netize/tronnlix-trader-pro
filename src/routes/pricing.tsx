import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  BadgeCheck,
  Check,
  Coins,
  Info,
  Loader2,
  ShieldCheck,
  Sparkles,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Empty } from '@/components/status';
import { supabase } from '@/integrations/supabase/client';
import { money } from '@/lib/format';

export const Route = createFileRoute('/pricing')({
  head: () => ({
    meta: [
      { title: 'Pricing, Tronnlix Trade' },
      {
        name: 'description',
        content:
          'Deposit, withdrawal and copy trading fees, published up front. No hidden charges and no surprises before you fund an account.',
      },
      { property: 'og:title', content: 'Pricing, Tronnlix Trade' },
      {
        property: 'og:description',
        content:
          'Deposit, withdrawal and copy trading fees, published up front. No hidden charges and no surprises before you fund an account.',
      },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
  }),
  component: PricingPage,
});

type WalletRow = {
  id: string;
  asset: string;
  network: string;
  min_deposit: number;
  max_deposit: number;
  deposit_fee: number;
  withdrawal_fee: number;
};

const COPY_FEE_TIERS = [
  {
    name: 'Standard',
    tagline: 'For most investors starting out',
    allocation: 'Any allocation from the trader minimum',
    fee: '0.00%',
    feeNote: 'No platform copy fee',
    perks: [
      'Follow unlimited strategies',
      'Pause, resume or stop any time',
      'Full performance and risk disclosure',
    ],
    cta: { label: 'Open an account', to: '/auth?mode=register' },
    featured: false,
  },
  {
    name: 'Active',
    tagline: 'For larger or multi strategy allocations',
    allocation: 'From $10,000 total allocated',
    fee: '0.00%',
    feeNote: 'No platform copy fee',
    perks: [
      'Everything in Standard',
      'Priority support queue',
      'Dedicated account review',
    ],
    cta: { label: 'Open an account', to: '/auth?mode=register' },
    featured: true,
  },
] as const;

function PricingPage() {
  const [wallets, setWallets] = useState<WalletRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('crypto_wallets')
      .select('id, asset, network, min_deposit, max_deposit, deposit_fee, withdrawal_fee')
      .eq('active', true)
      .order('asset')
      .then(({ data }) => {
        setWallets((data ?? []) as WalletRow[]);
        setLoading(false);
      });
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, WalletRow[]>();
    wallets.forEach((w) => {
      const list = map.get(w.asset) ?? [];
      list.push(w);
      map.set(w.asset, list);
    });
    return Array.from(map.entries());
  }, [wallets]);

  return (
    <>
      <SiteHeader />
      <main className="bg-background">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border/70">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06] text-foreground [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]"
          />
          <div className="mx-auto max-w-6xl px-5 pb-14 pt-20 sm:px-8 sm:pb-20 sm:pt-28">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-16">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Pricing
                  <span className="mx-2 text-border">/</span>
                  What you actually pay
                </span>
                <h1 className="mt-6 max-w-[22ch] font-display text-4xl font-medium leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl">
                  Understand the details before you move.
                </h1>
                <p className="mt-6 max-w-2xl text-[16px] leading-8 text-muted-foreground">
                  Funding fees, network costs and copy trading terms, published
                  up front. If something changes, this page changes first.
                </p>
              </div>

              <aside className="lg:pt-16">
                <div className="rounded-2xl border border-border/70 bg-card/60 p-5 backdrop-blur-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Our pricing rules
                  </p>
                  <ul className="mt-4 space-y-3 text-[13px] text-muted-foreground">
                    {[
                      { icon: ShieldCheck, label: 'No hidden charges' },
                      { icon: BadgeCheck, label: 'Fees shown before you confirm' },
                      { icon: Sparkles, label: 'Copy trading has no platform fee' },
                    ].map(({ icon: Icon, label }) => (
                      <li key={label} className="flex items-center gap-2.5">
                        <Icon className="h-3.5 w-3.5 shrink-0 text-primary" />
                        {label}
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* Funding fees */}
        <section className="border-b border-border/70 bg-secondary/40 py-14 sm:py-16">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="flex items-end justify-between gap-6">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Funding
                </span>
                <h2 className="mt-4 font-display text-3xl tracking-tight text-foreground sm:text-4xl">
                  Deposits and withdrawals
                </h2>
                <p className="mt-3 max-w-2xl text-[14.5px] leading-7 text-muted-foreground">
                  Per asset and network. Blockchain network fees are set by the
                  chain, not by Tronnlix, and are shown in your wallet before you
                  confirm any transfer.
                </p>
              </div>
            </div>

            <div className="mt-8">
              {loading ? (
                <ul className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <li
                      key={i}
                      className="h-20 animate-pulse rounded-2xl border border-border/60 bg-background/60"
                    />
                  ))}
                </ul>
              ) : grouped.length === 0 ? (
                <Empty
                  eyebrow="Funding not yet open"
                  title="Deposits are not open yet"
                  body="Wallet networks and fees will be published here before funding opens. Do not send funds to any address until a verified wallet appears on your deposit page."
                  icon={Wallet}
                  action={{ label: 'Open an account', href: '/auth?mode=register' }}
                  secondaryAction={{ label: 'Contact support', href: '/contact', variant: 'ghost' }}
                />
              ) : (
                <div className="overflow-hidden rounded-2xl border border-border/70 bg-background">
                  <div className="hidden grid-cols-[1.2fr_1fr_1fr_1fr] gap-4 border-b border-border/60 bg-muted/30 px-5 py-3 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground md:grid">
                    <span>Asset</span>
                    <span>Network</span>
                    <span className="text-right">Limits (USD)</span>
                    <span className="text-right">Deposit / Withdrawal</span>
                  </div>
                  <ul className="divide-y divide-border/60">
                    {grouped.map(([asset, rows]) => (
                      <li key={asset}>
                        {rows.map((w, i) => (
                          <div
                            key={w.id}
                            className="grid grid-cols-1 gap-2 px-5 py-4 md:grid-cols-[1.2fr_1fr_1fr_1fr] md:items-center md:gap-4"
                          >
                            <div className="flex items-center gap-2">
                              <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/10 text-[11px] font-semibold text-primary">
                                {asset.slice(0, 3)}
                              </span>
                              <span className="text-[14px] font-medium text-foreground">
                                {i === 0 ? asset : ''}
                              </span>
                            </div>
                            <span className="text-[13px] text-muted-foreground">
                              {w.network}
                            </span>
                            <span className="text-right text-[13px] tabular-nums text-muted-foreground md:text-foreground">
                              {money(w.min_deposit)} to {money(w.max_deposit)}
                            </span>
                            <span className="text-right text-[13px] tabular-nums text-foreground">
                              {w.deposit_fee === 0 ? 'Free' : money(w.deposit_fee)}
                              {' / '}
                              {w.withdrawal_fee === 0 ? 'Free' : money(w.withdrawal_fee)}
                            </span>
                          </div>
                        ))}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="mt-4 flex items-start gap-2 text-xs leading-6 text-muted-foreground">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Network fees are charged by the blockchain and shown before you
                confirm. Tronnlix does not mark them up.
              </p>
            </div>
          </div>
        </section>

        {/* Copy trading tiers */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="flex items-end justify-between gap-6">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Copy trading
                </span>
                <h2 className="mt-4 font-display text-3xl tracking-tight text-foreground sm:text-4xl">
                  Following a strategy
                </h2>
                <p className="mt-3 max-w-2xl text-[14.5px] leading-7 text-muted-foreground">
                  No platform copy fee. You keep the difference between your
                  allocation and any trader fee disclosed on their profile.
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              {COPY_FEE_TIERS.map((tier, i) => (
                <motion.div
                  key={tier.name}
                  initial={{ opacity: 0, y: 6 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{
                    duration: 0.35,
                    delay: i * 0.05,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className={`relative flex flex-col rounded-3xl border p-6 sm:p-8 ${
                    tier.featured
                      ? 'border-primary/30 bg-gradient-to-br from-primary/[0.06] via-background to-background'
                      : 'border-border/70 bg-card/40'
                  }`}
                >
                  {tier.featured && (
                    <span className="absolute right-6 top-6 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[10.5px] font-medium uppercase tracking-wide text-primary">
                      Most chosen
                    </span>
                  )}
                  <p className="font-display text-2xl tracking-tight text-foreground">
                    {tier.name}
                  </p>
                  <p className="mt-1 text-[13px] text-muted-foreground">
                    {tier.tagline}
                  </p>

                  <div className="mt-6 flex items-baseline gap-2">
                    <span className="font-display text-4xl tabular-nums text-foreground">
                      {tier.fee}
                    </span>
                    <span className="text-[12px] text-muted-foreground">
                      {tier.feeNote}
                    </span>
                  </div>

                  <ul className="mt-6 space-y-2.5 text-[13.5px]">
                    {tier.perks.map((perk) => (
                      <li key={perk} className="flex items-start gap-2.5">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                        <span className="text-foreground/85">{perk}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8 flex-1" />

                  <Button
                    asChild
                    variant={tier.featured ? 'default' : 'outline'}
                    className="h-11 w-full rounded-full"
                  >
                    <Link to={tier.cta.to}>
                      {tier.cta.label}
                      <ArrowUpRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Trading costs note */}
        <section className="border-t border-border/70 bg-secondary/30 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="grid gap-10 md:grid-cols-[.85fr_1.15fr] md:gap-16">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Trading costs
                </span>
                <h2 className="mt-4 font-display text-3xl leading-tight tracking-tight text-foreground sm:text-4xl">
                  Transparent when it matters.
                </h2>
              </div>
              <div className="space-y-4">
                <div className="rounded-2xl border border-border/70 bg-background p-5">
                  <div className="flex items-start gap-3">
                    <Coins className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Spreads and execution
                      </p>
                      <p className="mt-1 text-[13px] leading-6 text-muted-foreground">
                        Live execution is not connected yet. Illustrative spreads
                        are shown on the market board and will be replaced with
                        verified live spreads before trading opens.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-border/70 bg-background p-5">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Trader fees
                      </p>
                      <p className="mt-1 text-[13px] leading-6 text-muted-foreground">
                        If a trading expert charges a copy fee, it is disclosed on
                        their profile before you allocate. No fee is applied
                        without your confirmation.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-border/70 bg-background p-5">
                  <div className="flex items-start gap-3">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Currency
                      </p>
                      <p className="mt-1 text-[13px] leading-6 text-muted-foreground">
                        All account values are shown in USD. Funding and
                        withdrawals settle in the asset you choose, at the network
                        and address you select.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 sm:py-24">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-5 sm:px-8 md:flex-row md:items-end">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Next
              </span>
              <h2 className="mt-4 max-w-[22ch] font-display text-4xl leading-[1.05] tracking-tight text-foreground md:text-5xl">
                Open an account and see the numbers yourself.
              </h2>
              <p className="mt-4 max-w-xl text-[15px] leading-7 text-muted-foreground">
                Deposit fees, network fees and copy terms all appear before you
                confirm a transfer or an allocation.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:items-center">
              <Button size="lg" asChild className="h-12 rounded-full px-6">
                <Link to="/auth" search={{ mode: 'register' }}>
                  Open an account
                  <ArrowUpRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" asChild variant="outline" className="h-12 rounded-full px-6">
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
