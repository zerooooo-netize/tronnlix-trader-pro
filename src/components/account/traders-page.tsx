import { useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  LayoutGrid,
  Pause,
  Play,
  Search,
  ShieldCheck,
  Sparkles,
  Square,
  Star,
  Users,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Empty, Status } from '@/components/status';
import { money, date } from '@/lib/format';
import { supabase } from '@/integrations/supabase/client';
import type { loadAccount } from '@/lib/account-data';

type Account = Awaited<ReturnType<typeof loadAccount>>;

type RiskFilter = 'all' | 'low' | 'medium' | 'high';
type SortOption = 'featured' | 'roi' | 'followers' | 'name';

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function formatRisk(risk: string) {
  return `${risk.charAt(0).toUpperCase()}${risk.slice(1)} risk`;
}

export function TradersPage({
  data,
  busy,
  action,
}: {
  data: Account;
  busy: boolean;
  action: (fn: () => Promise<void>, text: string) => Promise<void>;
}) {
  const reduceMotion = useReducedMotion();

  const balance = data.profile?.balance ?? 0;
  const kycVerified = data.profile?.kyc_status === 'verified';
  const eligible = kycVerified && balance > 0;

  const [selected, setSelected] = useState('');
  const [amount, setAmount] = useState('');
  const [risk, setRisk] = useState<RiskFilter>('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortOption>('featured');

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const result = data.traders.filter((trader) => {
      if (risk !== 'all' && trader.risk_level !== risk) return false;

      if (
        normalizedQuery &&
        !trader.name.toLowerCase().includes(normalizedQuery) &&
        !trader.strategy.toLowerCase().includes(normalizedQuery)
      ) {
        return false;
      }

      return true;
    });

    return [...result].sort((a, b) => {
      if (sort === 'featured') {
        if (a.featured !== b.featured) {
          return a.featured ? -1 : 1;
        }

        return Number(b.roi_12m) - Number(a.roi_12m);
      }

      if (sort === 'roi') {
        return Number(b.roi_12m) - Number(a.roi_12m);
      }

      if (sort === 'followers') {
        return Number(b.followers) - Number(a.followers);
      }

      return a.name.localeCompare(b.name);
    });
  }, [data.traders, query, risk, sort]);

  const activeAllocations = data.allocations.filter(
    (allocation) => allocation.status === 'active',
  ).length;

  return (
    <div className="space-y-8 pb-10">
      {/* Marketplace header */}
      <header className="relative overflow-hidden rounded-3xl border border-border/70 bg-background px-5 py-7 sm:px-7 lg:px-9 lg:py-9">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-primary/5 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Copy trading marketplace
            </div>

            <h1 className="mt-4 max-w-2xl font-display text-3xl tracking-[-0.035em] text-foreground sm:text-4xl lg:text-[2.7rem]">
              Follow strategies with context, not guesswork.
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:text-[15px]">
              Explore trading experts, compare performance and risk, then
              decide how much capital you want to allocate.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div className="min-w-[130px] rounded-2xl border border-border/70 bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CircleDollarSign className="h-4 w-4" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em]">
                  Available
                </span>
              </div>
              <p className="mt-3 font-display text-xl tabular-nums text-foreground">
                {money(balance)}
              </p>
            </div>

            <div className="min-w-[130px] rounded-2xl border border-border/70 bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em]">
                  Following
                </span>
              </div>
              <p className="mt-3 font-display text-xl tabular-nums text-foreground">
                {activeAllocations}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <section className="space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search traders or strategies"
              aria-label="Search traders or strategies"
              className="h-10 w-full rounded-xl border border-border/70 bg-background pl-10 pr-3 text-[13px] text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap gap-1.5 rounded-xl border border-border/70 bg-muted/20 p-1">
              {(['all', 'low', 'medium', 'high'] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRisk(value)}
                  className={`rounded-lg px-3 py-1.5 text-[11px] font-medium transition ${
                    risk === value
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {value === 'all' ? 'All' : formatRisk(value)}
                </button>
              ))}
            </div>

            <label className="relative">
              <span className="sr-only">Sort traders</span>
              <select
                value={sort}
                onChange={(event) =>
                  setSort(event.target.value as SortOption)
                }
                className="h-10 appearance-none rounded-xl border border-border/70 bg-background pl-3 pr-9 text-[12px] font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
              >
                <option value="featured">Featured</option>
                <option value="roi">Highest ROI</option>
                <option value="followers">Most followed</option>
                <option value="name">Name</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? 'strategy' : 'strategies'}{' '}
            available
          </p>

          {query || risk !== 'all' ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setRisk('all');
              }}
              className="text-xs font-medium text-primary hover:underline"
            >
              Clear filters
            </button>
          ) : null}
        </div>
      </section>

      {/* Marketplace */}
      {data.traders.length === 0 ? (
        <Empty
          eyebrow="Marketplace opening"
          title="No trading experts published yet"
          body="New profiles will appear here as soon as they are reviewed."
          icon={BadgeCheck}
        />
      ) : filtered.length === 0 ? (
        <Empty
          eyebrow="No match"
          title="No traders match your filters"
          body="Try a different search or risk level."
          icon={Sparkles}
          action={{
            label: 'Clear filters',
            onClick: () => {
              setQuery('');
              setRisk('all');
            },
          }}
          compact
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((trader, index) => {
            const isSelected = selected === trader.id;

            return (
              <motion.article
                key={trader.id}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={
                  reduceMotion
                    ? undefined
                    : {
                        duration: 0.35,
                        delay: Math.min(index * 0.045, 0.25),
                        ease: [0.22, 1, 0.36, 1],
                      }
                }
                className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-background transition-all ${
                  isSelected
                    ? 'border-primary/50 shadow-[0_0_0_3px_hsl(var(--primary)/0.06)]'
                    : 'border-border/70 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-black/[0.03]'
                }`}
              >
                {trader.featured && (
                  <div className="absolute right-0 top-0 flex items-center gap-1 rounded-bl-xl border-b border-l border-primary/10 bg-primary/[0.06] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-primary">
                    <Star className="h-3 w-3 fill-current" />
                    Featured
                  </div>
                )}

                <div className="p-5 sm:p-6">
                  {/* Trader identity */}
                  <div className="flex items-start gap-3">
                    <div className="relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent font-display text-sm font-semibold text-primary ring-1 ring-primary/10">
                      {initials(trader.name)}

                      {trader.featured && (
                        <span className="absolute -bottom-1 -right-1 grid h-4 w-4 place-items-center rounded-full border-2 border-background bg-primary text-primary-foreground">
                          <BadgeCheck className="h-2.5 w-2.5" />
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 pr-16">
                      <h2 className="flex items-center gap-1.5 truncate font-display text-lg tracking-tight text-foreground">
                        {trader.name}
                      </h2>

                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {trader.strategy}
                      </p>
                    </div>
                  </div>

                  {/* Performance */}
                  <div className="mt-6 rounded-2xl border border-border/60 bg-muted/[0.18] p-4">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          12 month return
                        </p>
                        <p className="mt-1 font-display text-2xl tracking-tight tabular-nums text-emerald-600 dark:text-emerald-400">
                          +{trader.roi_12m}%
                        </p>
                      </div>

                      <div className="flex h-9 w-16 items-end gap-1 opacity-60">
                        {[38, 46, 41, 56, 51, 68, 63, 76, 72].map(
                          (height, barIndex) => (
                            <span
                              key={barIndex}
                              className="w-1.5 rounded-full bg-primary/60"
                              style={{ height: `${height}%` }}
                            />
                          ),
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Metrics */}
                  <dl className="mt-5 grid grid-cols-3 divide-x divide-border/60">
                    <div className="pr-3">
                      <dt className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        Risk
                      </dt>
                      <dd className="mt-1.5 text-xs font-medium capitalize text-foreground">
                        {trader.risk_level}
                      </dd>
                    </div>

                    <div className="px-3">
                      <dt className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        Followers
                      </dt>
                      <dd className="mt-1.5 text-xs font-medium tabular-nums text-foreground">
                        {Number(trader.followers).toLocaleString()}
                      </dd>
                    </div>

                    <div className="pl-3">
                      <dt className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        Strategy
                      </dt>
                      <dd className="mt-1.5 truncate text-xs font-medium text-foreground">
                        {trader.risk_level === 'low'
                          ? 'Defensive'
                          : trader.risk_level === 'high'
                            ? 'Aggressive'
                            : 'Balanced'}
                      </dd>
                    </div>
                  </dl>

                  {/* Allocation */}
                  {isSelected ? (
                    <form
                      className="mt-6 rounded-2xl border border-primary/20 bg-primary/[0.025] p-4"
                      onSubmit={(event) => {
                        event.preventDefault();

                        const numericAmount = Number(amount);

                        if (
                          !Number.isFinite(numericAmount) ||
                          numericAmount <= 0 ||
                          numericAmount > balance
                        ) {
                          return;
                        }

                        action(async () => {
                          const { error } = await supabase.rpc(
                            'allocate_copy',
                            {
                              _trader_id: trader.id,
                              _amount: numericAmount,
                            } as never,
                          );

                          if (error) throw error;

                          setSelected('');
                          setAmount('');
                        }, 'Allocation created. Live trade execution is not connected.');
                      }}
                    >
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-foreground">
                          Allocate to {trader.name}
                        </p>
                        <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                          Available balance: {money(balance)}
                        </p>
                      </div>

                      <label className="field-label">
                        Amount in USD
                        <input
                          className="field-input"
                          type="number"
                          min="1"
                          max={balance}
                          step="0.01"
                          value={amount}
                          onChange={(event) => setAmount(event.target.value)}
                          placeholder="0.00"
                          required
                          disabled={busy}
                        />
                      </label>

                      <div className="mt-3 flex gap-2">
                        <Button
                          type="submit"
                          disabled={busy || !balance}
                          className="flex-1"
                        >
                          Confirm allocation
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => {
                            setSelected('');
                            setAmount('');
                          }}
                          disabled={busy}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <Button
                      variant="outline"
                      className="mt-6 w-full"
                      disabled={!eligible}
                      onClick={() => {
                        setSelected(trader.id);
                        setAmount('');
                      }}
                    >
                      Copy trader
                      <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </motion.article>
            );
          })}
        </div>
      )}

      {/* Eligibility */}
      {!eligible && data.traders.length > 0 && (
        <div className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-muted/[0.18] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-background ring-1 ring-border/70">
              <ShieldCheck className="h-4 w-4 text-primary" />
            </div>

            <div>
              <p className="text-sm font-medium text-foreground">
                Complete your account before allocating
              </p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Verification and an available balance are required to start a
                copy relationship.
              </p>
            </div>
          </div>

          <Link
            to="/profile"
            className="shrink-0 text-sm font-semibold text-primary hover:underline"
          >
            Review profile
          </Link>
        </div>
      )}

      {/* Current relationships */}
      <section>
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Portfolio
            </span>

            <h2 className="mt-2 font-display text-xl tracking-tight text-foreground sm:text-2xl">
              Your copy relationships
            </h2>
          </div>

          {data.allocations.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {data.allocations.length}{' '}
              {data.allocations.length === 1
                ? 'relationship'
                : 'relationships'}
            </span>
          )}
        </div>

        {data.allocations.length === 0 ? (
          <Empty
            eyebrow="Not following anyone yet"
            title="No strategies followed"
            body="Browse the marketplace and choose a strategy that matches your objectives and risk tolerance."
            icon={LayoutGrid}
            compact
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border/70">
            <ul className="divide-y divide-border/60">
              {data.allocations.map((allocation) => (
                <li
                  key={allocation.id}
                  className="flex flex-col gap-4 bg-background p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 font-display text-xs font-semibold text-primary">
                      {initials(allocation.traders?.name ?? 'Trader')}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <strong className="truncate text-[13.5px] text-foreground">
                          {allocation.traders?.name ?? 'Trader'}
                        </strong>

                        <Status value={allocation.status} />
                      </div>

                      <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                        <span>{money(allocation.amount)} allocated</span>
                        <span className="text-border">·</span>
                        <Clock3 className="h-3 w-3" />
                        <span>{date(allocation.created_at)}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    {allocation.status !== 'stopped' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busy}
                          onClick={() =>
                            action(async () => {
                              const { error } = await supabase.rpc(
                                'set_copy_status',
                                {
                                  _id: allocation.id,
                                  _status:
                                    allocation.status === 'active'
                                      ? 'paused'
                                      : 'active',
                                } as never,
                              );

                              if (error) throw error;
                            }, 'Allocation updated.')
                          }
                        >
                          {allocation.status === 'active' ? (
                            <>
                              <Pause className="h-3.5 w-3.5" />
                              Pause
                            </>
                          ) : (
                            <>
                              <Play className="h-3.5 w-3.5" />
                              Resume
                            </>
                          )}
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={busy}
                          onClick={() =>
                            action(async () => {
                              const { error } = await supabase.rpc(
                                'set_copy_status',
                                {
                                  _id: allocation.id,
                                  _status: 'stopped',
                                } as never,
                              );

                              if (error) throw error;
                            },
                            'Allocation stopped and principal returned to available balance.')
                          }
                        >
                          <Square className="h-3.5 w-3.5" />
                          Stop
                        </Button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Context note */}
      <div className="flex items-start gap-3 border-t border-border/60 pt-6 text-[11px] leading-5 text-muted-foreground">
        <BarChart3 className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Historical returns and follower counts are strategy profile
          statistics. They do not guarantee future performance. Live trade
          execution is not connected in this interface.
        </p>
      </div>
    </div>
  );
}
