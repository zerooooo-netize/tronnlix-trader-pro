import { useEffect, useState, type FormEvent } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Empty, Status } from './status';
import { money } from '@/lib/format';

type Wallet = Database['public']['Tables']['crypto_wallets']['Row'];

const ASSETS = [
  'USDT',
  'USDC',
  'BTC',
  'ETH',
  'BNB',
  'SOL',
  'XRP',
  'LTC',
  'TRX',
  'DOGE',
  'ADA',
  'MATIC',
] as const;

const NETWORKS: Record<string, string[]> = {
  USDT: ['TRC20', 'ERC20', 'BEP20', 'Polygon', 'Solana', 'TON'],
  USDC: ['ERC20', 'BEP20', 'Polygon', 'Solana', 'TRC20'],
  BTC: ['Bitcoin', 'Lightning'],
  ETH: ['ERC20', 'Arbitrum', 'Optimism', 'Base'],
  BNB: ['BEP20', 'BEP2'],
  SOL: ['Solana'],
  XRP: ['XRP Ledger'],
  LTC: ['Litecoin'],
  TRX: ['TRC20'],
  DOGE: ['Dogecoin'],
  ADA: ['Cardano'],
  MATIC: ['Polygon', 'ERC20'],
};

export function CryptoWalletAdmin() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [asset, setAsset] = useState('USDT');
  const [network, setNetwork] = useState('TRC20');
  const [address, setAddress] = useState('');
  const [min, setMin] = useState('1');
  const [max, setMax] = useState('1000000');
  const [depositFee, setDepositFee] = useState('0');
  const [withdrawalFee, setWithdrawalFee] = useState('0');

  async function load() {
    const { data, error } = await supabase
      .from('crypto_wallets')
      .select('*')
      .order('asset');
    if (error) setError(error.message);
    else setWallets(data ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  // Keep the network valid whenever the asset changes
  useEffect(() => {
    const options = NETWORKS[asset] ?? [];
    if (options.length && !options.includes(network)) {
      setNetwork(options[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asset]);

  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');
    const { error } = await supabase.from('crypto_wallets').insert({
      asset,
      network,
      address: address.trim(),
      min_deposit: Number(min),
      max_deposit: Number(max),
      deposit_fee: Number(depositFee),
      withdrawal_fee: Number(withdrawalFee),
      active: false,
    });
    if (error) setError(error.message);
    else {
      setNotice(
        'Wallet saved as inactive. Verify the address before activating it.'
      );
      setAddress('');
      await load();
    }
    setBusy(false);
  }

  async function toggle(wallet: Wallet) {
    setBusy(true);
    setError('');
    setNotice('');
    const { error } = await supabase
      .from('crypto_wallets')
      .update({ active: !wallet.active })
      .eq('id', wallet.id);
    if (error) setError(error.message);
    else {
      setNotice(
        wallet.active
          ? 'Wallet deactivated. Existing deposit requests remain visible.'
          : 'Wallet activated for customer deposits.'
      );
      await load();
    }
    setBusy(false);
  }

  const networkOptions = NETWORKS[asset] ?? [];

  return (
    <>
      <div className="notice-strip">
        Only publish an address after checking coin and network ownership.
        Address changes affect future deposits; submitted requests retain the
        original address. Crypto transfers are not automatically monitored or
        confirmed.
      </div>

      {error && (
        <div role="alert" className="form-error mb-5">
          {error}
        </div>
      )}
      {notice && <div className="form-notice mb-5">{notice}</div>}

      <div className="grid gap-10 lg:grid-cols-[.85fr_1.15fr]">
        <form className="form-panel" onSubmit={save}>
          <span className="eyebrow">NEW RECEIVING DESTINATION</span>
          <h2 className="mt-4 font-display text-2xl">Configure a wallet</h2>

          <div className="mt-7 grid gap-4">
            <label className="field-label">
              Cryptocurrency
              <select
                className="field-input"
                value={asset}
                onChange={(e) => setAsset(e.target.value)}
              >
                {ASSETS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </label>

            <label className="field-label">
              Network
              <input
                className="field-input"
                required
                list="network-options"
                value={network}
                onChange={(e) => setNetwork(e.target.value)}
                placeholder="e.g. TRC20"
              />
              <datalist id="network-options">
                {networkOptions.map((n) => (
                  <option key={n} value={n} />
                ))}
              </datalist>
            </label>

            <label className="field-label">
              Receiving address
              <input
                className="field-input font-mono"
                required
                minLength={8}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Verified receiving wallet address"
              />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="field-label">
                Minimum USD
                <input
                  className="field-input"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={min}
                  onChange={(e) => setMin(e.target.value)}
                />
              </label>
              <label className="field-label">
                Maximum USD
                <input
                  className="field-input"
                  type="number"
                  step="0.01"
                  min={min}
                  required
                  value={max}
                  onChange={(e) => setMax(e.target.value)}
                />
              </label>
              <label className="field-label">
                Deposit fee USD
                <input
                  className="field-input"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={depositFee}
                  onChange={(e) => setDepositFee(e.target.value)}
                />
              </label>
              <label className="field-label">
                Withdrawal fee USD
                <input
                  className="field-input"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={withdrawalFee}
                  onChange={(e) => setWithdrawalFee(e.target.value)}
                />
              </label>
            </div>

            <Button type="submit" disabled={busy} className="mt-2">
              Save inactive wallet
            </Button>
          </div>
        </form>

        <section>
          <span className="eyebrow">CONFIGURED WALLETS</span>
          <h2 className="mt-4 font-display text-2xl">Published destinations</h2>

          <div className="mt-7">
            {wallets.length ? (
              wallets.map((w) => (
                <div key={w.id} className="border-t border-border py-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <strong>
                        {w.asset} · {w.network}
                      </strong>
                      <p className="mt-2 break-all font-mono text-xs text-muted-foreground">
                        {w.address}
                      </p>
                    </div>
                    <Status value={w.active ? 'active' : 'inactive'} />
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {money(w.min_deposit)}–{money(w.max_deposit)} · Deposit fee{' '}
                    {money(w.deposit_fee)} · Withdrawal fee{' '}
                    {money(w.withdrawal_fee)}
                  </p>
                  <Button
                    className="mt-4"
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={() => toggle(w)}
                  >
                    {w.active ? 'Deactivate' : 'Activate for deposits'}
                  </Button>
                </div>
              ))
            ) : (
              <Empty
                title="No wallet configured"
                body="Save and verify a destination before making it available to customers."
              />
            )}
          </div>
        </section>
      </div>
    </>
  );
}
