import { useEffect, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { Link } from '@tanstack/react-router';
import { Link2, RefreshCw, Trash2, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Status, Empty } from './status';
import { WorkspaceShell } from './workspace-shell';
import { supabase } from '@/integrations/supabase/client';
import { connectMyAccount, syncMyAccount, removeMyAccount } from '@/lib/user-accounts.functions';
import { money, date } from '@/lib/format';
import type { Database } from '@/integrations/supabase/types';
type Acc = Database['public']['Tables']['user_trading_accounts']['Row'];

export function MyTradingAccounts() {
  const connect = useServerFn(connectMyAccount), sync = useServerFn(syncMyAccount), remove = useServerFn(removeMyAccount);
  const [list, setList] = useState<Acc[] | null>(null), [f, setF] = useState({ platform: 'mt5' as 'mt4' | 'mt5' | 'deriv', login: '', server: '', password: '' });
  const [busy, setBusy] = useState(false), [msg, setMsg] = useState(''), [err, setErr] = useState('');
  async function load() { const { data } = await supabase.from('user_trading_accounts').select('*').order('created_at'); setList(data ?? []); }
  useEffect(() => { load(); }, []);
  async function run(p: () => Promise<{ message: string }>) { setBusy(true); setErr(''); setMsg(''); try { setMsg((await p()).message); setF((x) => ({ ...x, password: '' })); } catch (e) { setErr(e instanceof Error ? e.message : 'Something went wrong.'); } finally { setBusy(false); load(); } }
  const deriv = f.platform === 'deriv';
  return (
    <WorkspaceShell title="Trading accounts" subtitle="Link your MT4, MT5 or Deriv account, then choose an expert to copy.">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        <section className="form-panel">
          <h2 className="flex items-center gap-2 font-display text-xl"><Link2 size={18} /> Link an account</h2>
          <p className="mt-2 text-xs leading-6 text-muted-foreground">For MT4 and MT5, use your account number, broker server and trading password. For Deriv, create an API token with Read and Trade scopes. Your password is passed to the connection provider and never stored here.</p>
          {err && <div role="alert" className="form-error mt-4">{err}</div>}{msg && <div className="form-notice mt-4">{msg}</div>}
          <form className="mt-5 grid gap-4" onSubmit={(e) => { e.preventDefault(); run(() => connect({ data: { platform: f.platform, password: f.password, ...(deriv ? {} : { login: f.login, server: f.server }) } })); }}>
            <div className="grid grid-cols-3 gap-2">{(['mt5', 'mt4', 'deriv'] as const).map((p) => <Button key={p} type="button" variant={f.platform === p ? 'default' : 'outline'} className="h-11" onClick={() => setF({ ...f, platform: p })}>{p === 'deriv' ? 'Deriv' : p.toUpperCase()}</Button>)}</div>
            {!deriv && <label className="field-label">Account number<input className="field-input" required inputMode="numeric" value={f.login} onChange={(e) => setF({ ...f, login: e.target.value })} /></label>}
            {!deriv && <label className="field-label">Broker server<input className="field-input" required placeholder="ICMarkets-Live01" value={f.server} onChange={(e) => setF({ ...f, server: e.target.value })} /></label>}
            <label className="field-label">{deriv ? 'Deriv API token' : 'Password'}<input className="field-input" type="password" required autoComplete="off" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></label>
            <Button type="submit" size="lg" className="h-12" disabled={busy}>{busy ? 'Linking…' : 'Link account'}</Button>
          </form>
        </section>
        <section>
          <h2 className="font-display text-xl">Your linked accounts</h2>
          {list === null ? <div className="mt-4 h-32 animate-pulse bg-secondary" /> : list.length === 0 ? <div className="mt-4"><Empty title="No accounts linked yet" body="Link MT4, MT5 or Deriv to start copying an expert." /></div> : (
            <ul className="mt-4 grid gap-3">{list.map((c) => (
              <li key={c.id} className="form-panel grid gap-2">
                <div className="flex items-center gap-3"><strong className="uppercase">{c.platform}</strong><span className="text-sm">{c.account_login}</span><span className="ml-auto"><Status value={c.status} /></span></div>
                {c.server && <span className="text-xs text-muted-foreground">{c.server}</span>}
                {c.balance != null && <span className="font-display text-2xl">{money(Number(c.equity ?? c.balance))} <span className="text-xs text-muted-foreground">{c.currency} equity</span></span>}
                {c.last_synced_at && <span className="text-xs text-muted-foreground">Refreshed {date(c.last_synced_at)}</span>}
                {c.last_error && <span className="text-xs text-destructive">{c.last_error}</span>}
                <div className="flex gap-2"><Button size="sm" variant="outline" disabled={busy} onClick={() => run(() => sync({ data: { id: c.id } }))}><RefreshCw size={14} /> Refresh</Button><Button size="sm" variant="outline" disabled={busy} aria-label="Unlink" onClick={() => confirm('Unlink this account?') && run(() => remove({ data: { id: c.id } }))}><Trash2 size={14} /></Button></div>
              </li>))}</ul>)}
          <Link to="/traders" className="form-panel mt-4 flex items-center justify-between font-display text-lg hover:border-primary">Choose an expert to copy <ArrowUpRight size={18} /></Link>
        </section>
      </div>
    </WorkspaceShell>
  );
}
