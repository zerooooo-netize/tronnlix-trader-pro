import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from '@tanstack/react-router';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  Copy,
  ArrowRight,
  Loader2,
  Wallet,
  ShieldAlert,
  Info,
  ArrowUpRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Empty, Status } from './status';
import { money, date } from '@/lib/format';
import { supabase } from '@/integrations/supabase/client';
import type { loadAccount } from '@/lib/account-data';

type Account = Awaited<ReturnType<typeof loadAccount>>;

type Props = {
  data: Account;
  busy: boolean;
  action: (fn: () => Promise<void>, message: string) => Promise<void>;
};

export function DepositExperience({ data, busy, action }: Props) {
  const wallets = data.wallets;
  const [walletId, setWalletId] = useState('');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Default to the first wallet the moment the list is available
  useEffect(() => {
    if (!walletId && wallets.length) setWalletId(wallets[0].id);
  }, [wallets, walletId]);

  const wallet = useMemo(
    () => wallets.find((w) => w.id === walletId) ?? wallets[0],
    [wallets, walletId]
  );

  const amountNum = Number(amount);
  const amountValid =
    !!wallet &&
    amount !== '' &&
    amountNum >= Number(wallet.min_deposit) &&
    amountNum <= Number(wallet.max_deposit);

  const referenceValid = reference.trim().length >= 8;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!wallet || !amountValid || !referenceValid) return;
    setSubmitting(true);
    try {
      await action(async () => {
        const { error } = await supabase.from('deposits').insert({
          user_id: data.user.id,
          wallet_id: wallet.id,
          asset: wallet.asset,
          network: wallet.network,
          amount: amountNum,
          tx_reference: reference.trim() || null,
        });
        if (error) throw error;
        setAmount('');
        setReference('');
      }, 'Payment reported. Your deposit stays pending until staff independently verify it.');
    } finally {
      setSubmitting(false);
    }
  }

  async function copyAddress() {
    if (!wallet) return;
    try {
      await navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="space-y-10">
      {/* Notice */}
      <div className="notice-strip flex items-start gap-3">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />
        <p>
          Send only to the displayed address on the matching network. Transfers
          can be irreversible. Reporting payment does not credit your account;
          staff verify every deposit manually.
        </p>
      </div>

      {wallet ? (
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(320px,.9fr)]">
          {/* ------------------------------------------------
           * Step 1: choose destination and amount
           * ---------------------------------------------- */}
          <form className="form-panel" onSubmit={submit} noValidate>
            <div className="flex items-center justify-between gap-4">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                01 / Choose destination
              </span>
              <span className="hidden text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground sm:inline">
                Step 1 of 2
              </span>
            </div>
            <h2 className="mt-4 font-display text-2xl tracking-tight text-foreground sm:text-[26px]">
              Fund your account
            </h2>

            <div className="mt-8 grid gap-5">
              <label className="field-label">
                Coin and network
                <select
                  className="field-input"
                  value={wallet.id}
                  onChange={(e) => setWalletId(e.target.value)}
                  disabled={busy || submitting}
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.asset} · {w.network}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex flex-wrap items-center gap-2 text-[11.5px]">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/60 px-2.5 py-1 text-muted-foreground">
                  <Wallet className="h-3.5 w-3.5" />
                  Min {money(wallet.min_deposit)}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/60 px-2.5 py-1 text-muted-foreground">
                  Max {money(wallet.max_deposit)}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/60 px-2.5 py-1 text-muted-foreground">
                  Fee {money(wallet.deposit_fee)}
                </span>
              </div>

              <label className="field-label">
                Amount in USD
                <input
                  className="field-input"
                  type="number"
                  min={wallet.min_deposit}
                  max={wallet.max_deposit}
                  step="0.01"
                  inputMode="decimal"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  disabled={busy || submitting}
                />
              </label>

              {amount !== '' && !amountValid && (
                <p className="flex items-start gap-2 text-xs text-rose-600 dark:text-rose-400">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  Enter an amount between {money(wallet.min_deposit)} and{' '}
                  {money(wallet.max_deposit)}.
                </p>
              )}

              <label className="field-label">
                Transaction hash or reference
                <input
                  className="field-input font-mono text-[13px]"
                  required
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Paste the transaction hash after sending"
                  disabled={busy || submitting}
                />
              </label>
              <p className="text-xs text-muted-foreground">
                Paste the full hash. It helps staff verify your deposit faster.
              </p>
            </div>

            {/* Sticky CTA on mobile, inline on desktop */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="submit"
                disabled={busy || submitting || !amountValid || !referenceValid}
                className="h-11 w-full sm:w-auto"
                aria-busy={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting
                  </>
                ) : (
                  <>
                    I&apos;ve paid, submit for review
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                You can submit more than one deposit.
              </p>
            </div>
          </form>

          {/* ------------------------------------------------
           * Step 2: send to this wallet
           * ---------------------------------------------- */}
          <AnimatePresence initial={false}>
            <motion.aside
              key={wallet.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="lg:border-l lg:border-border/60 lg:pl-8"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  02 / Send to this wallet
                </span>
                <span className="hidden text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground sm:inline">
                  Step 2 of 2
                </span>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <h3 className="font-display text-2xl tracking-tight text-foreground">
                  {wallet.asset}
                </h3>
                <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
                  {wallet.network}
                </span>
              </div>

              <div className="mt-6 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                <div className="rounded-2xl border border-border/70 bg-background p-3 shadow-sm">
                  <QRCodeSVG
                    value={wallet.address}
                    size={148}
                    title={`Deposit address for ${wallet.asset} on ${wallet.network}`}
                    bgColor="transparent"
                    fgColor="currentColor"
                    className="text-foreground"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Address
                  </p>
                  <p className="mt-2 break-all font-mono text-[13px] leading-6 text-foreground">
                    {wallet.address}
                  </p>
                  <Button
                    variant="outline"
                    type="button"
                    size="sm"
                    className="mt-4 h-9"
                    onClick={copyAddress}
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy address
                      </>
                    )}
                  </Button>
                  <span aria-live="polite" className="sr-only">
                    {copied ? 'Address copied to clipboard' : ''}
                  </span>
                </div>
              </div>

              <div className="mt-7 rounded-xl border border-border/60 bg-secondary/40 p-4">
                <p className="flex items-start gap-2 text-xs leading-6 text-muted-foreground">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  Only use the exact network shown. Sending {wallet.asset} on a
                  different network can result in permanent loss.
                </p>
              </div>
            </motion.aside>
          </AnimatePresence>
        </div>
      ) : (
        <Empty
          eyebrow="No destination available"
          title="Funding destinations are being prepared"
          body="No active receiving wallet is configured yet. Please check back shortly."
          icon={Wallet}
        />
      )}

      {/* ------------------------------------------------
       * Deposit history
       * ---------------------------------------------- */}
      <section className="pt-4">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl tracking-tight text-foreground">
              Deposit history
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Every payment you report, and where it stands.
            </p>
          </div>
          <Link
            to="/copy-trading"
            className="group inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            Explore copy trading
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {data.deposits.length ? (
          <ul className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/60">
            {data.deposits.map((x) => {
              const confirmed = x.status === 'confirmed';
              return (
                <li
                  key={x.id}
                  className={`group relative flex flex-col gap-3 bg-background px-5 py-4 transition-colors sm:flex-row sm:items-center sm:justify-between ${
                    confirmed ? 'hover:bg-emerald-500/[0.03]' : 'hover:bg-muted/40'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`absolute left-0 top-0 h-full w-0.5 ${
                      confirmed
                        ? 'bg-emerald-500/70'
                        : x.status === 'rejected' || x.status === 'failed'
                        ? 'bg-rose-500/70'
                        : 'bg-amber-500/70'
                    }`}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <strong className="text-[14px] text-foreground">
                        {x.asset}
                      </strong>
                      <span className="inline-flex items-center rounded-full border border-border/70 bg-muted/60 px-2 py-0.5 text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground">
                        {x.network}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {date(x.created_at)}
                      <span className="mx-1.5 text-border">·</span>
                      <span className="font-mono">
                        {x.tx_reference || 'No reference'}
                      </span>
                    </p>
                    {confirmed && (
                      <Link
                        to="/copy-trading"
                        className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                      >
                        Deposit confirmed, choose a trader
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-4 self-end sm:self-auto">
                    <span className="font-display text-[15px] tabular-nums text-foreground">
                      {money(x.amount)}
                    </span>
                    <Status value={x.status} />
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <Empty
            eyebrow="No deposits yet"
            title="Your first deposit appears here"
            body="Once you report a payment, it will show up in this list while the team verifies it."
            icon={Wallet}
          />
        )}
      </section>
    </div>
  );
}
