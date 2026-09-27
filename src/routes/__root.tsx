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
import { AlertTriangle, Compass } from 'lucide-react';

import appCss from '../styles.css?url';
import { reportLovableError } from '../lib/lovable-error-reporting';
import { Button } from '@/components/ui/button';

function NotFoundComponent() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-5">
      <div className="w-full max-w-md text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-border/70 bg-card/60 text-primary">
          <Compass className="h-6 w-6" />
        </span>
        <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Error 404
        </p>
        <h1 className="mt-3 font-display text-3xl font-medium tracking-tight text-foreground">
          That page doesn't exist.
        </h1>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          The link may be old, or the page may have moved. Nothing was charged and
          your account is unaffected.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          <Button asChild className="h-10 rounded-full px-5">
            <Link to="/">Back to home</Link>
          </Button>
          <Button asChild variant="outline" className="h-10 rounded-full px-5">
            <Link to="/contact">Contact support</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();

  useEffect(() => {
    if (import.meta.env.DEV) console.error(error);
    reportLovableError(error, { boundary: 'tanstack_root_error_component' });
  }, [error]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-5">
      <div className="w-full max-w-md text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-border/70 bg-rose-500/10 text-rose-500">
          <AlertTriangle className="h-6 w-6" />
        </span>
        <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Something went wrong
        </p>
        <h1 className="mt-3 font-display text-3xl font-medium tracking-tight text-foreground">
          This page didn't load.
        </h1>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          It's on us. Try again, or head back and pick up where you left off.
        </p>

        {import.meta.env.DEV && (
          <pre className="mt-6 max-h-40 overflow-auto rounded-lg border border-border/60 bg-muted/40 p-3 text-left text-[11px] leading-5 text-muted-foreground">
            {error.message}
          </pre>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          <Button
            className="h-10 rounded-full px-5"
            onClick={async () => {
              await router.invalidate();
              reset();
            }}
          >
            Try again
          </Button>
          <Button asChild variant="outline" className="h-10 rounded-full px-5">
            <Link to="/">Back to home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'theme-color', content: '#0b0f1a' },
      { name: 'color-scheme', content: 'light dark' },
      { title: 'Tronnlix Trade' },
      {
        name: 'description',
        content: 'A considered approach to global markets and copy trading.',
      },
      { name: 'author', content: 'Tronnlix Trade' },
      { property: 'og:title', content: 'Tronnlix Trade' },
      {
        property: 'og:description',
        content: 'A considered approach to global markets and copy trading.',
      },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
    links: [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap',
      },
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
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
      <body className="min-h-dvh bg-background text-foreground">
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
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
