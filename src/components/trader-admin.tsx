import { TraderConnections } from './trader-connections';
import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { WorkspaceShell } from './workspace-shell';
import { Status } from './status';
import { supabase } from '@/integrations/supabase/client';
import type { Trader } from './trader-marketplace';
import { money } from '@/lib/format';

type Draft = { name: string; strategy: string; risk_level: string; roi_12m: string; followers: string; aum: string; country: string; trading_style: string; biography: string; win_rate: string; max_drawdown: string; monthly_return: string; minimum_investment: string; recommended_investment: string; copy_fee: string; photo_url: string; markets: string; languages: string; sort_priority: string };
const blank: Draft = { name: '', strategy: '', risk_level: 'Moderate', roi_12m: '0', followers: '0', aum: '0', country: '', trading_style: '', biography: '', win_rate: '', max_drawdown: '', monthly_return: '', minimum_investment: '', recommended_investment: '', copy_fee: '', photo_url: '', markets: '', languages: '', sort_priority: '0' };
const num = (s: string) => (s.trim() === '' ? null : Number(s));
const arr = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean);
const toDraft = (t: Trader): Draft => ({ name: t.name, strategy: t.strategy, risk_level: t.risk_level, roi_12m: String(t.roi_12m), followers: String(t.followers), aum: String(t.aum), country: t.country ?? '', trading_style: t.trading_style ?? '', biography: t.biography ?? '', win_rate: t.win_rate?.toString() ?? '', max_drawdown: t.max_drawdown?.toString() ?? '', monthly_return: t.monthly_return?.toString() ?? '', minimum_investment: t.minimum_investment?.toString() ?? '', recommended_investment: t.recommended_investment?.toString() ?? '', copy_fee: t.copy_fee?.toString() ?? '', photo_url: t.photo_url ?? '', markets: t.markets?.join(', ') ?? '', languages: t.languages?.join(', ') ?? '', sort_priority: String(t.sort_priority) });

export function TraderAdmin() {
  const [traders, setTraders] = useState<Trader[]>([]), [editing, setEditing] = useState<string | null>(null), [d, setD] = useState<Draft>(blank);
  const [msg, setMsg] = useState(''), [err, setErr] = useState(''), [busy, setBusy] = useState(false), [perf, setPerf] = useState({ date: '', type: 'monthly', pct: '' });
  async function load() { const { data, error } = await supabase.from('traders').select('*').order('sort_priority', { ascending: false }).order('created_at'); if (error) setErr(error.message); setTraders(data ?? []); }
  useEffect(() => { load(); }, []);
  async function run(fn: () => PromiseLike<{ error: { message: string } | null }>, ok: string) { setBusy(true); setErr(''); setMsg(''); const { error } = await fn(); setBusy(false); if (error) setErr(`${error.message}. Check the fields and try again.`); else { setMsg(ok); await load(); } }
  const payload = () => ({ name: d.name.trim(), strategy: d.strategy.trim(), risk_level: d.risk_level, roi_12m: Number(d.roi_12m), followers: Number(d.followers), aum: Number(d.aum), country: d.country || null, trading_style: d.trading_style || null, biography: d.biography || null, win_rate: num(d.win_rate), max_drawdown: num(d.max_drawdown), monthly_return: num(d.monthly_return), minimum_investment: num(d.minimum_investment), recommended_investment: num(d.recommended_investment), copy_fee: num(d.copy_fee), photo_url: d.photo_url || null, markets: arr(d.markets), languages: arr(d.languages), sort_priority: Number(d.sort_priority) || 0 });
  function save(e: FormEvent) { e.preventDefault(); const p = payload(); if (editing && editing !== 'new') run(() => supabase.from('traders').update(p).eq('id', editing), 'Profile saved. The marketplace now shows the update.'); else run(() => supabase.from('traders').insert({ ...p, handle: p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString(36) }), 'Profile created.'); setEditing(null); }
  const set = (id: string, patch: Partial<Trader>, ok: string) => run(() => supabase.from('traders').update(patch).eq('id', id), ok);
  const field = (k: keyof Draft, label: string, type = 'text') => <label className="field-label">{label}<input className="field-input" type={type} step="any" value={d[k]} onChange={(e) => setD({ ...d, [k]: e.target.value })} required={k === 'name' || k === 'strategy'} /></label>;

  return (
    <WorkspaceShell admin title="Trading experts" subtitle="Operations / Tronnlix Trade">
      <div className="notice-strip">Figures you enter are shown to customers as illustrative, not verified results. Live execution is not connected.</div>
      {err && <div role="alert" className="form-error mb-4">{err}</div>}{msg && <div className="form-notice mb-4">{msg}</div>}
      <div className="mb-6 flex justify-between"><h2 className="font-display text-2xl">{traders.length} profiles</h2><Button onClick={() => { setD(blank); setEditing('new'); }}>New profile</Button></div>
      {editing && (
        <form onSubmit={save} className="form-panel mb-10">
          <h3 className="font-display text-xl">{editing === 'new' ? 'New profile' : `Edit ${d.name}`}</h3>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {field('name', 'Full name')}{field('strategy', 'Strategy headline')}
            <label className="field-label">Risk level<select className="field-input" value={d.risk_level} onChange={(e) => setD({ ...d, risk_level: e.target.value })}><option>Low</option><option>Moderate</option><option>High</option></select></label>
            {field('roi_12m', 'Example 12m return %', 'number')}{field('monthly_return', 'Avg monthly return %', 'number')}{field('win_rate', 'Win rate %', 'number')}{field('max_drawdown', 'Max drawdown %', 'number')}{field('followers', 'Followers', 'number')}{field('aum', 'AUM (USD)', 'number')}{field('minimum_investment', 'Minimum investment', 'number')}{field('recommended_investment', 'Recommended investment', 'number')}{field('copy_fee', 'Copy fee %', 'number')}{field('country', 'Country')}{field('trading_style', 'Trading style')}{field('markets', 'Markets (comma separated)')}{field('languages', 'Languages (comma separated)')}{field('photo_url', 'Photo URL', 'url')}{field('sort_priority', 'Sort priority', 'number')}
          </div>
          <label className="field-label mt-4">Biography<textarea className="field-input min-h-28" value={d.biography} onChange={(e) => setD({ ...d, biography: e.target.value })} /></label>
          <div className="mt-6 flex gap-3"><Button type="submit" disabled={busy}>Save profile</Button><Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button></div>
        </form>
      {editing && editing !== 'new' && <div className="mb-10"><TraderConnections traderId={editing} /></div>}
      )}
      <div className="grid border-t border-border">
        {traders.map((t) => (
          <div key={t.id} className="flex flex-wrap items-center gap-3 border-b border-border py-4">
            <div className="min-w-48 flex-1"><strong>{t.name}</strong>{t.featured && <span className="ml-2 text-xs text-primary">Featured</span>}{t.deleted_at && <span className="ml-2 text-xs text-muted-foreground">Removed</span>}<p className="text-xs text-muted-foreground">{t.strategy} · {t.risk_level} · +{t.roi_12m}% · {money(t.aum)}</p></div>
            <Status value={t.status} />
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => { setD(toDraft(t)); setEditing(t.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Edit</Button>
              <Button size="sm" variant="outline" onClick={() => set(t.id, { featured: !t.featured }, t.featured ? 'Removed from featured.' : 'Now featured.')}>{t.featured ? 'Unfeature' : 'Feature'}</Button>
              <Button size="sm" variant="outline" onClick={() => set(t.id, { verified: !t.verified }, 'Verification badge updated.')}>{t.verified ? 'Unverify' : 'Verify'}</Button>
              {t.status === 'active' ? <Button size="sm" variant="outline" onClick={() => set(t.id, { status: 'suspended' }, 'Suspended. Hidden from the marketplace.')}>Suspend</Button> : <Button size="sm" variant="outline" onClick={() => set(t.id, { status: 'active', deleted_at: null }, 'Active and visible.')}>{t.status === 'archived' ? 'Restore' : 'Activate'}</Button>}
              {t.status !== 'archived' && <Button size="sm" variant="outline" onClick={() => set(t.id, { status: 'archived' }, 'Archived. You can restore it anytime.')}>Archive</Button>}
              <Button size="sm" variant="outline" onClick={() => { const { id: _i, created_at: _c, updated_at: _u, ...rest } = t; run(() => supabase.from('traders').insert({ ...rest, name: `${t.name} (copy)`, handle: `${t.handle}-${Date.now().toString(36)}`, slug: null, status: 'suspended', featured: false }), 'Duplicated as a suspended draft.'); }}>Duplicate</Button>
              <Button size="sm" variant="outline" onClick={() => { if (confirm(`Remove ${t.name}? This hides the profile but keeps its history.`)) set(t.id, { deleted_at: new Date().toISOString(), status: 'archived' }, 'Profile removed.'); }}>Delete</Button>
            </div>
            {editing === t.id && (
              <form className="flex w-full flex-wrap items-end gap-3 pt-2" onSubmit={(e) => { e.preventDefault(); run(() => supabase.from('trader_performance').upsert({ trader_id: t.id, period_start: perf.date, period_type: perf.type, return_pct: Number(perf.pct) }, { onConflict: 'trader_id,period_start,period_type' }), 'Performance entry saved.'); }}>
                <label className="field-label">Period start<input className="field-input" type="date" required value={perf.date} onChange={(e) => setPerf({ ...perf, date: e.target.value })} /></label>
                <label className="field-label">Period<select className="field-input" value={perf.type} onChange={(e) => setPerf({ ...perf, type: e.target.value })}><option>daily</option><option>weekly</option><option>monthly</option><option>yearly</option></select></label>
                <label className="field-label">Return %<input className="field-input" type="number" step="any" required value={perf.pct} onChange={(e) => setPerf({ ...perf, pct: e.target.value })} /></label>
                <Button type="submit" size="sm" disabled={busy}>Add performance</Button>
              </form>
            )}
          </div>
        ))}
      </div>
    </WorkspaceShell>
  );
}
