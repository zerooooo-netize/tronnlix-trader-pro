import type { LucideIcon } from 'lucide-react';
import {
  CheckCircle2,
  Clock3,
  XCircle,
  AlertTriangle,
  Loader2,
  CircleDashed,
  PauseCircle,
  Ban,
  UploadCloud,
  ShieldOff,
  Sparkles,
  Inbox,
  Search,
  Users,
  Wallet,
} from 'lucide-react';

/* ---------------------------------------------------------------
 * Status
 * ------------------------------------------------------------- */

type StatusTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'muted';

type StatusConfig = {
  tone: StatusTone;
  icon?: LucideIcon;
  label?: string;
  spin?: boolean;
};

/**
 * Map every status string used across the app to a tone + icon + label.
 * Extend this map as new statuses appear. Unknown values fall back to
 * a neutral pill that renders the raw value with underscores removed.
 */
const STATUS_MAP: Record<string, StatusConfig> = {
  // Generic / system
  active: { tone: 'success', icon: CheckCircle2, label: 'Active' },
  inactive: { tone: 'muted', icon: CircleDashed, label: 'Inactive' },
  pending: { tone: 'warning', icon: Clock3, label: 'Pending' },
  processing: { tone: 'info', icon: Loader2, spin: true, label: 'Processing' },
  confirmed: { tone: 'success', icon: CheckCircle2, label: 'Confirmed' },
  completed: { tone: 'success', icon: CheckCircle2, label: 'Completed' },
  approved: { tone: 'success', icon: CheckCircle2, label: 'Approved' },
  rejected: { tone: 'danger', icon: XCircle, label: 'Rejected' },
  failed: { tone: 'danger', icon: XCircle, label: 'Failed' },
  cancelled: { tone: 'muted', icon: Ban, label: 'Cancelled' },
  suspended: { tone: 'danger', icon: ShieldOff, label: 'Suspended' },
  paused: { tone: 'warning', icon: PauseCircle, label: 'Paused' },
  warning: { tone: 'warning', icon: AlertTriangle, label: 'Warning' },

  // KYC
  unverified: { tone: 'muted', icon: CircleDashed, label: 'Unverified' },
  in_review: { tone: 'info', icon: Loader2, spin: true, label: 'In review' },
  verified: { tone: 'success', icon: CheckCircle2, label: 'Verified' },

  // Deposits / withdrawals
  awaiting_confirmation: { tone: 'warning', icon: Clock3, label: 'Awaiting confirmation' },
  awaiting_payment: { tone: 'warning', icon: Clock3, label: 'Awaiting payment' },
  underpaid: { tone: 'danger', icon: AlertTriangle, label: 'Underpaid' },
  overpaid: { tone: 'info', icon: AlertTriangle, label: 'Overpaid' },
  expired: { tone: 'muted', icon: Clock3, label: 'Expired' },
};

const TONE_CLASSES: Record<StatusTone, string> = {
  neutral:
    'bg-muted text-foreground/80 border-border/70 dark:bg-muted/60',
  info:
    'bg-sky-500/10 text-sky-700 border-sky-500/20 dark:text-sky-300',
  success:
    'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-300',
  warning:
    'bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-300',
  danger:
    'bg-rose-500/10 text-rose-700 border-rose-500/20 dark:text-rose-300',
  muted:
    'bg-muted/60 text-muted-foreground border-border/60',
};

export function Status({ value }: { value: string }) {
  const cfg = STATUS_MAP[value] ?? {
    tone: 'neutral' as const,
    label: value.replaceAll('_', ' '),
  };
  const Icon = cfg.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] font-medium tracking-tight ${TONE_CLASSES[cfg.tone]}`}
    >
      {Icon && (
        <Icon
          className={`h-3.5 w-3.5 ${cfg.spin ? 'animate-spin' : ''}`}
          aria-hidden="true"
        />
      )}
      <span className="capitalize">{cfg.label}</span>
    </span>
  );
}

/* ---------------------------------------------------------------
 * Empty
 * ------------------------------------------------------------- */

type EmptyAction = {
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: 'primary' | 'outline' | 'ghost';
};

type EmptyProps = {
  title: string;
  body: string;
  icon?: LucideIcon;
  /** Small caption above the title, e.g. "NO WALLETS" */
  eyebrow?: string;
  /** Primary action button */
  action?: EmptyAction;
  /** Secondary action, e.g. "Read the guide" */
  secondaryAction?: EmptyAction;
  /** Compact variant for tight sidebars and inline cards */
  compact?: boolean;
};

const DEFAULT_ICON_BY_TITLE: Array<[RegExp, LucideIcon]> = [
  [/wallet|deposit|balance|fund/i, Wallet],
  [/user|investor|follower|trader/i, Users],
  [/search|result|match/i, Search],
  [/ticket|message|support/i, Inbox],
  [/upload|kyc|verif|document/i, UploadCloud],
  [/wallet|deposit|balance/i, Wallet],
];

function pickDefaultIcon(title: string): LucideIcon {
  for (const [re, Icon] of DEFAULT_ICON_BY_TITLE) {
    if (re.test(title)) return Icon;
  }
  return Sparkles;
}

function ActionButton({ action }: { action: EmptyAction }) {
  const base =
    'inline-flex h-10 items-center justify-center rounded-full px-5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30';
  const styles: Record<NonNullable<EmptyAction['variant']>, string> = {
    primary:
      'bg-primary text-primary-foreground hover:bg-primary/90',
    outline:
      'border border-border/70 bg-background/60 text-foreground hover:bg-accent',
    ghost:
      'text-muted-foreground hover:text-foreground',
  };
  const cls = `${base} ${styles[action.variant ?? 'primary']}`;

  if (action.href) {
    return (
      <a href={action.href} className={cls}>
        {action.label}
      </a>
    );
  }
  return (
    <button type="button" onClick={action.onClick} className={cls}>
      {action.label}
    </button>
  );
}

export function Empty({
  title,
  body,
  icon,
  eyebrow,
  action,
  secondaryAction,
  compact = false,
}: EmptyProps) {
  const Icon = icon ?? pickDefaultIcon(title);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center text-center ${
        compact ? 'px-5 py-10' : 'px-6 py-16 sm:py-20'
      }`}
    >
      <div className="relative">
        {/* Soft halo behind the icon so it reads as a designed mark, not a glyph */}
        <div
          aria-hidden="true"
          className={`absolute inset-0 -z-10 rounded-full bg-primary/10 blur-2xl ${
            compact ? 'scale-100' : 'scale-125'
          }`}
        />
        <div
          className={`grid place-items-center rounded-2xl border border-border/70 bg-background/70 text-primary shadow-[0_8px_30px_-12px_rgba(0,0,0,0.15)] backdrop-blur ${
            compact ? 'h-12 w-12' : 'h-14 w-14'
          }`}
        >
          <Icon className={compact ? 'h-5 w-5' : 'h-6 w-6'} aria-hidden="true" />
        </div>
      </div>

      {eyebrow && (
        <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {eyebrow}
        </p>
      )}

      <h3
        className={`font-display ${
          compact ? 'mt-3 text-base' : 'mt-5 text-lg sm:text-xl'
        } text-foreground`}
      >
        {title}
      </h3>

      <p
        className={`mt-2 max-w-md text-[13.5px] leading-6 text-muted-foreground ${
          compact ? '' : 'sm:text-sm'
        }`}
      >
        {body}
      </p>

      {(action || secondaryAction) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {action && <ActionButton action={action} />}
          {secondaryAction && <ActionButton action={secondaryAction} />}
        </div>
      )}
    </div>
  );
}
