import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
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

type PageMeta = {
  title: string;
  description: string;
  icon: LucideIcon;
};

const PAGE_META: Record<AdminPageKey, PageMeta> = {
  overview: {
    title: 'Overview',
    description: 'Deposits, reviews and platform activity at a glance.',
    icon: Gauge,
  },
  users: {
    title: 'People and accounts',
    description: 'Review registered clients, balances and verification status.',
    icon: Users,
  },
  deposits: {
    title: 'Deposit reviews',
    description: 'Review payment requests before confirming client funds.',
    icon: Wallet,
  },
  withdrawals: {
    title: 'Withdrawal reviews',
    description: 'Review withdrawal requests before completing external payouts.',
    icon: CreditCard,
  },
  verification: {
    title: 'Identity reviews',
    description: 'Review pending identity verification submissions.',
    icon: ShieldCheck,
  },
  traders: {
    title: 'Trading experts',
    description: 'Review strategy profiles and reported marketplace metrics.',
    icon: BadgeCheck,
  },
  support: {
    title: 'Support inbox',
    description: 'Manage client requests, responses and resolution status.',
    icon: Ticket,
  },
  audit: {
    title: 'Audit trail',
    description: 'Review operational actions recorded by the platform.',
    icon: ClipboardList,
  },
  settings: {
    title: 'Platform settings',
    description: 'Super Admin controls for platform configuration.',
    icon: Settings2,
  },
  crypto: {
    title: 'Crypto destinations',
    description: 'Manage receiving wallets, networks and deposit settings.',
    icon: Coins,
  },
};

export function AdminPage({ page }: { page: AdminPageKey }) {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const reduceMotion = useReducedMotion();

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [
        profilesResult,
        depositsResult,
        withdrawalsResult,
        tradersResult,
        allocationsResult,
        verificationResult,
        ticketsResult,
        auditResult,
      ] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false }),

        supabase
          .from('deposits')
          .select('*')
          .order('created_at', { ascending: false }),

        supabase
          .from('withdrawals')
          .select('*')
          .order('created_at', { ascending: false }),

        supabase
          .from('traders')
          .select('*')
          .order('featured', { ascending: false }),

        supabase
          .from('copy_allocations')
          .select('*'),

        supabase
          .from('profiles')
          .select('*')
          .eq('kyc_status', 'pending'),

        supabase
          .from('support_tickets')
          .select('*')
          .order('created_at', { ascending: false }),

        supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100),
      ]);

      const results = [
        profilesResult,
        depositsResult,
        withdrawalsResult,
        tradersResult,
        allocationsResult,
        verificationResult,
        ticketsResult,
        auditResult,
      ];

      const failed = results.find((result) => result.error);

      if (failed?.error) {
        throw failed.error;
      }

      setData({
        profiles: profilesResult.data ?? [],
        deposits: depositsResult.data ?? [],
        withdrawals: withdrawalsResult.data ?? [],
        traders: tradersResult.data ?? [],
        allocations: allocationsResult.data ?? [],
        verification: verificationResult.data ?? [],
        tickets: ticketsResult.data ?? [],
        audit: auditResult.data ?? [],
      });
    } catch (errorValue) {
      setError(
        errorValue instanceof Error
          ? errorValue.message
          : 'Could not load administration data.'
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!notice) return;

    const timer = window.setTimeout(() => {
      setNotice('');
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [notice]);

  const act = useCallback(
    async (
      run: () => PromiseLike<{ error: unknown }>,
      message: string
    ) => {
      if (busy) return;

      setBusy(true);
      setError('');
      setNotice('');

      try {
        const result = await run();

        if (result.error) {
          throw result.error;
        }

        setNotice(message);
        await load();
      } catch (errorValue) {
        setError(
          errorValue instanceof Error
            ? errorValue.message
            : 'The action could not be completed.'
        );
      } finally {
        setBusy(false);
      }
    },
    [busy, load]
  );

  const meta = PAGE_META[page];

  return (
    <WorkspaceShell
      admin
      title={meta.title}
      subtitle={meta.description}
    >
      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              key="admin-error"
              initial={reduceMotion ? false : { opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
              role="alert"
              className="flex items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3.5 text-sm text-destructive"
            >
              <X className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="leading-6">{error}</span>
            </motion.div>
          )}

          {notice && (
            <motion.div
              key="admin-notice"
              initial={reduceMotion ? false : { opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
              role="status"
              className="flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3.5 text-sm text-foreground"
            >
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              <span className="leading-6">{notice}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <AdminSkeleton page={page} />
        ) : !data ? (
          <Empty
            eyebrow="Data unavailable"
            title="We could not load this workspace"
            body="Try again. If the problem continues, review the system audit trail and Supabase logs."
            icon={FileSearch}
            action={{
              label: 'Reload',
              onClick: load,
            }}
          />
        ) : (
          <>
            {page === 'overview' && <OverviewPage data={data} />}

            {page === 'users' && <UsersPage data={data} />}

            {page === 'deposits' && (
              <ReviewQueuePage
                kind="deposits"
                rows={data.deposits}
                busy={busy}
                act={act}
              />
            )}

            {page === 'withdrawals' && (
              <ReviewQueuePage
                kind="withdrawals"
                rows={data.withdrawals}
                busy={busy}
                act={act}
              />
            )}

            {page === 'verification' && (
              <VerificationPage
                data={data}
                busy={busy}
                act={act}
              />
            )}

            {page === 'traders' && (
              <TradersPage data={data} />
            )}

            {page === 'support' && (
              <SupportPage
                data={data}
                busy={busy}
                act={act}
              />
            )}

            {page === 'audit' && (
              <AuditPage data={data} />
            )}

            {page === 'crypto' && (
              <CryptoWalletAdmin />
            )}

            {page === 'settings' && (
              <SettingsPage />
            )}
          </>
        )}
      </div>
    </WorkspaceShell>
  );
}

/* -----------------------------------------------------------------
 * Skeleton
 * ---------------------------------------------------------------- */

function AdminSkeleton({
  page,
}: {
  page: AdminPageKey;
}) {
  if (page === 'crypto') {
    return (
      <div className="space-y-4">
        <div className="h-32 animate-pulse rounded-2xl bg-secondary/60" />
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-2xl bg-secondary/60"
            />
          ))}
        </div>
      </div>
    );
  }

  if (page === 'overview') {
    return (
      <div className="space-y-6">
        <div className="h-48 animate-pulse rounded-3xl bg-secondary/60" />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-2xl bg-secondary/60"
            />
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-2xl bg-secondary/60"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: 7 }).map((_, index) => (
        <div
          key={index}
          className="h-20 animate-pulse rounded-2xl bg-secondary/60"
        />
      ))}
    </div>
  );
}

/* -----------------------------------------------------------------
 * Overview
 * ---------------------------------------------------------------- */

function OverviewPage({
  data,
}: {
  data: AdminData;
}) {
  const confirmedTotal = data.deposits
    .filter((row) => row.status === 'confirmed')
    .reduce((total, row) => total + Number(row.amount || 0), 0);

  const pendingDeposits = data.deposits.filter(
    (row) => row.status === 'pending'
  ).length;

  const pendingWithdrawals = data.withdrawals.filter(
    (row) => row.status === 'pending'
  ).length;

  const kycToReview = data.verification.length;

  const openTickets = data.tickets.filter(
    (row) => row.status !== 'resolved'
  ).length;

  const activeAllocations = data.allocations.filter(
    (row) => row.status === 'active'
  ).length;

  const kpis = [
    {
      label: 'Clients',
      value: data.profiles.length,
      to: '/admin/users',
    },
    {
      label: 'Deposits to review',
      value: pendingDeposits,
      to: '/admin/deposits',
    },
    {
      label: 'Withdrawals to review',
      value: pendingWithdrawals,
      to: '/admin/withdrawals',
    },
    {
      label: 'KYC to review',
      value: kycToReview,
      to: '/admin/verification',
    },
  ] as const;

  const queues = [
    {
      label: 'Deposit queue',
      body:
        pendingDeposits === 0
          ? 'Nothing waiting'
          : `${pendingDeposits} request${pendingDeposits === 1 ? '' : 's'} waiting`,
      to: '/admin/deposits',
    },
    {
      label: 'Withdrawal queue',
      body:
        pendingWithdrawals === 0
          ? 'Nothing waiting'
          : `${pendingWithdrawals} request${pendingWithdrawals === 1 ? '' : 's'} waiting`,
      to: '/admin/withdrawals',
    },
    {
      label: 'Verification queue',
      body:
        kycToReview === 0
          ? 'Nothing waiting'
          : `${kycToReview} submission${kycToReview === 1 ? '' : 's'} waiting`,
      to: '/admin/verification',
    },
  ] as const;

  return (
    <div className="space-y-8">
      {/* Primary metric */}
      <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-secondary/60 via-background to-background p-6 sm:p-8 lg:p-10">
        <div
          aria-hidden="true"
          className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-primary/10 blur-3xl"
        />

        <div className="relative">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/10 text-primary">
              <Wallet className="h-3.5 w-3.5" />
            </span>

            <span className="text-[10.5px] font-semibold uppercase tracking-[0.16em]">
              Confirmed deposits
            </span>
          </div>

          <p className="mt-5 font-display text-4xl tabular-nums tracking-tight text-foreground sm:text-5xl">
            {money(confirmedTotal)}
          </p>

          <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
            Cumulative deposits currently marked confirmed in the platform.
            This figure represents client funding records and is not platform
            revenue.
          </p>

          <div className="mt-7 flex flex-wrap gap-2">
            <Button
              asChild
              size="sm"
              className="h-9 rounded-full"
            >
              <Link to="/admin/deposits">
                Open deposit queue
                <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>

            <Button
              asChild
              size="sm"
              variant="outline"
              className="h-9 rounded-full"
            >
              <Link to="/admin/audit">
                View audit trail
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* KPIs */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map(({ label, value, to }) => (
          <Link
            key={label}
            to={to}
            className="group rounded-2xl border border-border/70 bg-card/50 p-4 transition-colors hover:border-primary/40 hover:bg-card"
          >
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
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
      </section>

      {/* Operational snapshot */}
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Snapshot
          label="Open support"
          value={openTickets}
          icon={Ticket}
        />

        <Snapshot
          label="Active allocations"
          value={activeAllocations}
          icon={ChartIcon}
        />

        <Snapshot
          label="Published experts"
          value={data.traders.length}
          icon={BadgeCheck}
        />

        <Snapshot
          label="Audit events loaded"
          value={data.audit.length}
          icon={ClipboardList}
        />
      </section>

      {/* Queues */}
      <section>
        <div className="mb-3">
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Operational queues
          </span>

          <h2 className="mt-2 font-display text-xl tracking-tight text-foreground">
            What needs attention
          </h2>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {queues.map(({ label, body, to }) => (
            <Link
              key={to}
              to={to}
              className="group flex items-center justify-between rounded-2xl border border-border/70 bg-card/40 p-5 transition-colors hover:border-primary/40 hover:bg-card"
            >
              <div>
                <p className="font-display text-lg tracking-tight text-foreground">
                  {label}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {body}
                </p>
              </div>

              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border/70 text-muted-foreground transition-colors group-hover:border-primary/40 group-hover:text-primary">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function Snapshot({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </span>

        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>

      <p className="mt-4 font-display text-2xl tabular-nums tracking-tight text-foreground">
        {value}
      </p>
    </div>
  );
}

function ChartIcon(props: React.ComponentProps<typeof ChartNoAxesCombined>) {
  return <ChartNoAxesCombined {...props} />;
}

/* -----------------------------------------------------------------
 * Users
 * ---------------------------------------------------------------- */

function UsersPage({
  data,
}: {
  data: AdminData;
}) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) {
      return data.profiles;
    }

    return data.profiles.filter((profile) =>
      `${profile.full_name ?? ''} ${profile.id} ${profile.country ?? ''}`
        .toLowerCase()
        .includes(search)
    );
  }, [data.profiles, query]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <input
            className="field-input pl-9"
            placeholder="Search by name, ID or country"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search user accounts"
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
          body="Try a different name, account ID or country."
          icon={Search}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/70">
          <ul className="divide-y divide-border/60">
            {filtered.map((profile) => (
              <li
                key={profile.id}
                className="flex flex-col gap-4 bg-background px-5 py-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="truncate text-sm text-foreground">
                      {profile.full_name || 'Unnamed account'}
                    </strong>

                    {profile.country && (
                      <span className="rounded-full border border-border/70 bg-muted/50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        {profile.country}
                      </span>
                    )}
                  </div>

                  <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">
                    {profile.id}
                    <span className="mx-1.5 text-border">·</span>
                    Joined {date(profile.created_at)}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-4">
                  <span className="font-display text-sm tabular-nums text-foreground">
                    {money(profile.balance)}
                  </span>

                  <Status value={profile.kyc_status} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-xs leading-6 text-muted-foreground">
        This workspace is an operational view. Database policies and
        authorization functions remain the source of truth for permissions.
      </p>
    </div>
  );
}

/* -----------------------------------------------------------------
 * Deposit / withdrawal review queues
 * ---------------------------------------------------------------- */

type ReviewQueueProps = {
  kind: 'deposits' | 'withdrawals';
  rows:
    | Tables['deposits']['Row'][]
    | Tables['withdrawals']['Row'][];
  busy: boolean;
  act: (
    fn: () => PromiseLike<{ error: unknown }>,
    message: string
  ) => Promise<void>;
};

function ReviewQueuePage({
  kind,
  rows,
  busy,
  act,
}: ReviewQueueProps) {
  const isDeposit = kind === 'deposits';

  const pending = rows.filter(
    (row) => row.status === 'pending'
  );

  const resolved = rows.filter(
    (row) => row.status !== 'pending'
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 px-4 py-3.5">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />

        <p className="text-sm leading-6 text-muted-foreground">
          {isDeposit
            ? 'Confirm a deposit only after independently verifying the payment reference and receiving wallet record.'
            : 'Complete a withdrawal only after the external payout has been independently verified.'}
        </p>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Queue
            </span>

            <h2 className="mt-1 font-display text-xl tracking-tight text-foreground">
              Waiting for review
            </h2>
          </div>

          <span className="text-xs text-muted-foreground">
            {pending.length === 0
              ? 'Nothing waiting'
              : `${pending.length} pending`}
          </span>
        </div>

        {pending.length === 0 ? (
          <Empty
            eyebrow="Queue clear"
            title={
              isDeposit
                ? 'No deposits waiting'
                : 'No withdrawals waiting'
            }
            body="New requests will appear here when clients submit them."
            icon={isDeposit ? Wallet : CreditCard}
            compact
          />
        ) : (
          <ul className="space-y-3">
            {pending.map((row) => (
              <li
                key={row.id}
                className="rounded-2xl border border-border/70 bg-background p-5"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display text-2xl tabular-nums tracking-tight text-foreground">
                        {money(row.amount)}
                      </p>

                      <span className="text-xs text-muted-foreground">
                        {row.asset} on {row.network}
                      </span>
                    </div>

                    <p className="mt-2 break-all font-mono text-[11px] text-muted-foreground">
                      User {row.user_id}
                      <span className="mx-1.5 text-border">·</span>
                      {date(row.created_at)}
                    </p>

                    {'tx_reference' in row &&
                      row.tx_reference && (
                        <p className="mt-2 break-all font-mono text-[11px] text-muted-foreground">
                          Reference: {row.tx_reference}
                        </p>
                      )}

                    {'wallet_address' in row &&
                      row.wallet_address && (
                        <p className="mt-2 break-all font-mono text-[11px] text-muted-foreground">
                          Wallet: {row.wallet_address}
                        </p>
                      )}

                    {'destination' in row &&
                      row.destination && (
                        <p className="mt-2 break-all font-mono text-[11px] text-muted-foreground">
                          Destination: {row.destination}
                        </p>
                      )}
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2 lg:w-32 lg:flex-col">
                    <Button
                      size="sm"
                      disabled={busy}
                      aria-busy={busy}
                      onClick={() =>
                        act(
                          () =>
                            supabase.rpc(
                              isDeposit
                                ? 'review_deposit'
                                : 'review_withdrawal',
                              {
                                _id: row.id,
                                _status: isDeposit
                                  ? 'confirmed'
                                  : 'completed',
                              } as never
                            ),
                          isDeposit
                            ? 'Deposit confirmed.'
                            : 'Withdrawal marked completed.'
                        )
                      }
                    >
                      {busy ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Check className="h-3.5 w-3.5" />
                      )}

                      {isDeposit
                        ? 'Confirm'
                        : 'Complete'}
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy}
                      onClick={() =>
                        act(
                          () =>
                            supabase.rpc(
                              isDeposit
                                ? 'review_deposit'
                                : 'review_withdrawal',
                              {
                                _id: row.id,
                                _status: 'rejected',
                              } as never
                            ),
                          isDeposit
                            ? 'Deposit rejected.'
                            : 'Withdrawal rejected.'
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
            <div>
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                History
              </span>

              <h2 className="mt-1 font-display text-xl tracking-tight text-foreground">
                Recently resolved
              </h2>
            </div>

            <span className="text-xs text-muted-foreground">
              {resolved.length} entries
            </span>
          </div>

          <ul className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/70">
            {resolved.slice(0, 20).map((row) => (
              <li
                key={row.id}
                className="flex flex-col gap-3 bg-background px-5 py-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-sm text-foreground">
                    {money(row.amount)}
                    <span className="text-muted-foreground">
                      {' '}
                      {row.asset} on {row.network}
                    </span>
                  </p>

                  <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">
                    {row.user_id}
                    <span className="mx-1.5 text-border">·</span>
                    {date(row.created_at)}
                  </p>
                </div>

                <Status value={row.status} />
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
 * ---------------------------------------------------------------- */

function VerificationPage({
  data,
  busy,
  act,
}: {
  data: AdminData;
  busy: boolean;
  act: (
    fn: () => PromiseLike<{ error: unknown }>,
    message: string
  ) => Promise<void>;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 px-4 py-3.5">
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />

        <p className="text-sm leading-6 text-muted-foreground">
          Identity approval should only happen after the required documents
          and checks have been independently reviewed.
        </p>
      </div>

      {data.verification.length === 0 ? (
        <Empty
          eyebrow="All clear"
          title="No identity reviews waiting"
          body="New pending KYC submissions will appear here."
          icon={ShieldCheck}
        />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {data.verification.map((profile) => (
            <li
              key={profile.id}
              className="flex flex-col rounded-2xl border border-border/70 bg-background p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <strong className="truncate text-sm text-foreground">
                    {profile.full_name || 'Unnamed account'}
                  </strong>

                  <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">
                    {profile.id}
                  </p>
                </div>

                <Status value={profile.kyc_status} />
              </div>

              <p className="mt-3 text-xs text-muted-foreground">
                {profile.country || 'Country not provided'}
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
                          _user_id: profile.id,
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
                          _user_id: profile.id,
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
 * ---------------------------------------------------------------- */

function TradersPage({
  data,
}: {
  data: AdminData;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 px-4 py-3.5">
        <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />

        <p className="text-sm leading-6 text-muted-foreground">
          Marketplace metrics are only as reliable as the underlying
          execution and reporting source. Do not present illustrative
          performance as verified live trading results.
        </p>
      </div>

      {data.traders.length === 0 ? (
        <Empty
          eyebrow="No profiles"
          title="No trading experts yet"
          body="Published expert profiles will appear here."
          icon={BadgeCheck}
        />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {data.traders.map((trader) => (
            <li
              key={trader.id}
              className="rounded-2xl border border-border/70 bg-background p-5 transition-colors hover:border-primary/30"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <strong className="truncate text-sm text-foreground">
                    {trader.name}
                  </strong>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {trader.strategy}
                  </p>
                </div>

                <span className="shrink-0 rounded-full border border-border/70 bg-muted/50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {trader.risk_level}
                </span>
              </div>

              <dl className="mt-5 grid grid-cols-2 gap-3">
                <div>
                  <dt className="text-[11px] text-muted-foreground">
                    Followers
                  </dt>

                  <dd className="mt-1 font-display text-lg tabular-nums text-foreground">
                    {trader.followers}
                  </dd>
                </div>

                <div>
                  <dt className="text-[11px] text-muted-foreground">
                    Reported AUM
                  </dt>

                  <dd className="mt-1 font-display text-lg tabular-nums text-foreground">
                    {money(trader.aum)}
                  </dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* -----------------------------------------------------------------
 * Support
 * ---------------------------------------------------------------- */

function SupportPage({
  data,
  busy,
  act,
}: {
  data: AdminData;
  busy: boolean;
  act: (
    fn: () => PromiseLike<{ error: unknown }>,
    message: string
  ) => Promise<void>;
}) {
  const [reply, setReply] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<
    'open' | 'resolved' | 'all'
  >('open');

  const rows = useMemo(() => {
    if (filter === 'all') {
      return data.tickets;
    }

    return data.tickets.filter((ticket) =>
      filter === 'open'
        ? ticket.status !== 'resolved'
        : ticket.status === 'resolved'
    );
  }, [data.tickets, filter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        {(['open', 'resolved', 'all'] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium capitalize transition-colors ${
              filter === value
                ? 'border-primary/40 bg-primary/10 text-primary'
                : 'border-border/70 text-muted-foreground hover:text-foreground'
            }`}
          >
            {value}
          </button>
        ))}

        <span className="ml-auto text-xs text-muted-foreground">
          {rows.length}{' '}
          {rows.length === 1 ? 'request' : 'requests'}
        </span>
      </div>

      {rows.length === 0 ? (
        <Empty
          eyebrow={filter === 'open' ? 'Inbox clear' : 'Nothing here'}
          title={
            filter === 'open'
              ? 'No open requests'
              : 'No requests in this view'
          }
          body="Client support requests will appear here."
          icon={Inbox}
        />
      ) : (
        <ul className="space-y-4">
          {rows.map((ticket) => (
            <li
              key={ticket.id}
              className="rounded-2xl border border-border/70 bg-background p-5 sm:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <strong className="text-sm text-foreground">
                    {ticket.subject}
                  </strong>

                  <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">
                    User {ticket.user_id}
                    <span className="mx-1.5 text-border">·</span>
                    {date(ticket.created_at)}
                  </p>
                </div>

                <Status value={ticket.status} />
              </div>

              <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-foreground/90">
                {ticket.message}
              </p>

              {ticket.reply && (
                <div className="mt-5 rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-primary">
                    Previous reply
                  </p>

                  <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-foreground/90">
                    {ticket.reply}
                  </p>
                </div>
              )}

              {ticket.status !== 'resolved' && (
                <form
                  className="mt-5 space-y-3"
                  onSubmit={(event) => {
                    event.preventDefault();

                    act(
                      async () => {
                        const text =
                          reply[ticket.id]?.trim() ?? '';

                        if (!text) {
                          return {
                            error: new Error(
                              'Write a reply before resolving the ticket.'
                            ),
                          };
                        }

                        const updateResult =
                          await supabase
                            .from('support_tickets')
                            .update({
                              reply: text,
                              status: 'resolved',
                            })
                            .eq('id', ticket.id);

                        if (updateResult.error) {
                          return {
                            error: updateResult.error,
                          };
                        }

                        /*
                         * Notification delivery is intentionally separate.
                         * If the notification table is unavailable, the
                         * ticket should not be falsely reported as failed
                         * after the support reply itself was saved.
                         */
                        const notificationResult =
                          await supabase
                            .from('notifications')
                            .insert({
                              user_id: ticket.user_id,
                              title: 'Support replied',
                              message: `Your request "${ticket.subject}" has a response.`,
                            });

                        if (notificationResult.error) {
                          return {
                            error: null,
                          };
                        }

                        return {
                          error: null,
                        };
                      },
                      'Reply sent and ticket resolved.'
                    );
                  }}
                >
                  <textarea
                    className="field-input min-h-24"
                    required
                    value={reply[ticket.id] ?? ''}
                    onChange={(event) =>
                      setReply((current) => ({
                        ...current,
                        [ticket.id]: event.target.value,
                      }))
                    }
                    placeholder="Write a clear response."
                  />

                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      disabled={busy}
                      aria-busy={busy}
                    >
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
 * ---------------------------------------------------------------- */

function AuditPage({
  data,
}: {
  data: AdminData;
}) {
  if (data.audit.length === 0) {
    return (
      <Empty
        eyebrow="No entries"
        title="No audit events yet"
        body="Operational actions will be recorded here as they occur."
        icon={ClipboardList}
      />
    );
  }

  return (
    <div className="rounded-2xl border border-border/70 bg-background p-5 sm:p-6">
      <ol className="relative space-y-1 border-l border-border/60 pl-6">
        {data.audit.map((entry) => (
          <li
            key={entry.id}
            className="relative py-3"
          >
            <span
              aria-hidden="true"
              className="absolute -left-[29px] top-5 h-2 w-2 rounded-full bg-primary/70 ring-4 ring-background"
            />

            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm font-medium capitalize text-foreground">
                {entry.action.replaceAll('_', ' ')}
              </p>

              <span className="text-[11px] text-muted-foreground">
                {date(entry.created_at)}
              </span>
            </div>

            <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">
              {entry.entity_type}
              {entry.entity_id
                ? ` · ${entry.entity_id}`
                : ''}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* -----------------------------------------------------------------
 * Crypto
 * ---------------------------------------------------------------- */

function CryptoPageNote() {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 px-4 py-3.5">
      <Coins className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />

      <p className="text-sm leading-6 text-muted-foreground">
        Receiving wallet configuration should be treated as financial
        infrastructure. Changes should be audited and protected by
        server-side authorization.
      </p>
    </div>
  );
}

/* -----------------------------------------------------------------
 * Settings
 * ---------------------------------------------------------------- */

function SettingsPage() {
  const items = [
    {
      icon: Settings2,
      title: 'Theme builder',
      body: 'Manage colors, typography, surfaces, radius, charts, status tokens and visual system settings.',
    },
    {
      icon: Lock,
      title: 'Secrets and provider keys',
      body: 'Resend, TronGrid and other provider credentials belong in secure server-side environment configuration.',
    },
    {
      icon: FileSearch,
      title: 'Infrastructure and backups',
      body: 'Database status, backups and environment configuration should be handled at the platform layer.',
    },
    {
      icon: ShieldCheck,
      title: 'Security center',
      body: 'Security-sensitive configuration changes should require appropriate authorization and create audit records.',
    },
  ] as const;

  return (
    <div className="max-w-4xl space-y-5">
      <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-secondary/60 via-background to-background p-6 sm:p-8">
        <div
          aria-hidden="true"
          className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl"
        />

        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
            <ShieldCheck className="h-3 w-3" />
            Super Admin
          </span>

          <h2 className="mt-5 font-display text-2xl tracking-tight text-foreground sm:text-3xl">
            Platform configuration
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
            High-impact platform controls should remain explicit, auditable
            and server-authorized. Secrets should never be exposed through
            client-side settings forms.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {items.map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="rounded-2xl border border-border/70 bg-background p-5 transition-colors hover:border-primary/25"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-4 w-4" />
            </span>

            <p className="mt-4 text-sm font-medium text-foreground">
              {title}
            </p>

            <p className="mt-2 text-xs leading-6 text-muted-foreground">
              {body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
