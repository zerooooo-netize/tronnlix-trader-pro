import { Link } from '@tanstack/react-router';

type BrandProps = {
  /** Show only the mark, no wordmark. */
  compact?: boolean;
  /** Render as a plain element instead of a Link (useful for previews). */
  as?: 'link' | 'static';
  /** Optional href override for the static variant. */
  className?: string;
};

function BrandMark() {
  return (
    <span
      aria-hidden="true"
      className="relative inline-grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-[0_6px_20px_-8px_rgba(0,0,0,0.45)]"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-[18px] w-[18px]"
        aria-hidden="true"
      >
        {/* Tilted square outline, reads as a trade tile */}
        <rect
          x="4.5"
          y="4.5"
          width="15"
          height="15"
          rx="2.5"
          transform="rotate(45 12 12)"
          stroke="currentColor"
          strokeWidth="1.6"
          opacity="0.9"
        />
        {/* Center dot, reads as a price marker */}
        <circle cx="12" cy="12" r="1.8" fill="currentColor" />
      </svg>
    </span>
  );
}

export function Brand({ compact = false, as = 'link', className = '' }: BrandProps) {
  const content = (
    <>
      <BrandMark />
      {!compact && (
        <span className="flex items-baseline gap-2 leading-none">
          <span className="text-[19px] font-semibold tracking-[-0.01em] text-foreground">
            tronnlix
            <span className="text-primary">.</span>
          </span>
          <span className="text-[9.5px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Trade
          </span>
        </span>
      )}
    </>
  );

  const base = `inline-flex items-center gap-2.5 transition-opacity hover:opacity-90 ${className}`;

  if (as === 'static') {
    return (
      <span className={base} aria-label="Tronnlix Trade">
        {content}
      </span>
    );
  }

  return (
    <Link to="/" className={base} aria-label="Tronnlix Trade, go to home">
      {content}
    </Link>
  );
}
