import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { BadgeCheck, ArrowUpRight, ArrowLeft, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { supabase } from '@/integrations/supabase/client';
import { portraitFor, type Trader } from '@/components/trader-marketplace';
import { money } from '@/lib/format';
import type { Database } from '@/integrations/supabase/types';
type Perf = Database['public']['Tables']['trader_performance']['Row'];

export const Route = createFileRoute('/copy-trading/$traderId')({
  head: () => ({ meta: [{ title: 'Trader profile | Tronnlix Trade' }, { name: 'description', content: 'Read a trading expert’s approach, risk profile and performance before you copy.' }, { property: 'og:title', content: 'Trader profile | Tronnlix Trade' }, { property: 'og:description', content: 'Approach, risk profile and performance for a Tronnlix trading expert.' }, { property: 'og:type', content: 'profile' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  component: Profile,
});

function Stat({ label, value }: { label: string; value: string }) {
  return <div><span className="metric-label">{label}</span><strong className="mt-1 block font-display text-2xl">{value}</strong></div>;
}

function Profile() {
  const { traderId } = Route.useParams();
  const [t, setT] = useState<Trader | null | undefined>(undefined);
  const [perf, setPerf] = useState<Perf[]>([]);
  const [related, setRelated] = useState<Trader[]>([]);
  const [amount, setAmount] = useState(1000);
  useEffect(() => {
    setT(undefined);
    supabase.from('traders').select('*').eq('id', traderId).eq('status', 'active').is('deleted_at', null).maybeSingle().then(({ data }) => setT(data));
    supabase.from('trader_performance').select('*').eq('trader_id', traderId).order('period_start').then(({ data }) => setPerf(data ?? []));
    supabase.from('traders').select('*').eq('status', 'active').is('deleted_at', null).neq('id', traderId).limit(3).then(({ data }) => setRelated(data ?? []));
  }, [traderId]);

  if (t === undefined) return <><SiteHeader /><main className="page-container py-20"><div className="h-80 animate-pulse rounded-lg bg-secondary" /></main></>;
  if (!t) return <><SiteHeader /><main className="page-container py-24"><h1 className="font-display text-4xl">This profile is not available.</h1><p className="mt-3 text-muted-foreground">It may have been paused or archived by our team.</p><Button asChild className="mt-8"><Link to="/copy-trading">Back to the marketplace</Link></Button></main><SiteFooter /></>;

  const monthly = t.monthly_return ?? t.roi_12m / 12;
  const max = Math.max(1, ...perf.map((p) => Math.abs(p.return_pct)));
  const rows: [string, string][] = [['Country', t.country ?? 'Not set'], ['Experience', t.experience_years ? `${t.experience_years} years` : 'Not set'], ['Trading style', t.trading_style ?? 'Not set'], ['Markets', t.markets?.join(', ') || 'Not set'], ['Languages', t.languages?.join(', ') || 'Not set'], ['Copy fee', t.copy_fee != null ? `${t.copy_fee}%` : 'Not set'], ['Minimum', t.minimum_investment != null ? money(t.minimum_investment) : 'Not set'], ['Recommended', t.recommended_investment != null ? money(t.recommended_investment) : 'Not set']];

  return (
    <>
      <SiteHeader />
      <main>
        <section className="page-container pt-8"><Link to="/copy-trading" className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft size={16} /> All traders</Link></section>
        <section className="page-container grid gap-10 pb-14 pt-4 md:grid-cols-[320px_1fr] md:gap-14">
          <div className="relative overflow-hidden rounded-lg"><img src={portraitFor(t)} alt={`Portrait of ${t.name}`} width={768} height={1024} className="aspect-[4/5] w-full object-cover" />{t.featured && <span className="guru-ribbon"><Star size={12} /> Featured</span>}</div>
          <div className="flex flex-col">
            <span className="eyebrow">{t.risk_level.toUpperCase()} RISK · {t.strategy.toUpperCase()}</span>
            <h1 className="mt-4 flex items-center gap-3 font-display text-4xl md:text-6xl">{t.name}{t.verified && <BadgeCheck className="text-primary" size={32} aria-label="Identity verified by staff" />}</h1>
            <p className="mt-5 max-w-2xl leading-8 text-muted-foreground">{t.biography || t.strategy_description || 'Our team has not published a biography for this profile yet.'}</p>
            <div className="mt-8 grid grid-cols-2 gap-6 border-y border-border py-6 sm:grid-cols-4"><Stat label="12m return" value={`+${t.roi_12m}%`} /><Stat label="Win rate" value={t.win_rate != null ? `${t.win_rate}%` : 'n/a'} /><Stat label="Max drawdown" value={t.max_drawdown != null ? `${t.max_drawdown}%` : 'n/a'} /><Stat label="Followers" value={t.followers.toLocaleString()} /></div>
            <div className="mt-8 flex flex-wrap gap-3"><Button asChild size="lg"><Link to="/traders">Copy {t.name.split(' ')[0]} <ArrowUpRight /></Link></Button><Button asChild size="lg" variant="outline"><Link to="/auth" search={{ mode: 'register' }}>Open an account</Link></Button></div>
          </div>
        </section>
        <section className="bg-secondary py-16"><div className="page-container grid gap-12 lg:grid-cols-[1.2fr_.8fr]">
          <div>
            <h2 className="font-display text-2xl">Recorded periods</h2>
            {perf.length ? <div className="mt-6 flex h-48 items-end gap-1.5" role="img" aria-label="Bar chart of recorded period returns">{perf.slice(-24).map((p) => <div key={p.id} title={`${p.period_start}: ${p.return_pct}%`} className={p.return_pct >= 0 ? 'flex-1 rounded-t bg-primary' : 'flex-1 rounded-t bg-destructive'} style={{ height: `${Math.max(4, (Math.abs(p.return_pct) / max) * 100)}%` }} />)}</div> : <p className="mt-4 text-sm text-muted-foreground">No period returns have been recorded by our team yet.</p>}
            <h2 className="mt-12 font-display text-2xl">Approach</h2>
            <p className="mt-4 leading-8 text-muted-foreground">{t.strategy_description || t.strategy}</p>
          </div>
          <div>
            <dl className="grid">{rows.map(([k, v]) => <div key={k} className="flex justify-between gap-4 border-b border-border py-3 text-sm"><dt className="text-muted-foreground">{k}</dt><dd className="text-right font-medium">{v}</dd></div>)}</dl>
            <div className="mt-8 rounded-lg bg-background p-6">
              <h3 className="font-display text-xl">What would that look like?</h3>
              <label className="field-label mt-4">Allocation (USD)<input className="field-input" type="number" min={1} value={amount} onChange={(e) => setAmount(Number(e.target.value) || 0)} /></label>
              <p className="mt-4 text-sm">At the recent average of {monthly.toFixed(2)}% a month: <strong>{money(amount * monthly / 100)}</strong> per month.</p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">A  projection from known figures. Present results can be lower, including losses.</p>
            </div>
          </div>
        </div></section>
        {related.length > 0 && <section className="page-container py-16"><h2 className="font-display text-2xl">Also worth a look</h2><div className="mt-6 grid border-t border-border">{related.map((r) => <Link key={r.id} to="/copy-trading/$traderId" params={{ traderId: r.id }} className="guru-row hover:bg-secondary"><img src={portraitFor(r)} alt="" className="h-12 w-12 rounded-full object-cover" /><div className="flex-1"><strong>{r.name}</strong><p className="text-xs text-muted-foreground">{r.strategy}</p></div><span className="text-sm">+{r.roi_12m}%</span></Link>)}</div></section>}
      </main>
      <SiteFooter />
    </>
  );
}
