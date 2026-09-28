import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from '@tanstack/react-router';
import { useEffect, type ReactNode } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  Compass,
  LifeBuoy,
  RefreshCw,
} from 'lucide-react';

import appCss from '../styles.css?url';
import { reportLovableError } from '../lib/lovable-error-reporting';
import { Button } from '@/components/ui/button';

function BrandMark({ tone = 'default' }: { tone?: 'default' | 'danger' }) {
  return (
    <div
      className={[
        'relative grid h-12 w-12 place-items-center overflow-hidden rounded-[15px]',
        'border shadow-[0_12px_35px_rgba(15,23,42,0.08)]',
        tone === 'danger'
          ? 'border-rose-200/80 bg-rose-50 text-rose-600 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400'
          : 'border-slate-200 bg-white text-slate-950 dark:border-white/10 dark:bg-white/[0.06] dark:text-white',
      ].join(' ')}
      aria-hidden="true"
    >
      <span
        className={[
          'absolute -right-3 -top-3 h-8 w-8 rounded-full blur-xl',
          tone === 'danger'
            ? 'bg-rose-400/20'
            : 'bg-slate-400/20 dark:bg-white/10',
        ].join(' ')}
      />

      <svg
        viewBox="0 0 24 24"
        className="relative h-6 w-6"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4 15.5L8.2 11.3L11.1 14.2L19.5 5.8"
          stroke="currentColor"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15.2 5.8H19.5V10.1"
          stroke="currentColor"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function StatusPill({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'danger';
}) {
  return (
    <span
      className={[
        'inline-flex items-center gap-2 rounded-full border px-3 py-1.5',
        'text-[11px] font-semibold uppercase tracking-[0.14em]',
        tone === 'danger'
          ? 'border-rose-200/80 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300'
          : 'border-slate-200 bg-white/80 text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400',
      ].join(' ')}
    >
      <span
        className={[
          'h-1.5 w-1.5 rounded-full',
          tone === 'danger' ? 'bg-rose-500' : 'bg-slate-400',
        ].join(' ')}
      />
      {children}
    </span>
  );
}

function MarketLine({
  points,
  className = '',
}: {
  points: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 420 120"
      preserveAspectRatio="none"
      className={`pointer-events-none absolute h-32 w-[420px] opacity-[0.08] dark:opacity-[0.11] ${className}`}
      aria-hidden="true"
    >
      <path
        d={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function PageFrame({
  children,
  eyebrow,
  tone = 'default',
}: {
  children: ReactNode;
  eyebrow: string;
  tone?: 'default' | 'danger';
}) {
  return (
    <main className="relative flex min-h-dvh overflow-hidden bg-[#f8fafc] text-slate-950 dark:bg-[#080b11] dark:text-white">
      {/* Ambient structure */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
      >
        <div className="absolute -left-32 -top-40 h-[420px] w-[420px] rounded-full bg-slate-200/50 blur-3xl dark:bg-white/[0.025]" />
        <div className="absolute -bottom-48 -right-32 h-[480px] w-[480px] rounded-full bg-slate-200/40 blur-3xl dark:bg-white/[0.02]" />

        <div
          className="absolute inset-0 opacity-[0.28] dark:opacity-[0.12]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(15,23,42,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.035) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage:
              'linear-gradient(to bottom, black 0%, transparent 75%)',
          }}
        />
      </div>

      <div className="relative mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-5 py-5 sm:px-8 sm:py-8 lg:px-12">
        {/* Minimal product header */}
        <header className="flex items-center justify-between">
          <Link
            to="/"
            className="group inline-flex items-center gap-3 rounded-xl outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-4 dark:focus-visible:ring-white/30 dark:focus-visible:ring-offset-[#080b11]"
          >
            <div className="scale-90 sm:scale-100">
              <BrandMark tone={tone} />
            </div>

            <div className="hidden sm:block">
              <div className="text-[13px] font-bold tracking-[-0.02em]">
                Tronnlix Trade
              </div>
              <div className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
                Global markets
              </div>
            </div>
          </Link>

          <StatusPill tone={tone === 'danger' ? 'danger' : 'neutral'}>
            {eyebrow}
          </StatusPill>
        </header>

        {/* Main content */}
        <div className="flex flex-1 items-center py-16 sm:py-20 lg:py-24">
          <div className="grid w-full items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.72fr)] lg:gap-20">
            {children}
          </div>
        </div>

        <footer className="flex flex-col gap-3 border-t border-slate-200/80 pt-5 text-[11px] text-slate-400 dark:border-white/[0.07] dark:text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <span>Tronnlix Trade</span>
          <span>Secure access to global markets</span>
        </footer>
      </div>
    </main>
  );
}

function NotFoundComponent() {
  return (
    <PageFrame eyebrow="Page not found">
      <section className="max-w-2xl">
        <BrandMark />

        <div className="mt-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
            Error 404
          </p>

          <h1 className="mt-4 max-w-xl text-4xl font-semibold tracking-[-0.045em] text-slate-950 dark:text-white sm:text-5xl lg:text-[58px] lg:leading-[1.02]">
            The page you're looking for has moved.
          </h1>

          <p className="mt-6 max-w-lg text-[15px] leading-7 text-slate-500 dark:text-slate-400 sm:text-base">
            The address may be outdated or the page may no longer be
            available. Your account and portfolio remain unchanged.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              className="h-11 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(15,23,42,0.14)] hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
            >
              <Link to="/">
                Back to home
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="h-11 rounded-xl border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.08]"
            >
              <Link to="/contact">
                <LifeBuoy className="mr-2 h-4 w-4" />
                Contact support
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Visual side panel */}
      <aside className="relative hidden min-h-[420px] overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/70 shadow-[0_30px_80px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-white/[0.07] dark:bg-white/[0.025] lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_20%,rgba(148,163,184,0.12),transparent_32%)] dark:bg-[radial-gradient(circle_at_72%_20%,rgba(255,255,255,0.06),transparent_32%)]" />

        <MarketLine
          className="right-[-40px] top-[105px] text-slate-900 dark:text-white"
          points="M0 92 C30 88 42 72 65 78 C91 85 101 55 126 60 C150 65 161 76 182 62 C207 45 215 58 237 43 C261 27 274 47 295 35 C321 20 335 31 356 14 C378 -3 394 11 420 3"
        />

        <div className="absolute left-8 right-8 top-8 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            TRONNLIX / ROUTING
          </span>

          <span className="rounded-full border border-slate-200 px-2.5 py-1 text-[10px] font-semibold text-slate-400 dark:border-white/10">
            404
          </span>
        </div>

        <div className="absolute bottom-8 left-8 right-8">
          <div className="flex items-end justify-between gap-5">
            <div>
              <div className="text-xs font-medium text-slate-400">
                Requested route
              </div>
              <div className="mt-2 font-mono text-sm text-slate-700 dark:text-slate-300">
                /unknown
              </div>
            </div>

            <Compass className="h-5 w-5 text-slate-300 dark:text-slate-600" />
          </div>

          <div className="mt-7 h-px bg-slate-200 dark:bg-white/[0.07]" />

          <p className="mt-5 max-w-sm text-xs leading-6 text-slate-400 dark:text-slate-500">
            Use the main navigation to continue, or return to your dashboard
            and pick up where you left off.
          </p>
        </div>
      </aside>
    </PageFrame>
  );
}

function ErrorComponent({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.error(error);
    }

    reportLovableError(error, {
      boundary: 'tanstack_root_error_component',
    });
  }, [error]);

  return (
    <PageFrame eyebrow="System notice" tone="danger">
      <section className="max-w-2xl">
        <div className="flex items-center gap-3">
          <BrandMark tone="danger" />

          <div>
            <div className="text-[13px] font-bold tracking-[-0.02em]">
              Tronnlix Trade
            </div>
            <div className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
              Secure platform
            </div>
          </div>
        </div>

        <div className="mt-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-rose-500">
            Temporary interruption
          </p>

          <h1 className="mt-4 max-w-xl text-4xl font-semibold tracking-[-0.045em] text-slate-950 dark:text-white sm:text-5xl lg:text-[58px] lg:leading-[1.02]">
            We couldn't load this page.
          </h1>

          <p className="mt-6 max-w-lg text-[15px] leading-7 text-slate-500 dark:text-slate-400 sm:text-base">
            Something interrupted the page request. Your account data is not
            affected. Try loading the page again or return to the main
            workspace.
          </p>

          {import.meta.env.DEV && (
            <details className="mt-7 max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/[0.08] dark:bg-white/[0.025]">
              <summary className="cursor-pointer px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                Developer error details
              </summary>

              <pre className="max-h-44 overflow-auto border-t border-slate-200 bg-slate-50 p-4 text-[11px] leading-5 text-slate-500 dark:border-white/[0.07] dark:bg-black/20 dark:text-slate-500">
                {error.message}
              </pre>
            </details>
          )}

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button
              className="h-11 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(15,23,42,0.14)] hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
              onClick={async () => {
                await router.invalidate();
                reset();
              }}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try again
            </Button>

            <Button
              asChild
              variant="outline"
              className="h-11 rounded-xl border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.08]"
            >
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to home
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <aside className="relative hidden min-h-[420px] overflow-hidden rounded-[28px] border border-rose-100 bg-white/70 shadow-[0_30px_80px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-rose-500/[0.12] dark:bg-white/[0.025] lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_18%,rgba(244,63,94,0.10),transparent_32%)]" />

        <MarketLine
          className="right-[-40px] top-[105px] text-rose-500"
          points="M0 50 C30 55 42 32 65 42 C90 52 102 40 125 58 C150 76 160 49 182 64 C207 81 220 54 242 67 C265 80 277 62 297 73 C323 87 340 63 360 78 C383 95 399 72 420 83"
        />

        <div className="absolute left-8 right-8 top-8 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            PLATFORM STATUS
          </span>

          <span className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[10px] font-semibold text-rose-600 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            Interrupted
          </span>
        </div>

        <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2">
          <div className="flex h-20 w-20 items-center justify-center rounded-[22px] border border-rose-100 bg-rose-50 text-rose-500 dark:border-rose-500/15 dark:bg-rose-500/10">
            <AlertTriangle className="h-8 w-8" strokeWidth={1.7} />
          </div>

          <h2 className="mt-7 text-xl font-semibold tracking-[-0.025em]">
            Your portfolio is safe
          </h2>

          <p className="mt-3 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
            This error concerns the current page request. It does not
            represent a change to your account balance or trading positions.
          </p>
        </div>

        <div className="absolute bottom-8 left-8 right-8">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 dark:border-white/[0.07] dark:bg-white/[0.025]">
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Account
              </div>
              <div className="mt-2 text-sm font-semibold">
                Unchanged
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 dark:border-white/[0.07] dark:bg-white/[0.025]">
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Action
              </div>
              <div className="mt-2 text-sm font-semibold">
                Retry request
              </div>
            </div>
          </div>
        </div>
      </aside>
    </PageFrame>
  );
}

export const Route =
  createRootRouteWithContext<{ queryClient: QueryClient }>()({
    head: () => ({
      meta: [
        { charSet: 'utf-8' },
        {
          name: 'viewport',
          content:
            'width=device-width, initial-scale=1, viewport-fit=cover',
        },
        {
          name: 'theme-color',
          content: '#080b11',
        },
        {
          name: 'color-scheme',
          content: 'light dark',
        },
        {
          title: 'Tronnlix Trade | Global Markets',
        },
        {
          name: 'description',
          content:
            'Tronnlix Trade is a premium trading platform for global markets and copy trading.',
        },
        {
          name: 'author',
          content: 'Tronnlix Trade',
        },
        {
          property: 'og:title',
          content: 'Tronnlix Trade | Global Markets',
        },
        {
          property: 'og:description',
          content:
            'Access global markets and explore professional copy trading strategies with Tronnlix Trade.',
        },
        {
          property: 'og:type',
          content: 'website',
        },
        {
          property: 'og:site_name',
          content: 'Tronnlix Trade',
        },
        {
          name: 'twitter:card',
          content: 'summary_large_image',
        },
      ],

      links: [
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com',
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossOrigin: 'anonymous',
        },
        {
          rel: 'stylesheet',
          href:
            'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap',
        },
        {
          rel: 'stylesheet',
          href: appCss,
        },
        {
          rel: 'icon',
          href: '/favicon.svg',
          type: 'image/svg+xml',
        },
      ],
    }),

    shellComponent: RootShell,
    component: RootComponent,
    notFoundComponent: NotFoundComponent,
    errorComponent: ErrorComponent,
  });

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="antialiased">
      <head>
        <HeadContent />
      </head>

      <body className="min-h-dvh bg-background text-foreground selection:bg-slate-900 selection:text-white dark:selection:bg-white dark:selection:text-slate-950">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
