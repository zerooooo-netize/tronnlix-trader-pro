import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CircleAlert,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Brand } from '@/components/brand';
import { supabase } from '@/integrations/supabase/client';

type Mode = 'login' | 'register';
type View = 'login' | 'register' | 'forgot';

export const Route = createFileRoute('/auth')({
  validateSearch: (s: Record<string, unknown>) => ({
    mode: s['mode'] === 'register' ? ('register' as const) : ('login' as const),
    redirect: typeof s['redirect'] === 'string' ? s['redirect'] : undefined,
  }),
  head: () => ({
    meta: [
      { title: 'Sign in or create an account, Tronnlix Trade' },
      {
        name: 'description',
        content:
          'Access your Tronnlix Trade account securely, or create a new one in a few minutes.',
      },
      { property: 'og:title', content: 'Sign in, Tronnlix Trade' },
      {
        property: 'og:description',
        content:
          'Access your Tronnlix Trade account securely, or create a new one in a few minutes.',
      },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
    ],
  }),
  component: Auth,
});

function Auth() {
  const { mode, redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [view, setView] = useState<View>(mode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});

  useEffect(() => {
    setView(mode);
  }, [mode]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: redirect ?? '/dashboard', replace: true });
    });
  }, [navigate, redirect]);

  const emailValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), [email]);
  const passwordValid = password.length >= 6;
  const canSubmit =
    view === 'forgot'
      ? emailValid
      : view === 'register'
        ? emailValid && passwordValid && name.trim().length > 1
        : emailValid && passwordValid;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      if (view === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setNotice('If this address is registered, a reset link is on its way.');
      } else if (view === 'register') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`,
            data: { full_name: name },
          },
        });
        if (error) throw error;
        if (data.session) navigate({ to: redirect ?? '/dashboard' });
        else
          setNotice(
            'Check your email to confirm your account, then sign in to continue.'
          );
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: redirect ?? '/dashboard' });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  function switchView(next: View) {
    setView(next);
    setError('');
    setNotice('');
  }

  const headline =
    view === 'register'
      ? 'Create your account'
      : view === 'forgot'
        ? 'Reset your password'
        : 'Welcome back.';
  const subline =
    view === 'register'
      ? 'A few details and you are in. Verification unlocks funding and copy trading.'
      : view === 'forgot'
        ? 'Enter your email and we will send a secure reset link.'
        : 'Sign in to pick up where you left off.';

  return (
    <main className="grid min-h-dvh bg-background lg:grid-cols-[1.05fr_1fr]">
      {/* ------------------------------------------------------------
       * Brand panel
       * ---------------------------------------------------------- */}
      <aside className="relative hidden overflow-hidden border-r border-border/70 bg-secondary/40 lg:flex lg:flex-col">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.06] text-foreground [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
        />
        <div className="relative flex flex-1 flex-col p-10 xl:p-14">
          <Brand />

          <div className="mt-auto max-w-lg">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              A better view of what is next
            </span>
            <h1 className="mt-6 font-display text-5xl font-medium leading-[1.05] tracking-tight text-foreground xl:text-6xl">
              Move with clarity.
              <br />
              <span className="text-muted-foreground">Trade with intent.</span>
            </h1>
            <p className="mt-6 max-w-md text-[15px] leading-7 text-muted-foreground">
              One considered place for your account, your decisions and the
              strategies you choose to follow.
            </p>

            <ul className="mt-10 grid gap-3 text-sm">
              {[
                { icon: ShieldCheck, label: 'Verification and activity logs in one place' },
                { icon: Sparkles, label: 'Follow verified trading experts' },
                { icon: Check, label: 'Pause, resume or stop any allocation' },
              ].map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2.5 text-muted-foreground">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mt-14 flex items-center justify-between border-t border-border/60 pt-6 text-[11px] text-muted-foreground">
            <span>2026 Tronnlix Trade</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              All systems operational
            </span>
          </div>
        </div>
      </aside>

      {/* ------------------------------------------------------------
       * Form panel
       * ---------------------------------------------------------- */}
      <section className="flex flex-col">
        {/* Mobile brand strip */}
        <div className="flex items-center justify-between border-b border-border/70 px-5 py-4 lg:hidden">
          <Brand />
          <Link
            to="/"
            className="text-[12.5px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Back to home
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-10 sm:px-8 lg:px-12 lg:py-14">
          <div className="w-full max-w-[400px]">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Tronnlix / Account access
            </span>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={view}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              >
                <h2 className="mt-4 font-display text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
                  {headline}
                </h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{subline}</p>
              </motion.div>
            </AnimatePresence>

            {notice && (
              <div
                role="status"
                className="form-notice mt-6 flex items-start gap-3 text-sm"
              >
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <span>{notice}</span>
              </div>
            )}
            {error && (
              <div
                role="alert"
                className="form-error mt-6 flex items-start gap-3 text-sm"
              >
                <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={submit} className="mt-8 grid gap-5" noValidate>
              {view === 'register' && (
                <label className="field-label">
                  Full name
                  <input
                    className="field-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="name"
                    placeholder="Your full name"
                    disabled={busy}
                  />
                </label>
              )}

              <label className="field-label">
                Email address
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    className="field-input pl-9"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                    required
                    autoComplete="email"
                    placeholder="name@example.com"
                    disabled={busy}
                    aria-invalid={touched.email && !emailValid}
                  />
                </div>
                {touched.email && email !== '' && !emailValid && (
                  <span className="mt-1.5 block text-[11.5px] text-rose-600 dark:text-rose-400">
                    Enter a valid email address.
                  </span>
                )}
              </label>

              {view !== 'forgot' && (
                <label className="field-label">
                  Password
                  <div className="relative">
                    <input
                      className="field-input pr-12"
                      type={show ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                      required
                      minLength={6}
                      autoComplete={view === 'register' ? 'new-password' : 'current-password'}
                      placeholder="At least 6 characters"
                      disabled={busy}
                      aria-invalid={touched.password && !passwordValid}
                    />
                    <button
                      type="button"
                      onClick={() => setShow((v) => !v)}
                      aria-label={show ? 'Hide password' : 'Show password'}
                      aria-pressed={show}
                      className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {touched.password && password !== '' && !passwordValid && (
                    <span className="mt-1.5 block text-[11.5px] text-rose-600 dark:text-rose-400">
                      Use at least 6 characters.
                    </span>
                  )}
                </label>
              )}

              {view === 'login' && (
                <button
                  type="button"
                  onClick={() => switchView('forgot')}
                  className="-mt-2 justify-self-end text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Forgot password?
                </button>
              )}

              {view === 'forgot' && (
                <button
                  type="button"
                  onClick={() => switchView('login')}
                  className="-mt-1 justify-self-start text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Back to sign in
                </button>
              )}

              <Button
                type="submit"
                size="lg"
                disabled={busy || !canSubmit}
                className="mt-2 h-12 w-full rounded-full"
                aria-busy={busy}
              >
                {busy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Please wait
                  </>
                ) : (
                  <>
                    {view === 'register'
                      ? 'Create account'
                      : view === 'forgot'
                        ? 'Send reset link'
                        : 'Sign in'}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              {view === 'register'
                ? 'Already have an account?'
                : view === 'forgot'
                  ? 'Remember your password?'
                  : 'New to Tronnlix?'}{' '}
              <button
                type="button"
                onClick={() =>
                  switchView(view === 'login' ? 'register' : 'login')
                }
                className="font-semibold text-primary hover:underline"
              >
                {view === 'login' || view === 'forgot' ? 'Create an account' : 'Sign in'}
              </button>
            </p>

            <p className="mt-10 text-center text-[11.5px] leading-6 text-muted-foreground">
              By continuing you acknowledge the{' '}
              <Link to="/legal" className="underline hover:text-foreground">
                risk information
              </Link>{' '}
              and the{' '}
              <Link to="/legal" className="underline hover:text-foreground">
                terms of service
              </Link>
              .
            </p>

            <p className="mt-6 text-center">
              <Link
                to="/"
                className="group inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground lg:hidden"
              >
                Back to home
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
