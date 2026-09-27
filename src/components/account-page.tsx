import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpRight,
  ArrowRight,
  BadgeCheck,
  Bell,
  Check,
  CheckCircle2,
  Coins,
  CreditCard,
  Info,
  LayoutGrid,
  LifeBuoy,
  Loader2,
  Pause,
  Play,
  Receipt,
  ShieldCheck,
  Sparkles,
  Square,
  TrendingUp,
  User,
  Wallet,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WorkspaceShell } from './workspace-shell';
import { Empty, Status } from './status';
import { money, date } from '@/lib/format';
import { loadAccount } from '@/lib/account-data';
import { DepositExperience } from './deposit-experience';
import { supabase } from '@/integrations/supabase/client';

type Account = Awaited<ReturnType<typeof loadAccount>>;

type PageKey =
  | 'dashboard'
  | 'wallet'
  | 'deposit'
  | 'withdraw'
  | 'traders'
  | 'portfolio'
  | 'profile'
  | 'support'
  | 'notifications';

const TITLES: Record<PageKey, string> = {
  dashboard: 'Overview',
  wallet: 'Wallet',
  deposit: 'Add funds',
  withdraw: 'Withdraw funds',
  traders: 'Copy trading',
  portfolio: 'Portfolio',
  profile: 'Profile and security',
  support: 'Support',
  notifications: 'Notifications',
};

const SUBTITLES: Record<PageKey, string> = {
  dashboard: 'Your account at a glance.',
  wallet: 'Every movement, in order.',
  deposit: 'Report a payment for review.',
  withdraw: 'Manage your withdrawal requests.',
  traders: 'Follow a strategy that fits your view.',
  portfolio: 'Track your capital and allocations.',
  profile: 'Personal details and verification.',
  support: 'A direct line to our team.',
  notifications: 'Updates, all in one place.',
};

export function AccountPage({ page }: { page: PageKey }) {
  const [data, setData] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const result = await loadAccount();
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load your account');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const action = useCallback(
    async (fn: () => Promise<void>, text: string) => {
      setBusy(true);
      setError('');
      setSuccess('');
      try {
        await fn();
        setSuccess(text);
        await refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Request failed');
      } finally {
        setBusy(false);
      }
    },
    [refresh]
  );

  const greeting =
    page === 'dashboard' && data?.profile?.full_name
      ? `Good to see you, ${data.profile.full_name.split(' ')[0]}.`
      : TITLES[page];

  return (
    <WorkspaceShell title={greeting} subtitle={SUBTITLES[page]}>
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
          {success && (
            <motion.div
              key="ok"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              role="status"
              className="form-notice flex items-start gap-3"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              <span>{success}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <PageSkeleton page={page} />
        ) : !data ? (
          <Empty
            eyebrow="Unavailable"
            title="We could not load your account"
            body={error || 'Refresh the page to try again.'}
            icon={LifeBuoy}
            action={{ label: 'Reload', onClick: refresh }}
            secondaryAction={{ label: 'Contact support', href: '/support', variant: 'ghost' }}
          />
        ) : (
          <>
            {page === 'dashboard' && <DashboardPage data={data} />}
            {page === 'wallet' && <WalletPage data={data} />}
            {page === 'deposit' && (
              <DepositExperience data={data} busy={busy} action={action} />
            )}
            {page === 'withdraw' && (
              <WithdrawPage data={data} busy={busy} action={action} />
            )}
            {page === 'traders' && (
              <TradersPage data={data} busy={busy} action={action} />
            )}
            {page === 'portfolio' && <PortfolioPage data={data} />}
            {page === 'profile' && (
              <ProfilePage data={data} busy={busy} action={action} />
            )}
            {page === 'support' && (
              <SupportPage data={data} busy={busy} action={action} />
            )}
            {page === 'notifications' && (
              <NotificationsPage data={data} busy={busy} action={action} />
            )}
          </>
        )}
      </div>
    </WorkspaceShell>
  );
}

/* ================================================================
 * Shared primitives
 * ============================================================== */

function Metric({
  label,
  value,
  note,
  icon: Icon,
}: {
  label: string;
  value: string;
  note: string;
  icon?: React.ElementType;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/40 p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </span>
        {Icon && (
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>
      <strong className="mt-4 block truncate font-display text-3xl font-medium tabular-nums capitalize tracking-tight text-foreground">
        {value}
      </strong>
      <span className="mt-2 block text-xs text-muted-foreground">{note}</span>
    </div>
  );
}

function SectionHeader({ title, to }: { title: string; to?: string }) {
  return (
    <div className="mb-5 flex items-center justify-between gap-4">
      <h2 className="font-display text-xl tracking-tight text-foreground sm:text-2xl">
        {title}
      </h2>
      {to && (
        <Link
          to={to}
          className="group inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          View all
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

type RecordRow = {
  id: string;
  title: string;
  sub: string;
  amount: number;
  status: string;
  created?: string;
};

function RecordList({ rows }: { rows: RecordRow[] }) {
  if (!rows.length) {
    return (
      <Empty
        eyebrow="No activity"
        title="Nothing here yet"
        body="Records will appear here as soon as you make your first move."
        icon={Receipt}
        compact
      />
    );
  }
  return (
    <ul className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/70">
      {rows.map((x, i) => (
        <motion.li
          key={x.id}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: Math.min(i * 0.02, 0.12) }}
          className="flex flex-col gap-3 bg-background px-5 py-3.5 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <strong className="block truncate text-[13.5px] text-foreground">
              {x.title}
            </strong>
            <p className="mt-1 truncate text-[11.5px] text-muted-foreground">{x.sub}</p>
          </div>
          <div className="flex shrink-0 items-center gap-4 self-end sm:self-auto">
            <span
              className={`font-display text-[13.5px] tabular-nums ${
                x.amount < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-foreground'
              }`}
            >
              {x.amount < 0 ? '-' : '+'}
              {money(Math.abs(x.amount))}
            </span>
            <Status value={x.status} />
          </div>
        </motion.li>
      ))}
    </ul>
  );
}

function PageSkeleton({ page }: { page: PageKey }) {
  if (page === 'deposit') return null;
  if (page === 'traders' || page === 'portfolio') {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-64 animate-pulse rounded-2xl bg-secondary/60" />
        ))}
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="h-40 animate-pulse rounded-3xl bg-secondary/60" />
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-secondary/60" />
        ))}
      </div>
    </div>
  );
}

/* ================================================================
 * Dashboard
 * ============================================================== */

function DashboardPage({ data }: { data: Account }) {
  const balance = data.profile?.balance ?? 0;
  const kycVerified = data.profile?.kyc_status === 'verified';
  const activeAllocations = data.allocations.filter((x) => x.status === 'active').length;
  const pendingDeposits = data.deposits.filter((x) => x.status === 'pending').length;

  const activity: RecordRow[] = useMemo(
    () =>
      [
        ...data.deposits.map((x) => ({
          id: x.id,
          title: `${x.asset} deposit`,
          sub: date(x.created_at),
          amount: x.amount,
          status: x.status,
          created: x.created_at,
        })),
        ...data.withdrawals.map((x) => ({
          id: x.id,
          title: `${x.asset} withdrawal`,
          sub: date(x.created_at),
          amount: -x.amount,
          status: x.status,
          created: x.created_at,
        })),
      ]
        .sort((a, b) => b.created.localeCompare(a.created))
        .slice(0, 5),
    [data.deposits, data.withdrawals]
  );

  const nextStep = !kycVerified
    ? {
        eyebrow: 'Next step',
        title: 'Verify your identity',
        body: 'Verification unlocks deposits, withdrawals and copy trading.',
        to: '/profile',
        cta: 'Complete verification',
      }
    : balance > 0
      ? {
          eyebrow: 'Next step',
          title: 'Choose a trading expert',
          body: 'Your balance is ready. Follow a strategy and start copy trading.',
          to: '/traders',
          cta: 'Browse traders',
        }
      : {
          eyebrow: 'Next step',
          title: 'Add funds to your account',
          body: 'Once your deposit is verified, you can pick a strategy to follow.',
          to: '/deposit',
          cta: 'Make a deposit',
        };

  return (
    <div className="space-y-8">
      {/* Balance hero */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-secondary/60 via-background to-background p-6 sm:p-10"
      >
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Available balance
        </span>
        <p className="mt-4 font-display text-4xl tabular-nums tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          {money(balance)}
        </p>
        <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground">
          Verified funds available to allocate to a copy trading strategy.
        </p>
        <div className="mt-8 flex flex-wrap gap-2">
          <Button asChild className="h-10 rounded-full px-5">
            <Link to="/deposit">
              Deposit
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-10 rounded-full px-5">
            <Link to="/traders">
              Explore traders
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Metric rail */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Metric
          label="Active allocations"
          value={String(activeAllocations)}
          note="Strategies you follow"
          icon={TrendingUp}
        />
        <Metric
          label="Pending deposits"
          value={String(pendingDeposits)}
          note="Awaiting review"
          icon={Coins}
        />
        <Metric
          label="Verification"
          value={(data.profile?.kyc_status ?? 'not started').replaceAll('_', ' ')}
          note="Account standing"
          icon={ShieldCheck}
        />
      </div>

      {/* Activity + next step */}
      <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr]">
        <section>
          <SectionHeader title="Recent activity" to="/wallet" />
          <RecordList rows={activity} />
        </section>

        <aside className="rounded-2xl border border-primary/20 bg-primary/[0.04] p-6">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            {nextStep.eyebrow}
          </span>
          <h3 className="mt-4 font-display text-2xl tracking-tight text-foreground">
            {nextStep.title}
          </h3>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            {nextStep.body}
          </p>
          <Button asChild className="mt-6 h-10 rounded-full px-5">
            <Link to={nextStep.to}>
              {nextStep.cta}
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}

/* ================================================================
 * Wallet
 * ============================================================== */

function WalletPage({ data }: { data: Account }) {
  const balance = data.profile?.balance ?? 0;
  const pendingDeps = data.deposits
    .filter((x) => x.status === 'pending')
    .reduce((a, x) => a + x.amount, 0);
  const pendingWith = data.withdrawals
    .filter((x) => x.status === 'pending')
    .reduce((a, x) => a + x.amount, 0);

  const rows: RecordRow[] = useMemo(
    () =>
      [
        ...data.deposits.map((x) => ({
          id: x.id,
          title: `Deposit · ${x.asset} / ${x.network}`,
          sub: date(x.created_at),
          amount: x.amount,
          status: x.status,
          created: x.created_at,
        })),
        ...data.withdrawals.map((x) => ({
          id: x.id,
          title: `Withdrawal · ${x.asset} / ${x.network}`,
          sub: date(x.created_at),
          amount: -x.amount,
          status: x.status,
          created: x.created_at,
        })),
      ].sort((a, b) => b.created.localeCompare(a.created)),
    [data.deposits, data.withdrawals]
  );

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Metric
          label="Available balance"
          value={money(balance)}
          note="Ready to allocate"
          icon={Wallet}
        />
        <Metric
          label="Pending deposits"
          value={money(pendingDeps)}
          note="Awaiting verification"
          icon={Coins}
        />
        <Metric
          label="Pending withdrawals"
          value={money(pendingWith)}
          note="Under review"
          icon={CreditCard}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild className="h-10 rounded-full px-5">
          <Link to="/deposit">Deposit funds</Link>
        </Button>
        <Button asChild variant="outline" className="h-10 rounded-full px-5">
          <Link to="/withdraw">Withdraw</Link>
        </Button>
      </div>

      <section>
        <SectionHeader title="Transaction history" />
        <RecordList rows={rows} />
      </section>
    </div>
  );
}

/* ================================================================
 * Withdraw
 * ============================================================== */

function WithdrawPage({
  data,
  busy,
  action,
}: {
  data: Account;
  busy: boolean;
  action: (fn: () => Promise<void>, text: string) => Promise<void>;
}) {
  const balance = data.profile?.balance ?? 0;
  const [amount, setAmount] = useState('');
  const [network, setNetwork] = useState('TRC20');
  const [address, setAddress] = useState('');

  const amountNum = Number(amount);
  const valid =
    amount !== '' && amountNum >= 1 && amountNum <= balance && address.trim().length >= 8;

  return (
    <div className="space-y-8">
      <div className="notice-strip flex items-start gap-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
        <p>
          Withdrawals require verified identity and available balance. Requests are
          reviewed manually; live transfer processing is not connected.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(300px,.8fr)]">
        <form
          className="form-panel"
          onSubmit={(e) => {
            e.preventDefault();
            if (!valid) return;
            action(async () => {
              const { error } = await supabase.rpc('request_withdrawal', {
                _amount: amountNum,
                _network: network,
                _destination: address,
              } as never);
              if (error) throw error;
              setAmount('');
              setAddress('');
            }, 'Withdrawal request submitted. Your available balance has been reserved.');
          }}
        >
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Request withdrawal
          </span>
          <h2 className="mt-3 font-display text-2xl tracking-tight text-foreground">
            Withdraw funds
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Available: <span className="font-medium text-foreground">{money(balance)}</span>
          </p>

          <div className="mt-8 grid gap-5">
            <label className="field-label">
              Amount in USD
              <input
                className="field-input"
                type="number"
                min="1"
                max={balance}
                step="0.01"
                inputMode="decimal"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                disabled={busy}
              />
            </label>

            <label className="field-label">
              Network
              <select
                className="field-input"
                value={network}
                onChange={(e) => setNetwork(e.target.value)}
                disabled={busy}
              >
                <option>TRC20</option>
                <option>ERC20</option>
                <option>Bitcoin</option>
              </select>
            </label>

            <label className="field-label">
              Destination wallet address
              <input
                className="field-input font-mono text-[13px]"
                required
                minLength={8}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Paste your wallet address"
                disabled={busy}
              />
            </label>
          </div>

          <Button type="submit" disabled={busy || !valid} className="mt-8 h-11">
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting
              </>
            ) : (
              <>
                Request withdrawal
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <aside className="lg:border-l lg:border-border/60 lg:pl-8">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Before you continue
          </span>
          <h3 className="mt-4 font-display text-2xl tracking-tight text-foreground">
            Check every character.
          </h3>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            Crypto transfers may be irreversible. Confirm the receiving address and
            the network before submitting. Requests are reviewed manually and once
            approved, funds are reserved.
          </p>
          <div className="mt-6 rounded-xl border border-border/60 bg-secondary/40 p-4">
            <p className="text-xs leading-6 text-muted-foreground">
              Withdrawals to a different network than the one you select can result
              in permanent loss. If you are unsure, contact support first.
            </p>
          </div>
        </aside>
      </div>

      <section>
        <SectionHeader title="Withdrawal history" />
        <RecordList
          rows={data.withdrawals.map((x) => ({
            id: x.id,
            title: `${x.asset} · ${x.network}`,
            sub: date(x.created_at),
            amount: -x.amount,
            status: x.status,
          }))}
        />
      </section>
    </div>
  );
}

/* ================================================================
 * Traders
 * ============================================================== */

function TradersPage({
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

  return (
    <div className="space-y-8">
      <div className="notice-strip flex items-start gap-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
        <p>
          Trader profiles and returns are illustrative examples. No live market
          execution is connected. Capital is at risk.
        </p>
      </div>

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

      {data.traders.length === 0 ? (
        <Empty
          eyebrow="Marketplace opening"
          title="No trading experts published yet"
          body="New profiles will appear here as soon as they are reviewed."
          icon={BadgeCheck}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.traders.map((t) => {
            const isSelected = selected === t.id;
            return (
              <article
                key={t.id}
                className="group flex flex-col rounded-2xl border border-border/70 bg-background p-5 transition-colors hover:border-primary/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 font-display text-base font-medium text-primary">
                    {t.name
                      .split(' ')
                      .map((s) => s[0])
                      .join('')}
                  </div>
                  <span className="rounded-full border border-border/70 bg-muted/50 px-2.5 py-0.5 text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground">
                    {t.risk_level} risk
                  </span>
                </div>

                <h3 className="mt-5 font-display text-xl tracking-tight text-foreground">
                  {t.name}
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
                      {t.followers}
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
              </article>
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

      <section>
        <SectionHeader title="Your copy relationships" />
        {data.allocations.length === 0 ? (
          <Empty
            eyebrow="Not following anyone yet"
            title="No strategies followed"
            body="Browse the marketplace and choose a strategy that matches your view."
            icon={LayoutGrid}
            action={{ label: 'Browse traders', href: '/traders' }}
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

/* ================================================================
 * Portfolio
 * ============================================================== */

function PortfolioPage({ data }: { data: Account }) {
  const balance = data.profile?.balance ?? 0;
  const allocated = data.allocations
    .filter((x) => x.status !== 'stopped')
    .reduce((a, x) => a + x.amount, 0);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Metric
          label="Available balance"
          value={money(balance)}
          note="Unallocated"
          icon={Wallet}
        />
        <Metric
          label="Allocated capital"
          value={money(allocated)}
          note="Across copy strategies"
          icon={TrendingUp}
        />
        <Metric
          label="Total equity"
          value={money(balance + allocated)}
          note="Excludes unrealized trading results"
          icon
