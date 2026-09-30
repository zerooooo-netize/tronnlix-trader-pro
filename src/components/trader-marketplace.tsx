import { useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Search, LayoutGrid, List, BadgeCheck, Star, ArrowUpRight, GitCompareArrows, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Database } from '@/integrations/supabase/types';
import p1 from '@/assets/trader-portrait-1.jpg';
import p2 from '@/assets/trader-portrait-2.jpg';
import p3 from '@/assets/trader-portrait-3.jpg';

export type Trader = Database['public']['Tables']['traders']['Row'];
const portraits = [p1, p2, p3];
export function portraitFor(t: Trader, i = 0) {
  if (t.photo_url) return t.photo_url;
  const n = [...t.id].reduce((a, c) => a + c.charCodeAt(0), 0) + i;
  return portraits[n % portraits.length];
}
export const initials = (n: string) => n.split(' ').map((s) => s[0]).join('').slice(0, 2);
type Sort = 'featured' | 'roi' | 'followers' | 'risk';
const riskOrder: Record<string, number> = { Low: 1, Moderate: 2, High: 3 };

export function TraderMarketplace({ traders }: { traders: Trader[] }) {
  const [q, setQ] = useState(''), [risk, setRisk] = useState('all'), [style, setStyle] = useState('all');
  const [sort, setSort] = useState<Sort>('featured'), [view, setView] = useState<'grid' | 'list'>('grid');
  const [compare, setCompare] = useState<string[]>([]);
  const styles = useMemo(() => [...new Set(traders.map((t) => t.trading_style).filter(Boolean))] as string[], [traders]);
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return traders
      .filter((t) => (!s || t.name.toLowerCase().includes(s) || t.strategy.toLowerCase().includes(s)) && (risk === 'all' || t.risk_level === risk) && (style === 'all' || t.trading_style === style))
      .sort((a, b) => sort === 'roi' ? b.roi_12m - a.roi_12m : sort === 'followers' ? b.followers - a.followers : sort === 'risk' ? (riskOrder[a.risk_level] ?? 9) - (riskOrder[b.risk_level] ?? 9) : Number(b.featured) - Number(a.featured) || b.sort_priority - a.sort_priority);
  }, [traders, q, risk, style, sort]);
  const toggle = (id: string) => setCompare((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length < 3 ? [...c, id] : c));
  const compared = traders.filter((t) => compare.includes(t.id));

  return (
    <div>
      <div className="market-toolbar">
        <label className="market-search"><Search size={16} aria-hidden /><input aria-label="Search traders by name or strategy" placeholder="Search by name or strategy" value={q} onChange={(e) => setQ(e.target.value)} /></label>
        <select aria-label="Risk level" className="field-input market-select" value={risk} onChange={(e) => setRisk(e.target.value)}><option value="all">Any risk</option><option>Low</option><option>Moderate</option><option>High</option></select>
        {styles.length > 0 && <select aria-label="Trading style" className="field-input market-select" value={style} onChange={(e) => setStyle(e.target.value)}><option value="all">Any style</option>{styles.map((s) => <option key={s}>{s}</option>)}</select>}
        <select aria-label="Sort traders" className="field-input market-select" value={sort} onChange={(e) => setSort(e.target.value as Sort)}><option value="featured">Featured first</option><option value="roi">Highest example return</option><option value="followers">Most followed</option><option value="risk">Lowest risk</option></select>
        <div className="view-toggle" role="group" aria-label="Layout">
          <button type="button" aria-pressed={view === 'grid'} aria-label="Grid view" onClick={() => setView('grid')}><LayoutGrid size={16} /></button>
          <button type="button" aria-pressed={view === 'list'} aria-label="List view" onClick={() => setView('list')}><List size={16} /></button>
        </div>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">{list.length} of {traders.length} profiles · figures are illustrative and not verified results</p>
      {list.length === 0 ? (
        <div className="py-20 text-center"><h3 className="font-display text-2xl">No profile matches those filters.</h3><button className="mt-4 text-sm font-semibold text-primary" onClick={() => { setQ(''); setRisk('all'); setStyle('all'); }}>Clear filters</button></div>
      ) : (
        <div className={view === 'grid' ? 'mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3' : 'mt-8 grid border-t border-border'}>
          {list.map((t, i) => view === 'grid' ? (
            <article key={t.id} className="guru-tile">
              <Link to="/copy-trading/$traderId" params={{ traderId: t.id }} className="guru-photo">
                <img src={portraitFor(t, i)} alt={`Portrait of ${t.name}`} loading="lazy" width={768} height={1024} />
                {t.featured && <span className="guru-ribbon"><Star size={12} /> Featured</span>}
                <span className="guru-roi"><small>Example 12m</small>+{t.roi_12m}%</span>
              </Link>
              <div className="mt-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="flex items-center gap-1.5 font-display text-xl">{t.name}{t.verified && <BadgeCheck size={17} className="text-primary" aria-label="Identity verified by staff" />}</h3>
                  <p className="mt-1 truncate text-sm text-muted-foreground">{t.strategy}</p>
                </div>
                <span className={`risk-dot risk-${t.risk_level.toLowerCase()}`}>{t.risk_level}</span>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Button asChild size="sm" className="flex-1"><Link to="/copy-trading/$traderId" params={{ traderId: t.id }}>View profile <ArrowUpRight /></Link></Button>
                <Button size="sm" variant={compare.includes(t.id) ? 'default' : 'outline'} aria-pressed={compare.includes(t.id)} onClick={() => toggle(t.id)} aria-label={`Compare ${t.name}`}><GitCompareArrows /></Button>
              </div>
            </article>
          ) : (
            <div key={t.id} className="guru-row">
              <img src={portraitFor(t, i)} alt="" className="h-14 w-14 rounded-full object-cover" loading="lazy" />
              <div className="min-w-0 flex-1"><Link to="/copy-trading/$traderId" params={{ traderId: t.id }} className="flex items-center gap-1.5 font-semibold hover:text-primary">{t.name}{t.verified && <BadgeCheck size={15} className="text-primary" />}{t.featured && <Star size={13} className="text-primary" />}</Link><p className="truncate text-xs text-muted-foreground">{t.strategy}</p></div>
              <div className="hidden text-right sm:block"><span className="metric-label">Example 12m</span><strong className="block">+{t.roi_12m}%</strong></div>
              <div className="hidden text-right md:block"><span className="metric-label">Followers</span><strong className="block">{t.followers.toLocaleString()}</strong></div>
              <span className={`risk-dot risk-${t.risk_level.toLowerCase()}`}>{t.risk_level}</span>
              <Button size="sm" variant={compare.includes(t.id) ? 'default' : 'outline'} onClick={() => toggle(t.id)} aria-label={`Compare ${t.name}`}><GitCompareArrows /></Button>
            </div>
          ))}
        </div>
      )}
      {compared.length > 0 && (
        <div className="compare-bar" role="region" aria-label="Comparison">
          <div className="page-container">
            <div className="flex items-center justify-between"><strong className="text-sm">Comparing {compared.length} of 3</strong><button onClick={() => setCompare([])} aria-label="Clear comparison" className="p-2"><X size={16} /></button></div>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[480px] text-sm"><thead><tr className="text-left text-xs text-muted-foreground"><th className="py-1 font-normal">Profile</th><th className="font-normal">Risk</th><th className="font-normal">Example 12m</th><th className="font-normal">Win rate</th><th className="font-normal">Max drawdown</th><th className="font-normal">Followers</th></tr></thead>
                <tbody>{compared.map((t) => <tr key={t.id} className="border-t border-border"><td className="py-2 font-semibold">{t.name}</td><td>{t.risk_level}</td><td>+{t.roi_12m}%</td><td>{t.win_rate != null ? `${t.win_rate}%` : 'Not set'}</td><td>{t.max_drawdown != null ? `${t.max_drawdown}%` : 'Not set'}</td><td>{t.followers.toLocaleString()}</td></tr>)}</tbody></table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
