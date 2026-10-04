import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { getBrandSettings } from '@/lib/admin-tools.functions';
export function Brand({ compact = false }: { compact?: boolean }) {
  const [brand, setBrand] = useState<{name:string; logoUrl:string|null}>({name:'Tronnlix Trade',logoUrl:null});
  useEffect(() => { getBrandSettings().then(setBrand).catch(() => {}); }, []);
  return <Link to="/" aria-label={brand.name} className="inline-flex min-w-0 items-center gap-3 font-display text-xl font-semibold text-foreground">{brand.logoUrl ? <img src={brand.logoUrl} alt="" className="h-9 w-9 shrink-0 object-contain" /> : <span className="brand-mark shrink-0" aria-hidden="true"><span /></span>}{!compact && <span className="truncate">{brand.name}</span>}</Link>;
}
