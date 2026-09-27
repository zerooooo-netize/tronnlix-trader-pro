import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpRight,
  BadgeCheck,
  Check,
  ClipboardList,
  Coins,
  CreditCard,
  FileSearch,
  Gauge,
  Inbox,
  Loader2,
  Lock,
  Search,
  Settings2,
  ShieldCheck,
  Ticket,
  Users,
  Wallet,
  X,
  type LucideIcon,
} from 'lucide-react';
import { WorkspaceShell } from './workspace-shell';
import { Empty, Status } from './status';
import { Button } from '@/components/ui/button';
import { money, date } from '@/lib/format';
import { supabase } from '@/integrations/supabase/client';
import { CryptoWalletAdmin } from './crypto-wallet-admin';
import type { Database } from '@/integrations/supabase/types';

type Tables = Database['public']['Tables'];

type AdminData = {
  profiles: Tables['profiles']['Row'][];
  deposits: Tables['deposits']['Row'][];
  withdrawals: Tables['withdrawals']['Row'][];
  traders: Tables['traders']['Row'][];
  allocations: Tables['copy_allocations']['Row'][];
  verification: Tables['profiles']['Row'][];
  tickets: Tables['support_tickets']['Row'][];
  audit: Tables['audit_logs']['Row'][];
};

type AdminPageKey =
  | 'overview'
  | 'users'
  | 'deposits'
  | 'withdrawals'
  | 'verification'
  | 'traders'
  | 'support'
  | 'audit'
  | 'settings'
  | 'crypto';

const PAGE_META: Record<AdminPageKey, { title: string; blurb: string; icon: LucideIcon }> = {
  overview: {
    title: 'Overview',
    blurb: 'Deposits, reviews and platform activity at a glance.',
    icon: Gauge,
  },
  users: {
    title: 'People and accounts',
    blurb: 'Every registered client, their balance and verification state.',
    icon: Users,
  },
  deposits: {
    title: 'Deposit reviews',
    blurb: 'Verify each payment independently before confirming it.',
    icon: Wallet,
  },
  withdrawals: {
    title: 'Withdrawal reviews',
    blurb: 'Process only after the external payout has been confirmed.',
    icon: CreditCard,
  },
  verification: {
    title: 'Identity reviews',
    blurb: 'Manual review of every KYC submission.',
    icon: ShieldCheck,
  },
  traders: {
    title: 'Trading experts',
    blurb: 'Profiles, strategy summaries and reported performance.',
    icon: BadgeCheck,
  },
  support: {
    title: 'Support inbox',
    blurb: 'Client requests, replies and resolution status.',
    icon: Ticket,
  },
  audit: {
    title: 'Audit trail',
    blurb: 'Every operational action recorded in order.',
    icon: ClipboardList,
  },
  settings: {
    title: 'Platform settings',
    blurb: 'Theme, CMS, secrets and infrastructure controls.',
    icon: Settings2,
  },
  crypto: {
    title: 'Crypto destinations',
    blurb: 'Receiving wallets, networks and deposit limits.',
    icon: Coins,
  },
};

export function AdminPage({ page }: { page: AdminPageKey }) {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, d, w, t, a, v, s, l] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('deposits').select('*').order('created_at', { ascending: false }),
        supabase.from('withdrawals').select('*').order('created_at', { ascending: false }),
        supabase.from('traders').select('*').order('featured', { ascending: false }),
        supabase.from('copy_allocations').select('*'),
        supabase.from('profiles').select('*').eq('kyc_status', 'pending'),
        supabase.from('support_tickets').select('*').order('created_at', { ascending: false }),
        supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100),
      ]);
      const first = [p, d, w, t, a, v, s, l].find((x) => x.error);
      if (first?.error) throw first.error;
      setData({
        profiles: p.data ?? [],
        deposits: d.data ?? [],
        withdrawals: w.data ?? [],
        traders: t.data ?? [],
        allocations: a.data ?? [],
        verification: v.data ?? [],
        tickets: s.data ?? [],
        audit: l.data ?? [],
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const act = useCallback(
    async (run: () => PromiseLike<{ error: unknown }>, message: string) => {
      setBusy(true);
      setError('');
      setNotice('');
      try {
        const { error } = await run();
        if (error) throw error;
        setNotice(message);
        await load();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Action failed');
      } finally {
        setBusy(false);
      }
    },
    [load]
  );

  const meta = PAGE_META[page];

  return (
    <WorkspaceShell
      admin
      title={meta.title}
      subtitle="Operations / Tronnlix Trade"
      icon={meta.icon}
      blurb={meta.blurb}
    >
      <div className="space-y-6">
        <AnimatePresence>
          {error && (
            <motion.div
              key="err"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              role="alert"
              className="form-error flex items-start gap-3"
            >
              <X className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
          {notice && (
            <motion.div
              key="ok"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              role="status"
              className="form-notice flex items-start gap-3"
            >
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              <span>{notice}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <AdminSkeleton page={page} />
        ) : !data ? (
          <Empty
            eyebrow="Data unavailable"
            title="We could not load this page"
            body="Refresh the page to try again. If the problem persists, check the audit log."
            icon={FileSearch}
            action={{ label: 'Reload', onClick: load }}
          />
        ) : (
          <>
            {page === 'overview' && <OverviewPage data={data} />}
            {page === 'users' && <UsersPage data={data} />}
            {page === 'deposits' && (
              <ReviewQueuePage kind="deposits" rows={data.deposits} busy={busy} act={act} />
            )}
            {page === 'withdrawals' && (
              <ReviewQueuePage kind="withdrawals" rows={data.withdrawals} busy={busy} act={act} />
            )}
            {page === 'verification' && (
              <VerificationPage data={data} busy={busy} act={act} />
            )}
            {page === 'traders' && <TradersPage data={data} />}
            {page === 'support' && <SupportPage data={data} busy={busy} act={act} />}
            {page === 'audit' && <AuditPage data={data} />}
            {page === 'crypto' && <CryptoWalletAdmin />}
            {page === 'settings' && <SettingsPage />}
          </>
        )}
      </div>
    </WorkspaceShell>
  );
}

/* -----------------------------------------------------------------
 * Skeleton per page
 * --------------------------------------------------------------- */

function AdminSkeleton({ page }: { page: AdminPageKey }) {
  if (page === 'overview') {
    return (
      <div className="space-y-6">
        <div className="h-40 animate-pulse rounded-2xl bg-secondary/60" />
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-secondary/60" />
          ))}
        </div>
      </div>
    );
  }
  if (page === 'crypto') return null;
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-16 animate-pulse rounded-xl bg-secondary/60" />
      ))}
    </div>
  );
}

/* -----------------------------------------------------------------
 * Overview
 * --------------------------------------------------------------- */

function OverviewPage({ data }: { data: AdminData }) {
  const confirmedTotal = data.deposits
    .filter((x) => x.status === 'confirmed')
    .reduce((n, x) => n + x.amount, 0);
  const pendingDeposits = data.deposits.filter((x) => x.status === 'pending').length;
  const pendingWithdrawals = data.withdrawals.filter((x) => x.status === 'pending').length;
  const kycToReview = data.verification.length;

  const kpis = [
    { label: 'Clients', value: data.profiles.length, to: '/admin/users' },
    { label: 'Deposits to review', value: pendingDeposits, to: '/admin/deposits' },
    { label: 'Withdrawals to review', value: pendingWithdrawals, to: '/admin/withdrawals' },
    { label: 'KYC to review', value: kycToReview, to: '/admin/verification' },
  ] as const;

  const queues = [
    { label: 'Review deposits', to: '/admin/deposits', count: pendingDeposits },
    { label: 'Review withdrawals', to: '/admin/withdrawals', count: pendingWithdrawals },
    { label: 'Review verification', to: '/admin/verification', count: kycToReview },
  ] as const;

  return (
    <div className="space-y-8">
      {/* Hero metric */}
      <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-secondary/60 via-background to-background p-6 sm:p-10">
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Confirmed deposits
        </span>
        <p className="mt-4 font-display text-4xl tabular-nums tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          {money(confirmedTotal)}
        </p>
        <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground">
          Cumulative funding that has cleared independent verification. This is
          client capital, not platform revenue.
        </p>
        <div className="mt-8 flex flex-wrap gap-2">
          <Button asChild size="sm" className="h-9 rounded-full">
            <Link to="/admin/deposits">
              Open deposit queue
              <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="h-9 rounded-full">
            <Link to="/admin/audit">View audit log</Link>
          </Button>
        </div>
      </div>

      {/* KPI rail */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map(({ label, value, to }) => (
          <Link
            key={label}
            to={to}
            className="group rounded-2xl border border-border/70 bg-card/50 p-4 transition-colors hover:border-primary/40"
          >
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {label}
            </span>
            <p className="mt-3 font-display text-3xl tabular-nums tracking-tight text-foreground">
              {value}
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-[11px] text-muted-foreground transition-colors group-hover:text-primary">
              Open
              <ArrowUpRight className="h-3 w-3" />
            </span>
          </Link>
        ))}
      </div>

      {/* Queue cards */}
      <div className="grid gap-3 md:grid-cols-3">
        {queues.map(({ label, to, count }) => (
          <Link
            key={to}
            to={to}
            className="group flex items-center justify-between rounded-2xl border border-border/70 bg-card/40 p-5 transition-colors hover:border-primary/50"
          >
            <div>
              <p className="font-display text-lg tracking-tight text-foreground">{label}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {count === 0 ? 'Nothing waiting' : `${count} waiting`}
              </p>
            </div>
            <span className="grid h-9 w-9 place-items-center rounded-full border border-border/70 text-muted-foreground transition-colors group-hover:border-primary/40 group-hover:text-primary">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* -----------------------------------------------------------------
 * Users
 * --------------------------------------------------------------- */

function UsersPage({ data }: { data: AdminData }) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data.profiles;
    return data.profiles.filter((x) =>
      `${x.full_name ?? ''} ${x.id} ${x.country ?? ''}`.toLowerCase().includes(q)
    );
  }, [data.profiles, query]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className="field-input pl-9"
            placeholder="Search by name, ID or country"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <span className="text-xs text-muted-foreground">
          {filtered.length} of {data.profiles.length} accounts
        </span>
      </div>

      {filtered.length === 0 ? (
        <Empty
          eyebrow="No match"
          title="No accounts match your search"
          body="Try a different name, ID or country."
          icon={Search}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/70">
          <ul className="divide-y divide-border/60">
            {filtered.map((x) => (
              <li
                key={x.id}
                className="flex flex-col gap-3 bg-background px-5 py-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <strong className="truncate text-sm text-foreground">
                      {x.full_name || 'Unnamed account'}
                    </strong>
                    {x.country && (
                      <span className="rounded-full border border-border/70 bg-muted/50 px-2 py-0.5 text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground">
                        {x.country}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 truncate font-mono text-[11.5px] text-muted-foreground">
                    {x.id}
                    <span className="mx-1.5 text-border">·</span>
                    Joined {date(x.created_at)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-4 self-end sm:self-auto">
                  <span className="font-display text-sm tabular-nums text-foreground">
                    {money(x.balance)}
                  </span>
                  <Status value={x.kyc_status} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-xs leading-6 text-muted-foreground">
        Roles and balances are protected by database functions. The Super Admin
        account cannot be altered from the dashboard.
      </p>
    </div>
  );
}

/* -----------------------------------------------------------------
 * Deposits / Withdrawals review queue
 * --------------------------------------------------------------- */

type ReviewQueueProps = {
  kind: 'deposits' | 'withdrawals';
  rows: Tables['deposits']['Row'][] | Tables['withdrawals']['Row'][];
  busy: boolean;
  act: (fn: () => PromiseLike<{ error: unknown }>, message: string) => Promise<void>;
};

function ReviewQueuePage({ kind, rows, busy, act }: ReviewQueueProps) {
  const isDeposit = kind === 'deposits';
  const notice = isDeposit
    ? 'No automated wallet verification is connected. Do not confirm a deposit without independent payment verification.'
    : 'No transfer processor is connected. Mark complete only after a verified external payout; rejected funds are released back to the user.';

  const pending = rows.filter((x) => x.status === 'pending');
  const resolved = rows.filter((x) => x.status !== 'pending');

  return (
    <div className="space-y-6">
      <div className="notice-strip flex items-start gap-3">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
        <p>{notice}</p>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-lg tracking-tight text-foreground">
            Waiting for review
          </h3>
          <span className="text-xs text-muted-foreground">
            {pending.length === 0 ? 'Nothing waiting' : `${pending.length} pending`}
          </span>
        </div>

        {pending.length === 0 ? (
          <Empty
            eyebrow="Queue clear"
            title={isDeposit ? 'No deposits waiting' : 'No withdrawals waiting'}
            body="New requests will appear here as clients submit them."
            icon={isDeposit ? Wallet : CreditCard}
            compact
          />
        ) : (
          <ul className="space-y-3">
            {pending.map((x) => (
              <li
                key={x.id}
                className="rounded-2xl border border-border/70 bg-background p-5 transition-colors hover:border-primary/30"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display text-xl tabular-nums tracking-tight text-foreground">
                        {money(x.amount)}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {x.asset} on {x.network}
                      </span>
                    </div>
                    <p className="mt-2 break-all font-mono text-[11.5px] text-muted-foreground">
                      User {x.user_id}
                      <span className="mx-1.5 text-border">·</span>
                      {date(x.created_at)}
                    </p>
                    {'tx_reference' in x && x.tx_reference && (
                      <p className="mt-2 break-all font-mono text-[11.5px] text-muted-foreground">
                        Ref: {x.tx_reference}
                      </p>
                    )}
                    {'wallet_address' in x && x.wallet_address && (
                      <p className="mt-2 break-all font-mono text-[11.5px] text-muted-foreground">
                        Wallet: {x.wallet_address}
                      </p>
                    )}
                    {'destination' in x && x.destination && (
                      <p className="mt-2 break-all font-mono text-[11.5px] text-muted-foreground">
                        Destination: {x.destination}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-stretch">
                    <Button
                      size="sm"
                      disabled={busy}
                      aria-busy={busy}
                      onClick={() =>
                        act(
                          () =>
                            supabase.rpc(
                              isDeposit ? 'review_deposit' : 'review_withdrawal',
                              {
                                _id: x.id,
                                _status: isDeposit ? 'confirmed' : 'completed',
                              } as never
                            ),
                          isDeposit
                            ? 'Deposit confirmed. Guide the client toward copy trading next.'
                            : 'Withdrawal marked completed.'
                        )
                      }
                    >
                      {busy ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Check className="h-3.5 w-3.5" />
                      )}
                      {isDeposit ? 'Confirm' : 'Complete'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy}
                      onClick={() =>
                        act(
                          () =>
                            supabase.rpc(
                              isDeposit ? 'review_deposit' : 'review_withdrawal',
                              { _id: x.id, _status: 'rejected' } as never
                            ),
                          'Request rejected.'
                        )
                      }
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {resolved.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-lg tracking-tight text-foreground">
              Recently resolved
            </h3>
            <span className="text-xs text-muted-foreground">{resolved.length} entries</span>
          </div>
          <ul className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/70">
            {resolved.slice(0, 20).map((x) => (
              <li
                key={x.id}
                className="flex flex-col gap-3 bg-background px-5 py-3.5 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-[13.5px] text-foreground">
                    {money(x.amount)}{' '}
                    <span className="text-muted-foreground">
                      {x.asset} on {x.network}
                    </span>
                  </p>
                  <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">
                    {x.user_id}
                    <span className="mx-1.5 text-border">·</span>
                    {date(x.created_at)}
                  </p>
                </div>
                <Status value={x.status} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

/* -----------------------------------------------------------------
 * Verification
 * --------------------------------------------------------------- */

function VerificationPage({
  data,
  busy,
  act,
}: {
  data: AdminData;
  busy: boolean;
  act: (fn: () => PromiseLike<{ error: unknown }>, message: string) => Promise<void>;
}) {
  return (
    <div className="space-y-6">
      <div className="notice-strip flex items-start gap-3">
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
        <p>
          Document collection is not integrated. Do not approve an identity
          submission without an independent verified check.
        </p>
      </div>

      {data.verification.length === 0 ? (
        <Empty
          eyebrow="All clear"
          title="No identity reviews waiting"
          body="New KYC submissions will appear here as clients submit them."
          icon={ShieldCheck}
        />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {data.verification.map((x) => (
            <li
              key={x.id}
              className="flex flex-col rounded-2xl border border-border/70 bg-background p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <strong className="truncate text-sm text-foreground">
                    {x.full_name || 'Unnamed account'}
                  </strong>
                  <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">
                    {x.id}
                  </p>
                </div>
                <Status value={x.kyc_status} />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                {x.country || 'Country not provided'}
              </p>
              <div className="mt-5 flex gap-2">
                <Button
                  size="sm"
                  disabled={busy}
                  className="flex-1"
                  onClick={() =>
                    act(
                      () =>
                        supabase.rpc('review_kyc', {
                          _user_id: x.id,
                          _status: 'verified',
                        } as never),
                      'Identity marked verified.'
                    )
                  }
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  className="flex-1"
                  onClick={() =>
                    act(
                      () =>
                        supabase.rpc('review_kyc', {
                          _user_id: x.id,
                          _status: 'rejected',
                        } as never),
                      'Identity rejected.'
                    )
                  }
                >
                  Reject
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* -----------------------------------------------------------------
 * Traders
 * --------------------------------------------------------------- */

function TradersPage({ data }: { data: AdminData }) {
  return (
    <div className="space-y-6">
      <div className="notice-strip flex items-start gap-3">
        <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
        <p>
          Profiles and reported returns are illustrative. Live execution and
          independently verified performance are not connected.
        </p>
      </div>

      {data.traders.length === 0 ? (
        <Empty
          eyebrow="No profiles"
          title="No trading experts yet"
          body="Once you publish expert profiles, they will appear here."
          icon={BadgeCheck}
        />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {data.traders.map((x) => (
            <li
              key={x.id}
              className="rounded-2xl border border-border/70 bg-background p-5 transition-colors hover:border-primary/30"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <strong className="truncate text-sm text-foreground">{x.name}</strong>
                  <p className="mt-1 text-xs text-muted-foreground">{x.strategy}</p>
                </div>
                <span className="shrink-0 rounded-full border border-border/70 bg-muted/50 px-2 py-0.5 text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground">
                  {x.risk_level}
                </span>
              </div>
              <dl className="mt-5 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <dt className="text-muted-foreground">Followers</dt>
                  <dd className="mt-1 font-display text-lg tabular-nums text-foreground">
                    {x.followers}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">AUM</dt>
                  <dd className="mt-1 font-display text-lg tabular-nums text-foreground">
                    {money(x.aum)}
                  </dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-muted-foreground">
        Trader editing is not available until execution data and review
        workflows are connected.
      </p>
    </div>
  );
}

/* -----------------------------------------------------------------
 * Support
 * --------------------------------------------------------------- */

function SupportPage({
  data,
  busy,
  act,
}: {
  data: AdminData;
  busy: boolean;
  act: (fn: () => PromiseLike<{ error: unknown }>, message: string) => Promise<void>;
}) {
  const [reply, setReply] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<'open' | 'resolved' | 'all'>('open');

  const rows = useMemo(() => {
    if (filter === 'all') return data.tickets;
    return data.tickets.filter((t) =>
      filter === 'open' ? t.status !== 'resolved' : t.status === 'resolved'
    );
  }, [data.tickets, filter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        {(['open', 'resolved', 'all'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium capitalize transition-colors ${
              filter === f
                ? 'border-primary/40 bg-primary/10 text-primary'
                : 'border-border/70 text-muted-foreground hover:text-foreground'
            }`}
          >
            {f}
          </button>
        ))}
        <span className="ml-auto text-xs text-muted-foreground">
          {rows.length} {rows.length === 1 ? 'request' : 'requests'}
        </span>
      </div>

      {rows.length === 0 ? (
        <Empty
          eyebrow={filter === 'open' ? 'Inbox clear' : 'Nothing here'}
          title={filter === 'open' ? 'No open requests' : 'No resolved requests yet'}
          body="Requests from clients will appear here as they come in."
          icon={Inbox}
        />
      ) : (
        <ul className="space-y-4">
          {rows.map((x) => (
            <li
              key={x.id}
              className="rounded-2xl border border-border/70 bg-background p-5 sm:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <strong className="text-sm text-foreground">{x.subject}</strong>
                  <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">
                    User {x.user_id}
                    <span className="mx-1.5 text-border">·</span>
                    {date(x.created_at)}
                  </p>
                </div>
                <Status value={x.status} />
              </div>

              <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-foreground/90">
                {x.message}
              </p>

              {x.reply && (
                <div className="mt-5 rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                    Your reply
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-foreground/90">
                    {x.reply}
                  </p>
                </div>
              )}

              {x.status !== 'resolved' && (
                <form
                  className="mt-5 space-y-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    act(async () => {
                      const { error } = await supabase
                        .from('support_tickets')
                        .update({ reply: reply[x.id] ?? '', status: 'resolved' })
                        .eq('id', x.id);
                      if (error) return { error };
                      const { error: notificationError } = await supabase
                        .from('notifications')
                        .insert({
                          user_id: x.user_id,
                          title: 'Support replied',
                          message: `Your request "${x.subject}" has a response.`,
                        });
                      return { error: notificationError };
                    }, 'Reply sent and ticket resolved.');
                  }}
                >
                  <textarea
                    className="field-input min-h-24"
                    required
                    value={reply[x.id] ?? ''}
                    onChange={(e) => setReply({ ...reply, [x.id]: e.target.value })}
                    placeholder="Write a clear response. Plain language works best."
                  />
                  <div className="flex justify-end">
                    <Button size="sm" disabled={busy} aria-busy={busy}>
                      {busy ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Check className="h-3.5 w-3.5" />
                      )}
                      Send reply and resolve
                    </Button>
                  </div>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* -----------------------------------------------------------------
 * Audit
 * --------------------------------------------------------------- */

function AuditPage({ data }: { data: AdminData }) {
  if (data.audit.length === 0) {
    return (
      <Empty
        eyebrow="No entries"
        title="No audit events yet"
        body="Operational actions will be recorded here in order."
        icon={ClipboardList}
      />
    );
  }

  return (
    <ol className="relative space-y-1 border-l border-border/60 pl-5">
      {data.audit.map((x) => (
        <li key={x.id} className="relative py-3">
          <span
            aria-hidden="true"
            className="absolute -left-[26px] top-5 h-2 w-2 rounded-full bg-primary/70"
          />
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm font-medium capitalize text-foreground">
              {x.action.replaceAll('_', ' ')}
            </p>
            <span className="text-[11px] text-muted-foreground">
              {date(x.created_at)}
            </span>
          </div>
          <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">
            {x.entity_type}
            {x.entity_id ? ` · ${x.entity_id}` : ''}
          </p>
        </li>
      ))}
    </ol>
  );
}

/* -----------------------------------------------------------------
 * Settings
 * --------------------------------------------------------------- */

function SettingsPage() {
  const items = [
    {
      icon: Settings2,
      title: 'Theme builder',
      body: 'Colors, fonts, radius, charts and status tokens are managed by the Super Admin theme system.',
    },
    {
      icon: Lock,
      title: 'Secrets and provider keys',
      body: 'Resend, TronGrid and blockchain monitoring keys live in the secure server environment, never in a client form.',
    },
    {
      icon: FileSearch,
      title: 'Infrastructure and backups',
      body: 'Backups, environment variables and database status are handled at the platform layer.',
    },
    {
      icon: ShieldCheck,
      title: 'Security center',
      body: 'Maintenance mode, API keys and security controls are audited every time they change.',
    },
  ] as const;

  return (
    <div className="max-w-3xl space-y-4">
      <div className="rounded-2xl border border-border/70 bg-card/50 p-6">
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Super Admin only
        </span>
        <h2 className="mt-3 font-display text-2xl tracking-tight text-foreground">
          Platform configuration
        </h2>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          These controls are protected by dedicated, audited infrastructure.
          Non-functional toggles are not exposed in the dashboard. Manage
          secrets through the secure server environment.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {items.map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="rounded-2xl border border-border/70 bg-background p-5"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-4.5 w-4.5" />
            </span>
            <p className="mt-4 text-sm font-medium text-foreground">{title}</p>
            <p className="mt-1 text-xs leading-6 text-muted-foreground">{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
