import { useEffect, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { Link2, RefreshCw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Status } from './status';
import { supabase } from '@/integrations/supabase/client';
import { connectTraderAccount, syncTraderConnection, removeTraderConnection } from '@/lib/trader-connections.functions';
import { money } from '@/lib/format';
import type { Database } from '@/integrations/supabase/types';
type Conn = Database['public']['Tables']['trader_connections']['Row'];

export function TraderConnections({ traderId }: { traderId: string }) {
  const connect = useServerFn(connectTraderAccount), sync = useServerFn(syncTraderConnection), remove = useServerFn(removeTraderConnection);
  const [list, setList] = useState<Conn[]>([]), [f, setF] = useState({ platform: 'mt5' as 'mt4' | 'mt5' | 'deriv', login: '', server: '', password: '' });
  const [busy, setBusy] = useState(false), [msg, setMsg] = useState(''), [err, setErr] = useState('');
  async function load() { const { data } = await supabase.from('trader_connections').select('*').eq('trader_id', traderId).order('created_at'); setList(data ?? []); }
  useEffect(() => { load(); }, [traderId]);
  async function run(p: Promise<{ message: string }>) { setBusy(true); setErr(''); setMsg(''); try { const r = await p; setMsg(r.message); setF((x) => ({ ...x, password: '' })); } catch (e) { setErr(e instanceof Error ? e.message : 'Something went wrong.'); } finally { setBusy(false); load(); } }
  const deriv = f.platform === 'deriv';
  return (
    <div className="w-full rounded-lg border border-border p-4">
      <h4 className="flex items-center gap-2 font-display text-lg"><Link2 size={18} /> Trading accounts</h4>
      <p className="mt-1 text-xs text-muted-foreground">Link this trader's MT4, MT5 or Deriv account. Use a read-only investor password or a read-only Deriv API token. Passwords are sent to the provider and never stored here.</p>
      <form className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5" onSubmit={(e) => { e.preventDefault(); run(connect({ data: { traderId, platform: f.platform, password: f.password, ...(deriv ? {} : { login: f.login, server: f.server }) } })); }}>
        <select aria-label="Platform" className="field-input" value={f.platform} onChange={(e) => setF({ ...f, platform: e.target.value as typeof f.platform })}><option value="mt5">MetaTrader 5</option><option value="mt4">MetaTrader 4</option><option value="deriv">Deriv</option></select>
        {!deriv && <input className="field-input" required placeholder="Account number" value={f.login} onChange={(e) => setF({ ...f, login: e.target.value })} />}
        {!deriv && <input className="field-input" required placeholder="Broker server, e.g. ICMarkets-Live01" value={f.server} onChange={(e) => setF({ ...f, server: e.target.value })} />}
        <input className="field-input" type="password" required placeholder={deriv ? 'Deriv API token (read scope)' : 'Investor password'} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} autoComplete="off" />
        <Button type="submit" disabled={busy}>{busy ? 'Connecting…' : 'Connect'}</Button>
      </form>
      {err && <div role="alert" className="form-error mt-3">{err}</div>}{msg && <div className="form-notice mt-3">{msg}</div>}
      {list.length > 0 && <ul className="mt-4 grid gap-2">{list.map((c) => (
        <li key={c.id} className="flex flex-wrap items-center gap-3 border-t border-border pt-2 text-sm">
          <strong className="uppercase">{c.platform}</strong><span>{c.account_login}{c.server ? ` · ${c.server}` : ''}</span><Status value={c.status} />
          {c.balance != null && <span className="text-xs text-muted-foreground">Equity {money(Number(c.equity ?? c.balance))} {c.currency}</span>}
          {c.last_error && <span className="text-xs text-destructive">{c.last_error}</span>}
          <span className="ml-auto flex gap-2">
            <Button size="sm" variant="outline" disabled={busy} onClick={() => run(sync({ data: { id: c.id } }))}><RefreshCw size={14} /> Sync</Button>
            <Button size="sm" variant="outline" disabled={busy} onClick={() => confirm('Disconnect this account?') && run(remove({ data: { id: c.id } }))}><Trash2 size={14} /></Button>
          </span>
        </li>))}</ul>}
    </div>
  );
}
