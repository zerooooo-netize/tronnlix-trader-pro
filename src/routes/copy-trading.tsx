import { createFileRoute, Outlet, useMatches } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { supabase } from '@/integrations/supabase/client';
import { TraderMarketplace, type Trader } from '@/components/trader-marketplace';

export const Route = createFileRoute('/copy-trading')({
  head: () => ({ meta: [{ title: 'Copy Trading Marketplace | Tronnlix Trade' }, { name: 'description', content: 'Search, filter and compare trading experts by risk, style and verified performance before you choose who to follow.' }, { property: 'og:title', content: 'Copy Trading Marketplace | Tronnlix Trade' }, { property: 'og:description', content: 'Search, filter and compare trading experts by risk, style and verified performance.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  component: CopyLayout,
});

function CopyLayout() {
  const matches = useMatches();
  if (matches.some((m) => m.routeId === '/copy-trading/$traderId')) return <Outlet />;
  return <CopyPage />;
}

function CopyPage() {
  const [traders, setTraders] = useState<Trader[] | null>(null);
  useEffect(() => { supabase.from('traders').select('*').eq('status', 'active').is('deleted_at', null).then(({ data }) => setTraders(data ?? [])); }, []);
  const featured = traders?.filter((t) => t.featured).length ?? 0;
  return (
    <>
      <SiteHeader />
      <main>
        <section className="page-container grid gap-8 pb-10 pt-14 md:grid-cols-[1.3fr_.7fr] md:items-end md:pt-20">
          <div><span className="eyebrow">COPY TRADING MARKETPLACE</span><h1 className="mt-5 max-w-3xl font-display text-4xl leading-[1.05] md:text-6xl">Pick the person behind the strategy.</h1></div>
          <div className="grid grid-cols-2 gap-6 border-l border-border pl-6 text-sm"><div><span className="metric-label">Profiles</span><strong className="mt-1 block font-display text-3xl">{traders?.length ?? '...'}</strong></div><div><span className="metric-label">Featured</span><strong className="mt-1 block font-display text-3xl">{traders ? featured : '...'}</strong></div><p className="col-span-2 text-xs leading-5 text-muted-foreground">Compare risk and style side by side. Open a profile to read the approach before you allocate.</p></div>
        </section>
        <section className="page-container pb-24">
          {traders === null ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((i) => <div key={i} className="aspect-[4/5] animate-pulse rounded-lg bg-secondary" />)}</div> : <TraderMarketplace traders={traders} />}
          <p className="mt-12 max-w-3xl text-xs leading-6 text-muted-foreground">Profiles, portraits and returns shown here are illustrative and maintained by our team. They are not verified trading records. Copy trading carries risk, including loss of capital, and past performance does not predict future results.</p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
