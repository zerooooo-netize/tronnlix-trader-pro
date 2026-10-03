import { useEffect, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { Database, Mail, Play, Plug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getPlatformSettings, savePlatformSettings, sendTestEmail, runSql } from '@/lib/admin-tools.functions';

const groups = [
  { title: 'Email (Resend)', icon: Mail, fields: [['resend_api_key', 'Resend API key', true], ['email_from_address', 'Sender address, e.g. no-reply@tronnlix.com', false], ['email_from_name', 'Sender name', false], ['support_email', 'Support inbox', false]] },
  { title: 'Trading connections', icon: Plug, fields: [['metaapi_token', 'MetaApi token (MT4 / MT5)', true], ['deriv_app_id', 'Deriv app ID', false], ['trongrid_api_key', 'TronGrid API key', true], ['site_name', 'Site name', false]] },
] as const;

export function PlatformSettings() {
  const load = useServerFn(getPlatformSettings), save = useServerFn(savePlatformSettings), test = useServerFn(sendTestEmail), exec = useServerFn(runSql);
  const [vals, setVals] = useState<Record<string, string>>({}), [msg, setMsg] = useState(''), [err, setErr] = useState(''), [busy, setBusy] = useState(false);
  const [to, setTo] = useState(''), [sql, setSql] = useState('select id, full_name, balance from profiles limit 20'), [result, setResult] = useState<{ rows?: Record<string, unknown>[]; affected?: number } | null>(null);
  useEffect(() => { load().then((s) => setVals(Object.fromEntries(Object.entries(s).map(([k, v]) => [k, v.value])))).catch((e) => setErr(e.message)); }, []);
  async function run(fn: () => Promise<unknown>) { setBusy(true); setErr(''); setMsg(''); try { const r: any = await fn(); if (r?.message) setMsg(r.message); } catch (e) { setErr(e instanceof Error ? e.message : 'Something went wrong.'); } finally { setBusy(false); } }
  const cols = result?.rows?.[0] ? Object.keys(result.rows[0]) : [];
  return (
    <div className="grid gap-6">
      {err && <div role="alert" className="form-error">{err}</div>}{msg && <div className="form-notice">{msg}</div>}
      <form className="grid gap-6 lg:grid-cols-2" onSubmit={(e) => { e.preventDefault(); run(() => save({ data: vals })); }}>
        {groups.map((g) => (
          <section key={g.title} className="form-panel grid gap-4">
            <h2 className="flex items-center gap-2 font-display text-xl"><g.icon size={18} /> {g.title}</h2>
            {g.fields.map(([k, label, secret]) => (
              <label key={k} className="field-label">{label}<input className="field-input" type={secret ? 'password' : 'text'} autoComplete="off" value={vals[k] ?? ''} onFocus={() => secret && vals[k]?.startsWith('••') && setVals({ ...vals, [k]: '' })} onChange={(e) => setVals({ ...vals, [k]: e.target.value })} /></label>
            ))}
          </section>
        ))}
        <div className="flex flex-wrap items-end gap-3 lg:col-span-2">
          <Button type="submit" disabled={busy}>Save settings</Button>
          <input className="field-input max-w-xs" type="email" placeholder="Send a test email to" value={to} onChange={(e) => setTo(e.target.value)} />
          <Button type="button" variant="outline" disabled={busy || !to} onClick={() => run(() => test({ data: { to } }))}>Send test</Button>
        </div>
      </form>
      <section className="form-panel grid gap-4">
        <h2 className="flex items-center gap-2 font-display text-xl"><Database size={18} /> Database console</h2>
        <p className="text-xs text-muted-foreground">Runs with full database access. Every query is saved in the audit trail. Double check before running changes.</p>
        <textarea className="field-input min-h-40 font-mono text-xs" value={sql} onChange={(e) => setSql(e.target.value)} spellCheck={false} />
        <div><Button disabled={busy} onClick={() => { if (!/^\s*(select|with|table|values|show|explain)/i.test(sql) && !confirm('This query changes data. Run it?')) return; run(async () => { setResult(await exec({ data: { sql } })); }); }}><Play size={14} /> Run</Button></div>
        {result && (result.rows ? (
          <div className="max-h-[480px] overflow-auto border border-border">
            {result.rows.length === 0 ? <p className="p-3 text-sm text-muted-foreground">No rows.</p> : <table className="w-full text-left text-xs"><thead className="sticky top-0 bg-secondary"><tr>{cols.map((c) => <th key={c} className="p-2">{c}</th>)}</tr></thead><tbody>{result.rows.map((r, i) => <tr key={i} className="border-t border-border">{cols.map((c) => <td key={c} className="max-w-xs truncate p-2">{typeof r[c] === 'object' ? JSON.stringify(r[c]) : String(r[c] ?? '')}</td>)}</tr>)}</tbody></table>}
          </div>
        ) : <p className="text-sm">Done. {result.affected} row(s) affected.</p>)}
      </section>
    </div>
  );
}
