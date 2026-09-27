import { Link } from '@tanstack/react-router';
export function Brand({ compact = false }: { compact?: boolean }) {
  return <Link to="/" className="inline-flex items-center gap-3 font-display text-xl font-semibold text-foreground"><span className="brand-mark" aria-hidden="true"><span /></span>{!compact && <span>tronnlix<span className="text-primary">.</span><small className="ml-2 align-middle font-sans text-[9px] font-semibold uppercase tracking-[.2em] text-muted-foreground">Trade</small></span>}</Link>;
}
