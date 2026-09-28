import { useEffect, useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Clock3,
  ShieldCheck,
  Wallet,
  TrendingUp,
  Users,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { WorkspaceShell } from './workspace-shell';
import { Empty, Status } from './status';
import { money, date } from '@/lib/format';
import { loadAccount } from '@/lib/account-data';
import { DepositExperience } from './deposit-experience';
import { TradersPage } from './account/traders-page';
import { supabase } from '@/integrations/supabase/client';

type Account = Awaited<ReturnType<typeof loadAccount>>;

type AccountPageName =
  | 'dashboard'
  | 'wallet'
  | 'deposit'
  | 'withdraw'
  | 'traders'
  | 'portfolio'
  | 'profile'
  | 'support'
  | 'notifications';

export function AccountPage({
  page,
}: {
  page: AccountPageName;
}) {
  const [data, setData] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);

  const [amount, setAmount] = useState('');
  const [network, setNetwork] = useState('TRC20');
  const [address, setAddress] = useState('');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  async function refresh() {
    setLoading(true);
    setError('');

    try {
      const result = await loadAccount();

      setData(result);
      setName(result.profile?.full_name ?? '');
      setPhone(result.profile?.phone ?? '');
      setCountry(result.profile?.country ?? '');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not load your account.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function action(
    fn: () => Promise<void>,
    text: string,
  ) {
    setBusy(true);
    setError('');
    setSuccess('');

    try {
      await fn();
      setSuccess(text);
      await refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.',
      );
    } finally {
      setBusy(false);
    }
  }

  const titles: Record<AccountPageName, string> = {
    dashboard: 'Your workspace',
    wallet: 'Your wallet',
    deposit: 'Add funds',
    withdraw: 'Withdraw funds',
    traders: 'Copy trading',
    portfolio: 'Your portfolio',
    profile: 'Profile & security',
    support: 'Support',
    notifications: 'Notifications',
  };

  const subtitles: Record<AccountPageName, string> = {
    dashboard: 'Everything important, in one view.',
    wallet: 'A clear record of your account movements.',
    deposit: 'Fund your account and track verification.',
    withdraw: 'Manage withdrawal requests and status.',
    traders: 'Compare strategies before choosing an allocation.',
    portfolio: 'Monitor your allocations and account activity.',
    profile: 'Manage your details and verification.',
    support: 'Get help with your Tronnlix Trade account.',
    notifications: 'Account updates and important activity.',
  };

  const balance = data?.profile?.balance ?? 0;

  const activeAllocations =
    data?.allocations.filter((x) => x.status === 'active').length ?? 0;

  const allocatedCapital =
    data?.allocations
      .filter((x) => x.status !== 'stopped')
      .reduce((total, x) => total + x.amount, 0) ?? 0;

  const pendingDeposits =
    data?.deposits.filter((x) => x.status === 'pending').length ?? 0;

  const pendingWithdrawals =
    data?.withdrawals.filter((x) => x.status === 'pending').length ?? 0;

  const unreadNotifications =
    data?.notifications.filter((x) => !x.read_at).length ?? 0;

  const recentActivity = useMemo(() => {
    if (!data) return [];

    return [
      ...data.deposits.map((x) => ({
        id: `deposit-${x.id}`,
        title: `${x.asset} deposit`,
        sub: date(x.created_at),
        amount: x.amount,
        status: x.status,
        created: x.created_at,
      })),
      ...data.withdrawals.map((x) => ({
        id: `withdrawal-${x.id}`,
        title: `${x.asset} withdrawal`,
        sub: date(x.created_at),
        amount: -x.amount,
        status: x.status,
        created: x.created_at,
      })),
    ]
      .sort((a, b) => b.created.localeCompare(a.created))
      .slice(0, 6);
  }, [data]);

  return (
    <WorkspaceShell
      title={
        page === 'dashboard' && data?.profile?.full_name
          ? `Good to see you, ${data.profile.full_name.split(' ')[0]}.`
          : titles[page]
      }
      subtitle={subtitles[page]}
    >
      {loading ? (
        <AccountSkeleton />
      ) : !data ? (
        <Empty
          title="Unable to load your account"
          body={error || 'Please refresh and try again.'}
          action={{
            label: 'Try again',
            onClick: () => void refresh(),
          }}
        />
      ) : (
        <>
          {error && (
            <div
              role="alert"
              aria-live="assertive"
              className="form-error mb-5"
            >
              {error}
            </div>
          )}

          {success && (
            <div
              role="status"
              aria-live="polite"
              className="form-notice mb-5"
            >
              {success}
            </div>
          )}

          {page === 'dashboard' && (
            <DashboardView
              data={data}
              balance={balance}
              activeAllocations={activeAllocations}
              allocatedCapital={allocatedCapital}
              pendingDeposits={pendingDeposits}
              recentActivity={recentActivity}
            />
          )}

          {page === 'wallet' && (
            <WalletView
              data={data}
              balance={balance}
              pendingDeposits={pendingDeposits}
              pendingWithdrawals={pendingWithdrawals}
            />
          )}

          {page === 'deposit' && (
            <DepositExperience
              data={data}
              busy={busy}
              action={action}
            />
          )}

          {page === 'withdraw' && (
            <WithdrawView
              data={data}
              balance={balance}
              amount={amount}
              setAmount={setAmount}
              network={network}
              setNetwork={setNetwork}
              address={address}
              setAddress={setAddress}
              busy={busy}
              action={action}
            />
          )}

          {page === 'traders' && (
            <TradersPage
              data={data}
              busy={busy}
              action={action}
            />
          )}

          {page === 'portfolio' && (
            <PortfolioView
              data={data}
              balance={balance}
              allocatedCapital={allocatedCapital}
            />
          )}

          {page === 'profile' && (
            <ProfileView
              data={data}
              name={name}
              setName={setName}
              phone={phone}
              setPhone={setPhone}
              country={country}
              setCountry={setCountry}
              busy={busy}
              action={action}
            />
          )}

          {page === 'support' && (
            <SupportView
              data={data}
              subject={subject}
              setSubject={setSubject}
              message={message}
              setMessage={setMessage}
              busy={busy}
              action={action}
            />
          )}

          {page === 'notifications' && (
            <NotificationsView
              data={data}
              unreadNotifications={unreadNotifications}
              busy={busy}
              action={action}
            />
          )}
        </>
      )}
    </WorkspaceShell>
  );
}

/* -------------------------------------------------------------------------- */
/* Dashboard                                                                   */
/* -------------------------------------------------------------------------- */

function DashboardView({
  data,
  balance,
  activeAllocations,
  allocatedCapital,
  pendingDeposits,
  recentActivity,
}: {
  data: Account;
  balance: number;
  activeAllocations: number;
  allocatedCapital: number;
  pendingDeposits: number;
  recentActivity: {
    id: string;
    title: string;
    sub: string;
    amount: number;
    status: string;
    created: string;
  }[];
}) {
  const kycVerified = data.profile?.kyc_status === 'verified';

  const nextStep = !kycVerified
    ? {
        eyebrow: 'Account setup',
        title: 'Complete your verification.',
        body: 'Submit your details for review before allocating funds.',
        to: '/profile' as const,
        label: 'Complete profile',
      }
    : balance > 0
      ? {
          eyebrow: 'Next step',
          title: 'Explore strategies.',
          body: 'Compare trading approaches, risk levels and historical returns before choosing an allocation.',
          to: '/traders' as const,
          label: 'Explore traders',
        }
      : {
          eyebrow: 'Next step',
          title: 'Start with a deposit.',
          body: 'Once your funds are verified, you can explore the strategies available to follow.',
          to: '/deposit' as const,
          label: 'Add funds',
        };

  return (
    <div className="space-y-10">
      {/* Balance hero */}
      <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-background">
        <div className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-end lg:p-10">
          <div>
            <span className="metric-label">
              AVAILABLE BALANCE
            </span>

            <div className="mt-4 font-display text-4xl tracking-[-0.04em] text-foreground sm:text-5xl lg:text-6xl">
              {money(balance)}
            </div>

            <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Available for allocation
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/deposit">
                Deposit
                <ArrowUpRight />
              </Link>
            </Button>

            <Button variant="outline" asChild>
              <Link to="/traders">
                Explore strategies
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardMetric
          icon={Wallet}
          label="Available"
          value={money(balance)}
          note="Ready to allocate"
        />

        <DashboardMetric
          icon={TrendingUp}
          label="Allocated"
          value={money(allocatedCapital)}
          note="Across active strategies"
        />

        <DashboardMetric
          icon={Users}
          label="Active strategies"
          value={String(activeAllocations)}
          note="Current copy relationships"
        />

        <DashboardMetric
          icon={Clock3}
          label="Pending deposits"
          value={String(pendingDeposits)}
          note="Awaiting review"
        />
      </section>

      {/* Main dashboard grid */}
      <section className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,.75fr)]">
        <div>
          <SectionHeader
            title="Recent activity"
            to="/wallet"
          />

          <RecordList rows={recentActivity} />
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-muted/[0.18] p-6">
          <div className="pointer-events-none absolute -bottom-16 -right-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative">
            <span className="eyebrow">
              {nextStep.eyebrow}
            </span>

            <h2 className="mt-6 max-w-sm font-display text-2xl tracking-tight text-foreground">
              {nextStep.title}
            </h2>

            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              {nextStep.body}
            </p>

            <Button
              variant="outline"
              asChild
              className="mt-7"
            >
              <Link to={nextStep.to}>
                {nextStep.label}
                <ArrowUpRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Account status */}
      <section className="grid gap-4 md:grid-cols-2">
        <StatusCard
          icon={ShieldCheck}
          eyebrow="Identity"
          title="Verification"
          value={
            data.profile?.kyc_status?.replace('_', ' ') ??
            'not started'
          }
          description={
            data.profile?.kyc_status === 'verified'
              ? 'Your account has completed the current verification state.'
              : 'Complete verification before allocating funds.'
          }
          to="/profile"
        />

        <StatusCard
          icon={Clock3}
          eyebrow="Withdrawals"
          title="Pending requests"
          value={String(
            data.withdrawals.filter(
              (x) => x.status === 'pending',
            ).length,
          )}
          description="Review withdrawal requests and their current status."
          to="/withdraw"
        />
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Wallet                                                                      */
/* -------------------------------------------------------------------------- */

function WalletView({
  data,
  balance,
  pendingDeposits,
  pendingWithdrawals,
}: {
  data: Account;
  balance: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
}) {
  const rows = [
    ...data.deposits.map((x) => ({
      id: `deposit-${x.id}`,
      title: `Deposit · ${x.asset} / ${x.network}`,
      sub: date(x.created_at),
      amount: x.amount,
      status: x.status,
      created: x.created_at,
    })),
    ...data.withdrawals.map((x) => ({
      id: `withdrawal-${x.id}`,
      title: `Withdrawal · ${x.asset} / ${x.network}`,
      sub: date(x.created_at),
      amount: -x.amount,
      status: x.status,
      created: x.created_at,
    })),
  ].sort((a, b) => b.created.localeCompare(a.created));

  return (
    <div className="space-y-10">
      <div className="grid gap-3 md:grid-cols-3">
        <DashboardMetric
          icon={Wallet}
          label="Available balance"
          value={money(balance)}
          note="Ready to allocate"
        />

        <DashboardMetric
          icon={Clock3}
          label="Pending deposits"
          value={money(
            data.deposits
              .filter((x) => x.status === 'pending')
              .reduce((a, x) => a + x.amount, 0),
          )}
          note={`${pendingDeposits} pending request${
            pendingDeposits === 1 ? '' : 's'
          }`}
        />

        <DashboardMetric
          icon={ArrowUpRight}
          label="Pending withdrawals"
          value={money(
            data.withdrawals
              .filter((x) => x.status === 'pending')
              .reduce((a, x) => a + x.amount, 0),
          )}
          note={`${pendingWithdrawals} pending request${
            pendingWithdrawals === 1 ? '' : 's'
          }`}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/deposit">Deposit funds</Link>
        </Button>

        <Button variant="outline" asChild>
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

/* -------------------------------------------------------------------------- */
/* Withdraw                                                                    */
/* -------------------------------------------------------------------------- */

function WithdrawView({
  balance,
  amount,
  setAmount,
  network,
  setNetwork,
  address,
  setAddress,
  busy,
  action,
  data,
}: {
  data: Account;
  balance: number;
  amount: string;
  setAmount: (value: string) => void;
  network: string;
  setNetwork: (value: string) => void;
  address: string;
  setAddress: (value: string) => void;
  busy: boolean;
  action: (
    fn: () => Promise<void>,
    text: string,
  ) => Promise<void>;
}) {
  return (
    <div className="space-y-10">
      <div className="notice-strip">
        Withdrawals require verified identity and available balance.
        Requests are reviewed manually. Live transfer processing is not
        connected.
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,.7fr)]">
        <form
          className="form-panel"
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
                'request_withdrawal',
                {
                  _amount: numericAmount,
                  _network: network,
                  _destination: address,
                },
              );

              if (error) throw error;

              setAmount('');
              setAddress('');
            },
            'Withdrawal request submitted. Your available balance has been reserved.');
          }}
        >
          <h2 className="font-display text-2xl">
            Request withdrawal
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Available: {money(balance)}
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
                required
                value={amount}
                onChange={(event) =>
                  setAmount(event.target.value)
                }
                placeholder="0.00"
                disabled={busy}
              />
            </label>

            <label className="field-label">
              Network
              <select
                className="field-input"
                value={network}
                onChange={(event) =>
                  setNetwork(event.target.value)
                }
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
                className="field-input"
                required
                minLength={8}
                value={address}
                onChange={(event) =>
                  setAddress(event.target.value)
                }
                placeholder="Enter your wallet address"
                disabled={busy}
              />
            </label>

            <Button
              type="submit"
              disabled={
                busy ||
                !balance ||
                data.profile?.kyc_status !== 'verified'
              }
              className="h-11"
            >
              Request withdrawal
              <ArrowRight />
            </Button>

            {data.profile?.kyc_status !== 'verified' && (
              <p className="text-xs leading-5 text-muted-foreground">
                Complete account verification before requesting a
                withdrawal.{' '}
                <Link
                  to="/profile"
                  className="font-semibold text-primary hover:underline"
                >
                  Review profile
                </Link>
              </p>
            )}
          </div>
        </form>

        <div className="border-l border-border pl-7">
          <span className="eyebrow">
            BEFORE YOU CONTINUE
          </span>

          <h3 className="mt-5 font-display text-2xl">
            Check every character.
          </h3>

          <p className="mt-5 text-sm leading-7 text-muted-foreground">
            Crypto transfers may be irreversible. Verify the receiving
            address and network carefully before submitting a request.
          </p>
        </div>
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
            created: x.created_at,
          }))}
        />
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Portfolio                                                                   */
/* -------------------------------------------------------------------------- */

function PortfolioView({
  data,
  balance,
  allocatedCapital,
}: {
  data: Account;
  balance: number;
  allocatedCapital: number;
}) {
  return (
    <div className="space-y-10">
      <div className="grid gap-3 md:grid-cols-3">
        <DashboardMetric
          icon={Wallet}
          label="Available"
          value={money(balance)}
          note="Unallocated balance"
        />

        <DashboardMetric
          icon={TrendingUp}
          label="Allocated capital"
          value={money(allocatedCapital)}
          note="Across active relationships"
        />

        <DashboardMetric
          icon={Users}
          label="Relationships"
          value={String(data.allocations.length)}
          note="Total copy relationships"
        />
      </div>

      <section>
        <SectionHeader
          title="Strategy allocations"
          to="/traders"
        />

        <RecordList
          rows={data.allocations.map((x) => ({
            id: x.id,
            title: x.traders?.name ?? 'Trader',
            sub: date(x.created_at),
            amount: x.amount,
            status: x.status,
          }))}
        />
      </section>

      <div className="border-t border-border pt-8">
        <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
          Live trade history, performance charts, P&L and reporting
          will appear when an execution and reporting provider is
          connected. No simulated gains are presented as actual account
          performance.
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Profile                                                                     */
/* -------------------------------------------------------------------------- */

function ProfileView({
  data,
  name,
  setName,
  phone,
  setPhone,
  country,
  setCountry,
  busy,
  action,
}: {
  data: Account;
  name: string;
  setName: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  country: string;
  setCountry: (value: string) => void;
  busy: boolean;
  action: (
    fn: () => Promise<void>,
    text: string,
  ) => Promise<void>;
}) {
  const status = data.profile?.kyc_status ?? 'not_started';

  return (
    <div className="space-y-10">
      <div className="grid gap-10 lg:grid-cols-[1fr_.75fr]">
        <form
          className="form-panel"
          onSubmit={(event) => {
            event.preventDefault();

            action(async () => {
              const { error } = await supabase
                .from('profiles')
                .update({
                  full_name: name,
                  phone,
                  country,
                })
                .eq('id', data.user.id);

              if (error) throw error;
            }, 'Profile saved.');
          }}
        >
          <span className="eyebrow">PERSONAL DETAILS</span>

          <h2 className="mt-4 font-display text-2xl">
            Your information
          </h2>

          <div className="mt-8 grid gap-5">
            <label className="field-label">
              Full name
              <input
                className="field-input"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                disabled={busy}
              />
            </label>

            <label className="field-label">
              Email
              <input
                className="field-input"
                value={data.user.email ?? ''}
                disabled
              />
            </label>

            <label className="field-label">
              Phone
              <input
                className="field-input"
                value={phone}
                onChange={(event) =>
                  setPhone(event.target.value)
                }
                disabled={busy}
              />
            </label>

            <label className="field-label">
              Country
              <input
                className="field-input"
                value={country}
                onChange={(event) =>
                  setCountry(event.target.value)
                }
                disabled={busy}
              />
            </label>

            <Button
              type="submit"
              disabled={busy}
              className="w-fit"
            >
              Save changes
            </Button>
          </div>
        </form>

        <div className="space-y-5">
          <div className="form-panel">
            <span className="eyebrow">
              IDENTITY VERIFICATION
            </span>

            <h3 className="mt-4 font-display text-2xl">
              Account status
            </h3>

            <div className="mt-5">
              <Status value={status} />
            </div>

            <p className="mt-5 text-sm leading-7 text-muted-foreground">
              Submit your profile for manual review. Identity document
              uploads and automated checks are not connected in this
              interface.
            </p>

            {['not_started', 'rejected'].includes(status) && (
              <Button
                variant="outline"
                className="mt-6"
                disabled={busy}
                onClick={() =>
                  action(async () => {
                    const { error } =
                      await supabase.rpc('submit_kyc');

                    if (error) throw error;
                  }, 'Verification submitted for review.')
                }
              >
                Submit for review
              </Button>
            )}
          </div>

          <div className="form-panel">
            <span className="eyebrow">SECURITY</span>

            <h3 className="mt-4 font-display text-xl">
              Account access
            </h3>

            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Manage authentication through the account access flow.
            </p>

            <Button
              variant="outline"
              asChild
              className="mt-5"
            >
              <Link to="/auth" search={{ mode: 'login' }}>
                Account access
                <ArrowUpRight />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <section>
        <SectionHeader title="Activity log" />

        {data.activity.length ? (
          <div className="grid gap-2">
            {data.activity.map((item) => (
              <div className="record-row" key={item.id}>
                <span className="capitalize">
                  {item.action.replaceAll('_', ' ')}
                </span>

                <span className="text-xs text-muted-foreground">
                  {date(item.created_at)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <Empty
            title="No activity yet"
            body="Your account actions will appear here."
          />
        )}
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Support                                                                     */
/* -------------------------------------------------------------------------- */

function SupportView({
  data,
  subject,
  setSubject,
  message,
  setMessage,
  busy,
  action,
}: {
  data: Account;
  subject: string;
  setSubject: (value: string) => void;
  message: string;
  setMessage: (value: string) => void;
  busy: boolean;
  action: (
    fn: () => Promise<void>,
    text: string,
  ) => Promise<void>;
}) {
  return (
    <div className="space-y-10">
      <div className="grid gap-10 lg:grid-cols-[1fr_.7fr]">
        <form
          className="form-panel"
          onSubmit={(event) => {
            event.preventDefault();

            action(async () => {
              const { error } = await supabase
                .from('support_tickets')
                .insert({
                  user_id: data.user.id,
                  subject,
                  message,
                });

              if (error) throw error;

              setSubject('');
              setMessage('');
            }, 'Support request sent.');
          }}
        >
          <span className="eyebrow">CONTACT SUPPORT</span>

          <h2 className="mt-4 font-display text-2xl">
            Send a request
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Tell us what you need help with and keep the conversation
            attached to your account.
          </p>

          <div className="mt-8 grid gap-5">
            <label className="field-label">
              Subject
              <input
                className="field-input"
                required
                value={subject}
                onChange={(event) =>
                  setSubject(event.target.value)
                }
                placeholder="How can we help?"
                disabled={busy}
              />
            </label>

            <label className="field-label">
              Message
              <textarea
                className="field-input min-h-36"
                required
                value={message}
                onChange={(event) =>
                  setMessage(event.target.value)
                }
                placeholder="Tell us a little more"
                disabled={busy}
              />
            </label>

            <Button
              type="submit"
              disabled={busy}
              className="w-fit"
            >
              Send request
              <ArrowRight />
            </Button>
          </div>
        </form>

        <div className="border-l border-border pl-7">
          <span className="eyebrow">QUICK ANSWERS</span>

          <h3 className="mt-5 font-display text-2xl">
            Looking for guidance?
          </h3>

          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            Review common questions about verification, funding and
            account access.
          </p>

          <Button
            asChild
            variant="outline"
            className="mt-6"
          >
            <Link to="/faq">
              View FAQ
              <ArrowUpRight />
            </Link>
          </Button>
        </div>
      </div>

      <section>
        <SectionHeader title="Your requests" />

        {data.tickets.length ? (
          <div className="grid gap-3">
            {data.tickets.map((ticket) => (
              <div
                className="record-row items-start"
                key={ticket.id}
              >
                <div className="min-w-0">
                  <strong>{ticket.subject}</strong>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {ticket.message}
                  </p>

                  {ticket.reply && (
                    <p className="mt-4 border-l-2 border-primary pl-4 text-sm leading-6">
                      Support: {ticket.reply}
                    </p>
                  )}
                </div>

                <Status value={ticket.status} />
              </div>
            ))}
          </div>
        ) : (
          <Empty
            title="No open requests"
            body="When you contact support, your conversations will appear here."
          />
        )}
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Notifications                                                               */
/* -------------------------------------------------------------------------- */

function NotificationsView({
  data,
  unreadNotifications,
  busy,
  action,
}: {
  data: Account;
  unreadNotifications: number;
  busy: boolean;
  action: (
    fn: () => Promise<void>,
    text: string,
  ) => Promise<void>;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="eyebrow">ACCOUNT UPDATES</span>

          <h2 className="mt-3 font-display text-2xl">
            Your notifications
          </h2>
        </div>

        {unreadNotifications > 0 && (
          <span className="text-xs text-muted-foreground">
            {unreadNotifications} unread
          </span>
        )}
      </div>

      {data.notifications.length ? (
        <div className="grid gap-3">
          {data.notifications.map((notification) => (
            <div
              className={`record-row items-start ${
                !notification.read_at
                  ? 'border-primary/20 bg-primary/[0.025]'
                  : ''
              }`}
              key={notification.id}
            >
              <div className="flex min-w-0 gap-3">
                <div
                  className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                    notification.read_at
                      ? 'bg-border'
                      : 'bg-primary'
                  }`}
                />

                <div>
                  <strong>{notification.title}</strong>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {notification.message}
                  </p>

                  <small className="mt-3 block text-xs text-muted-foreground">
                    {date(notification.created_at)}
                  </small>
                </div>
              </div>

              {!notification.read_at && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() =>
                    action(async () => {
                      const { error } = await supabase
                        .from('notifications')
                        .update({
                          read_at: new Date().toISOString(),
                        })
                        .eq('id', notification.id);

                      if (error) throw error;
                    }, 'Notification marked as read.')
                  }
                >
                  <Check />
                  Mark read
                </Button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <Empty
          title="All caught up"
          body="Account notifications will appear here when there is something new."
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Shared UI                                                                   */
/* -------------------------------------------------------------------------- */

function DashboardMetric({
  icon: Icon,
  label,
  value,
  note,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="metric group">
      <div className="flex items-center justify-between gap-3">
        <span className="metric-label">{label}</span>

        <Icon className="h-4 w-4 text-muted-foreground/60 transition-colors group-hover:text-primary" />
      </div>

      <strong className="mt-5 block truncate font-display text-2xl font-medium tabular-nums tracking-tight text-foreground">
        {value}
      </strong>

      <span className="mt-2 block text-xs text-muted-foreground">
        {note}
      </span>
    </div>
  );
}

function StatusCard({
  icon: Icon,
  eyebrow,
  title,
  value,
  description,
  to,
}: {
  icon: typeof ShieldCheck;
  eyebrow: string;
  title: string;
  value: string;
  description: string;
  to: '/profile' | '/withdraw';
}) {
  return (
    <div className="group rounded-2xl border border-border/70 bg-background p-5 transition hover:border-primary/30 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="eyebrow">{eyebrow}</span>

          <h3 className="mt-3 font-display text-xl">
            {title}
          </h3>
        </div>

        <div className="grid h-9 w-9 place-items-center rounded-xl bg-muted/50">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </div>

      <div className="mt-5">
        <Status value={value} />
      </div>

      <p className="mt-4 text-sm leading-6 text-muted-foreground">
        {description}
      </p>

      <Link
        to={to}
        className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
      >
        Review
        <ArrowUpRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

function SectionHeader({
  title,
  to,
}: {
  title: string;
  to?: '/wallet' | '/traders';
}) {
  return (
    <div className="mb-5 flex items-center justify-between gap-4">
      <h2 className="font-display text-xl tracking-tight text-foreground sm:text-2xl">
        {title}
      </h2>

      {to && (
        <Link
          to={to}
          className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          View all
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

function RecordList({
  rows,
}: {
  rows: {
    id: string;
    title: string;
    sub: string;
    amount: number;
    status: string;
  }[];
}) {
  if (!rows.length) {
    return (
      <Empty
        title="Nothing here yet"
        body="Your activity will appear here as soon as you make your first move."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70">
      <div className="divide-y divide-border/60">
        {rows.map((row) => (
          <div
            key={row.id}
            className="flex flex-col gap-3 bg-background px-4 py-4 transition hover:bg-muted/[0.18] sm:flex-row sm:items-center sm:px-5"
          >
            <div className="min-w-0">
              <strong className="block truncate text-sm font-medium text-foreground">
                {row.title}
              </strong>

              <p className="mt-1 text-xs text-muted-foreground">
                {row.sub}
              </p>
            </div>

            <div className="flex items-center justify-between gap-4 sm:ml-auto sm:justify-end">
              <span
                className={`text-sm font-semibold tabular-nums ${
                  row.amount < 0
                    ? 'text-foreground'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {row.amount < 0 ? '-' : '+'}
                {money(Math.abs(row.amount))}
              </span>

              <Status value={row.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AccountSkeleton() {
  return (
    <div className="space-y-8">
      <div className="h-64 animate-pulse rounded-3xl bg-secondary/70" />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-32 animate-pulse rounded-2xl bg-secondary/70"
          />
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.25fr_.75fr]">
        <div className="h-80 animate-pulse rounded-2xl bg-secondary/70" />
        <div className="h-80 animate-pulse rounded-2xl bg-secondary/70" />
      </div>
    </div>
  );
}
