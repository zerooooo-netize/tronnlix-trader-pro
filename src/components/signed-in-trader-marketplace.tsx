import { useMemo, useState, type FormEvent } from 'react';
import { Link } from '@tanstack/react-router';
import {
  ArrowUpRight,
  BadgeCheck,
  Check,
  GitCompareArrows,
  LayoutGrid,
  List,
  Search,
  SlidersHorizontal,
  Star,
  UsersRound,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { portraitFor, type Trader } from './trader-marketplace';
import { money } from '@/lib/format';

type Allocation = {
  id: string;
  trader_id: string;
  amount: number;
  status: string;
};

type Props = {
  traders: Trader[];
  allocations: Allocation[];
  balance: number;
  verified: boolean;
  busy: boolean;
  onAllocate: (traderId: string, amount: number) => Promise<void>;
};

type Sort = 'featured' | 'roi' | 'followers' | 'risk';
const riskRank: Record<string, number> = { Low: 1, Moderate: 2, High: 3 };

export function SignedInTraderMarketplace({ traders, allocations, balance, verified, busy, onAllocate }: Props) {
  const [query, setQuery] = useState('');
  const [risk, setRisk] = useState('all');
  const [style, setStyle] = useState('all');
  const [sort, setSort] = useState<Sort>('featured');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [compare, setCompare] = useState<string[]>([]);
  const [selected, setSelected] = useState<Trader | null>(null);
  const [amount, setAmount] = useState('');

  const styles = useMemo(
    () => [...new Set(traders.map((trader) => trader.trading_style).filter(Boolean))] as string[],
    [traders],
  );
  const visible = useMemo(() => {
    const search = query.trim().toLowerCase();
    return [...traders]
      .filter((trader) => {
        const matchesSearch = !search || `${trader.name} ${trader.strategy} ${trader.country ?? ''}`.toLowerCase().includes(search);
        return matchesSearch && (risk === 'all' || trader.risk_level === risk) && (style === 'all' || trader.trading_style === style);
      })
      .sort((a, b) => {
        if (sort === 'roi') return b.roi_12m - a.roi_12m;
        if (sort === 'followers') return b.followers - a.followers;
        if (sort === 'risk') return (riskRank[a.risk_level] ?? 9) - (riskRank[b.risk_level] ?? 9);
        return Number(b.featured) - Number(a.featured) || b.sort_priority - a.sort_priority;
      });
  }, [query, risk, sort, style, traders]);
  const compared = traders.filter((trader) => compare.includes(trader.id));
  const comparisonLead = compared.at(0);
  const activeIds = new Set(allocations.filter((allocation) => allocation.status === 'active').map((allocation) => allocation.trader_id));

  function toggleCompare(id: string) {
    setCompare((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length < 3 ? [...current, id] : current);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!selected) return;
    await onAllocate(selected.id, Number(amount));
    setSelected(null);
    setAmount('');
  }

  return (
    <div className="copy-hub">
      <section className="copy-hub-lead">
        <div>
          <span className="eyebrow">COPY TRADING DESK</span>
          <h2 className="mt-4 max-w-2xl font-display text-3xl md:text-4xl">Choose a strategy with the evidence in view.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">Compare approach, risk, track record and community before you allocate.</p>
        </div>
        <div className="copy-balance">
          <span className="metric-label">AVAILABLE TO ALLOCATE</span>
          <strong>{money(balance)}</strong>
          <span>{allocations.filter((item) => item.status === 'active').length} active strategies</span>
        </div>
      </section>

      <section className="copy-controls" aria-label="Trader discovery controls">
        <label className="market-search"><Search size={16} aria-hidden /><input aria-label="Search traders" placeholder="Search name, strategy or country" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        <div className="copy-filter-label"><SlidersHorizontal size={15} /><span>Filter</span></div>
        <select className="field-input market-select" aria-label="Risk level" value={risk} onChange={(event) => setRisk(event.target.value)}><option value="all">Any risk</option><option>Low</option><option>Moderate</option><option>High</option></select>
        {styles.length > 0 && <select className="field-input market-select" aria-label="Trading style" value={style} onChange={(event) => setStyle(event.target.value)}><option value="all">Any style</option>{styles.map((item) => <option key={item}>{item}</option>)}</select>}
        <select className="field-input market-select" aria-label="Sort traders" value={sort} onChange={(event) => setSort(event.target.value as Sort)}><option value="featured">Featured first</option><option value="roi">Highest ROI</option><option value="followers">Most followed</option><option value="risk">Lowest risk</option></select>
        <div className="view-toggle" role="group" aria-label="Trader layout">
          <Button type="button" variant="ghost" size="icon" aria-pressed={view === 'grid'} aria-label="Grid view" onClick={() => setView('grid')}><LayoutGrid /></Button>
          <Button type="button" variant="ghost" size="icon" aria-pressed={view === 'list'} aria-label="List view" onClick={() => setView('list')}><List /></Button>
        </div>
      </section>

      <div className="copy-results-line"><span>{visible.length} trading experts</span><span>Compare up to 3 profiles</span></div>

      {visible.length === 0 ? (
        <div className="empty"><UsersRound className="empty-icon" /><h3 className="mt-4 font-display text-2xl">No traders match those filters.</h3><Button className="mt-5" variant="outline" onClick={() => { setQuery(''); setRisk('all'); setStyle('all'); }}>Clear filters</Button></div>
      ) : (
        <div className={view === 'grid' ? 'copy-trader-grid' : 'copy-trader-list'}>
          {visible.map((trader, index) => {
            const isActive = activeIds.has(trader.id);
            const isCompared = compare.includes(trader.id);
            return (
              <article key={trader.id} className={view === 'grid' ? 'copy-trader-profile' : 'copy-trader-profile is-list'}>
                <Link to="/copy-trading/$traderId" params={{ traderId: trader.id }} className="copy-trader-photo">
                  <img src={portraitFor(trader, index)} alt={`Portrait of ${trader.name}`} loading="lazy" width={768} height={1024} />
                  <div className="copy-photo-shade" />
                  <div className="copy-photo-badges">{trader.featured && <span><Star size={12} /> Featured</span>}{isActive && <span><Check size={12} /> Following</span>}</div>
                  <div className="copy-photo-return"><small>ROI</small><strong>+{trader.roi_12m}%</strong></div>
                </Link>
                <div className="copy-trader-body">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0"><h3 className="flex items-center gap-1.5 font-display text-xl">{trader.name}{trader.verified && <BadgeCheck size={18} className="text-primary" aria-label="Verified trader" />}</h3><p className="mt-1 truncate text-xs text-muted-foreground">{trader.country ?? 'Global'} · {trader.trading_style ?? trader.strategy}</p></div>
                    <span className={`risk-dot risk-${trader.risk_level.toLowerCase()}`}>{trader.risk_level}</span>
                  </div>
                  <p className="copy-strategy">{trader.biography || trader.strategy_description || trader.strategy}</p>
                  <dl className="copy-metrics">
                    <div><dt>Win rate</dt><dd>{trader.win_rate != null ? `${trader.win_rate}%` : 'Not set'}</dd></div>
                    <div><dt>Drawdown</dt><dd>{trader.max_drawdown != null ? `${trader.max_drawdown}%` : 'Not set'}</dd></div>
                    <div><dt>Followers</dt><dd>{trader.followers.toLocaleString()}</dd></div>
                    <div><dt>Minimum</dt><dd>{money(trader.minimum_investment ?? 0)}</dd></div>
                  </dl>
                  <div className="copy-actions">
                    <Button asChild variant="outline" className="flex-1"><Link to="/copy-trading/$traderId" params={{ traderId: trader.id }}>Profile <ArrowUpRight /></Link></Button>
                    <Button className="flex-1" disabled={!balance || !verified || isActive} onClick={() => setSelected(trader)}>{isActive ? 'Following' : 'Copy trader'}</Button>
                    <Button variant={isCompared ? 'default' : 'outline'} size="icon" aria-label={`Compare ${trader.name}`} aria-pressed={isCompared} onClick={() => toggleCompare(trader.id)}><GitCompareArrows /></Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {(!balance || !verified) && <div className="copy-gate"><strong>Allocation checklist</strong><span>{verified ? 'Identity verified' : 'Complete identity verification'} · {balance ? `${money(balance)} available` : 'Add funds to continue'}</span></div>}

      {selected && (
        <div className="copy-sheet-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) setSelected(null); }}>
          <form className="copy-sheet" onSubmit={submit}>
            <div className="flex items-start gap-4"><img src={portraitFor(selected)} alt="" /><div className="min-w-0 flex-1"><span className="eyebrow">NEW ALLOCATION</span><h3 className="mt-2 truncate font-display text-2xl">Copy {selected.name}</h3></div><Button type="button" variant="ghost" size="icon" aria-label="Close allocation form" onClick={() => setSelected(null)}><X /></Button></div>
            <label className="field-label mt-7">Amount in USD<input autoFocus className="field-input" type="number" min={selected.minimum_investment ?? 1} max={balance} step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} required /></label>
            <div className="mt-3 flex justify-between text-xs text-muted-foreground"><span>Minimum {money(selected.minimum_investment ?? 1)}</span><span>Available {money(balance)}</span></div>
            <Button type="submit" size="lg" className="mt-6 w-full" disabled={busy}>Confirm allocation <ArrowUpRight /></Button>
          </form>
        </div>
      )}

      {comparisonLead && (
        <aside className="copy-compare" aria-label="Trader comparison">
          <div className="flex items-center justify-between gap-3"><strong>Compare {compared.length} of 3</strong><Button variant="ghost" size="icon" aria-label="Clear comparison" onClick={() => setCompare([])}><X /></Button></div>
          <div className="copy-compare-profiles">{compared.map((trader) => <div key={trader.id}><img src={portraitFor(trader)} alt="" /><span>{trader.name}</span><strong>+{trader.roi_12m}% ROI</strong></div>)}</div>
          <Button asChild className="w-full"><Link to="/copy-trading/$traderId" params={{ traderId: comparisonLead.id }}>Open leading profile <ArrowUpRight /></Link></Button>
        </aside>
      )}
    </div>
  );
}