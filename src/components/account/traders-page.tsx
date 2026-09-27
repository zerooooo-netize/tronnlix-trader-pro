import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  BadgeCheck,
  LayoutGrid,
  Pause,
  Play,
  Sparkles,
  Square,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Empty, Status } from '@/components/status';
import { money, date } from '@/lib/format';
import { supabase } from '@/integrations/supabase/client';
import type { loadAccount } from '@/lib/account-data';

type Account = Awaited<ReturnType<typeof loadAccount>>;

export function TradersPage({
  data,
  busy,
  action,
}: {
  data: Account;
  busy: boolean;
  action: (fn: () => Promise<void>, text: string) => Promise<void>;
}) {
  const balance = data.profile?.balance ?? 0;
  const kycVerified = data.profile?.kyc_status === 'verified';
  const eligible = kycVerified && balance > 0;

  const [selected, setSelected] = useState('');
  const [amount, setAmount] = useState('');
  const [risk, setRisk] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [query, setQuery] = useState('');

  const filtered = data.traders.filter((t) => {
    if (risk !== 'all' && t.risk_level !== risk) return false;
    if (query && !t.name.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Discover strategies
          </span>
          <h2 className="mt-3 font-display text-2xl tracking-tight text-foreground">
            Trading experts
          </h2>
        </div>
        <span className="text-sm text-muted-foreground">
          Available to allocate:{' '}
          <span className="font-medium text-foreground">{money(balance)}</span>
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name"
          className="h-9 w-full max-w-xs rounded-full border border-border/70 bg-background/60 px-3 text-[13px] text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <div className="flex flex-wrap items-center gap-1.5">
          {(['all', 'low', 'medium', 'high'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRisk(r)}
              className={`rounded-full border px-3 py-1.5 text-[12px] font-medium capitalize transition-colors ${
                risk === r
                  ? 'border-primary/40 bg-primary/10 text-primary'
                  : 'border-border/70 text-muted-foreground hover:text-foreground'
              }`}
            >
              {r === 'all' ? 'All risk' : `${r} risk`}
            </button>
          ))}
        </div>
      </div>

      {/* Trader grid */}
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
          body="Try a different risk level or clear your search."
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
          {filtered.map((t, i) => {
            const isSelected = selected === t.id;
            return (
              <motion.article
                key={t.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: Math.min(i * 0.04, 0.2),
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="group flex flex-col rounded-2xl border border-border/70 bg-background p-5 transition-colors hover:border-primary/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 font-display text-base font-medium text-primary">
                    {t.name
                      .split(' ')
                      .map((s) => s[0])
                      .join('')}
                  </div>
                  <span className="shrink-0 rounded-full border border-border/70 bg-muted/50 px-2.5 py-0.5 text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground">
                    {t.risk_level} risk
                  </span>
                </div>

                <h3 className="mt-5 flex items-center gap-1.5 font-display text-xl tracking-tight text-foreground">
                  {t.name}
                  {t.featured && (
                    <Star
                      className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                      aria-label="Featured"
                    />
                  )}
                </h3>
                <p className="mt-2 min-h-[2.5rem] text-[13px] leading-6 text-muted-foreground">
                  {t.strategy}
                </p>

                <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-border/60 pt-4">
                  <div>
                    <dt className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      12m ROI
                    </dt>
                    <dd className="mt-1 font-display text-lg tabular-nums text-emerald-600 dark:text-emerald-400">
                      +{t.roi_12m}%
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Followers
                    </dt>
                    <dd className="mt-1 font-display text-lg tabular-nums text-foreground">
                      {Number(t.followers).toLocaleString()}
                    </dd>
                  </div>
                </dl>

                <div className="mt-5 flex-1" />

                {isSelected ? (
                  <form
                    className="mt-4 grid gap-3"
                    onSubmit={(e) => {
                      e.preventDefault();
                      action(async () => {
                        const { error } = await supabase.rpc('allocate_copy', {
                          _trader_id: t.id,
                          _amount: Number(amount),
                        } as never);
                        if (error) throw error;
                        setSelected('');
                        setAmount('');
                      }, 'Allocation created. Live trade execution is not connected.');
                    }}
                  >
                    <label className="field-label">
                      Amount in USD
                      <input
                        className="field-input"
                        type="number"
                        min="1"
                        max={balance}
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                        disabled={busy}
                      />
                    </label>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={busy || !balance} className="flex-1">
                        Confirm allocation
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setSelected('')}
                        disabled={busy}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <Button
                    variant="outline"
                    className="mt-4 w-full"
                    disabled={!eligible}
                    onClick={() => setSelected(t.id)}
                  >
                    Copy trader
                    <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                )}
              </motion.article>
            );
          })}
        </div>
      )}

      {!eligible && (
        <p className="text-sm text-muted-foreground">
          To allocate, complete verification and keep an available balance.{' '}
          <Link to="/profile" className="font-semibold text-primary hover:underline">
            Go to profile
          </Link>
          .
        </p>
      )}

      {/* Current copy relationships */}
      <section>
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="font-display text-xl tracking-tight text-foreground sm:text-2xl">
            Your copy relationships
          </h2>
        </div>

        {data.allocations.length === 0 ? (
          <Empty
            eyebrow="Not following anyone yet"
            title="No strategies followed"
            body="Browse the marketplace and choose a strategy that matches your view."
            icon={LayoutGrid}
            compact
          />
        ) : (
          <ul className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/70">
            {data.allocations.map((x) => (
              <li
                key={x.id}
                className="flex flex-col gap-3 bg-background px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <strong className="truncate text-[13.5px] text-foreground">
                    {x.traders?.name ?? 'Trader'}
                  </strong>
                  <p className="mt-1 text-[11.5px] text-muted-foreground">
                    {money(x.amount)} allocated
                    <span className="mx-1.5 text-border">·</span>
                    {date(x.created_at)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Status value={x.status} />
                  {x.status !== 'stopped' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busy}
                        onClick={() =>
                          action(async () => {
                            const { error } = await supabase.rpc('set_copy_status', {
                              _id: x.id,
                              _status: x.status === 'active' ? 'paused' : 'active',
                            } as never);
                            if (error) throw error;
                          }, 'Allocation updated.')
                        }
                      >
                        {x.status === 'active' ? (
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
                            const { error } = await supabase.rpc('set_copy_status', {
                              _id: x.id,
                              _status: 'stopped',
                            } as never);
                            if (error) throw error;
                          }, 'Allocation stopped and principal returned to available balance.')
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
        )}
      </section>
    </div>
  );
}
