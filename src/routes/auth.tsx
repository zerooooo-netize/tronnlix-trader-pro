import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CircleAlert,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Brand } from '@/components/brand';
import { supabase } from '@/integrations/supabase/client';

type View = 'login' | 'register' | 'forgot';

export const Route = createFileRoute('/auth')({
  validateSearch: (s: Record<string, unknown>) => ({
    mode: s['mode'] === 'register' ? ('register' as const) : ('login' as const),
    redirect: typeof s['redirect'] === 'string' ? s['redirect'] : undefined,
  }),

  head: () => ({
    meta: [
      {
        title: 'Sign in or create an account | Tronnlix Trade',
      },
      {
        name: 'description',
        content:
          'Securely access your Tronnlix Trade account or create a new account.',
      },
      {
        property: 'og:title',
        content: 'Account access | Tronnlix Trade',
      },
      {
        property: 'og:description',
        content:
          'Securely access your Tronnlix Trade account or create a new account.',
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        name: 'twitter:card',
        content: 'summary',
      },
    ],
  }),

  component: Auth,
});

function Auth() {
  const { mode, redirect } = Route.useSearch();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  const [view, setView] = useState<View>(mode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [busy, setBusy] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const [touched, setTouched] = useState<{
    email?: boolean;
    password?: boolean;
    name?: boolean;
  }>({});

  /*
   * Keep the local view synchronized with the URL.
   */
  useEffect(() => {
    setView(mode);
    setError('');
    setNotice('');
  }, [mode]);

  /*
   * If a session already exists, do not show the auth form.
   */
  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      try {
        const { data, error } = await supabase.auth.getUser();

        if (error) {
          /*
           * getUser can legitimately fail when there is no active session.
           * We keep the auth page visible in that case.
           */
        }

        if (mounted && data.user) {
          await navigate({
            to: redirect ?? '/dashboard',
            replace: true,
          });
          return;
        }
      } finally {
        if (mounted) {
          setCheckingSession(false);
        }
      }
    }

    checkSession();

    return () => {
      mounted = false;
    };
  }, [navigate, redirect]);

  /*
   * Also react to session changes made in another tab or by Supabase.
   */
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        session?.user &&
        (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')
      ) {
        navigate({
          to: redirect ?? '/dashboard',
          replace: true,
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, redirect]);

  const emailValid = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()),
    [email],
  );

  const passwordLengthValid = password.length >= 6;
  const passwordHasNumber = /\d/.test(password);
  const passwordHasLetter = /[A-Za-z]/.test(password);

  const nameValid = name.trim().length > 1;

  const canSubmit =
    view === 'forgot'
      ? emailValid
      : view === 'register'
        ? emailValid && passwordLengthValid && nameValid
        : emailValid && passwordLengthValid;

  function clearMessages() {
    setError('');
    setNotice('');
  }

  function getFriendlyError(message: string) {
    const normalized = message.toLowerCase();

    if (
      normalized.includes('invalid login credentials') ||
      normalized.includes('invalid email or password')
    ) {
      return 'The email or password is incorrect. Check your details and try again.';
    }

    if (normalized.includes('email not confirmed')) {
      return 'Please confirm your email address before signing in.';
    }

    if (
      normalized.includes('user already registered') ||
      normalized.includes('already been registered')
    ) {
      return 'An account with this email already exists. Try signing in instead.';
    }

    if (normalized.includes('password should be at least')) {
      return 'Your password needs to be at least 6 characters.';
    }

    if (normalized.includes('rate limit')) {
      return 'Too many attempts. Please wait a moment and try again.';
    }

    if (normalized.includes('network')) {
      return 'We could not reach the service. Check your connection and try again.';
    }

    return 'Something went wrong. Please try again.';
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit || busy) return;

    setBusy(true);
    clearMessages();

    try {
      if (view === 'forgot') {
        const { error: resetError } =
          await supabase.auth.resetPasswordForEmail(email.trim(), {
            redirectTo: `${window.location.origin}/reset-password`,
          });

        if (resetError) {
          throw resetError;
        }

        setNotice(
          'If an account exists for this email, a secure reset link has been sent.',
        );

        return;
      }

      if (view === 'register') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`,
            data: {
              full_name: name.trim(),
            },
          },
        });

        if (signUpError) {
          throw signUpError;
        }

        if (data.session) {
          await navigate({
            to: redirect ?? '/dashboard',
            replace: true,
          });
        } else {
          setNotice(
            'Your account is almost ready. Check your email to confirm your address, then sign in.',
          );
        }

        return;
      }

      const { error: signInError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (signInError) {
        throw signInError;
      }

      await navigate({
        to: redirect ?? '/dashboard',
        replace: true,
      });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.';

      setError(getFriendlyError(message));
    } finally {
      setBusy(false);
    }
  }

  function switchView(next: View) {
    setView(next);
    clearMessages();
    setTouched({});
    setShowPassword(false);
  }

  const headline =
    view === 'register'
      ? 'Create your account'
      : view === 'forgot'
        ? 'Reset your password'
        : 'Welcome back.';

  const subline =
    view === 'register'
      ? 'Set up your account to access funding, portfolios and copy trading.'
      : view === 'forgot'
        ? 'Enter your email and we will send you a secure password reset link.'
        : 'Sign in to continue to your Tronnlix Trade account.';

  if (checkingSession) {
    return (
      <main className="grid min-h-dvh place-items-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="grid h-11 w-11 place-items-center rounded-2xl border border-border/70 bg-card shadow-sm">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>

          <p className="text-xs font-medium text-muted-foreground">
            Checking your session
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-background lg:grid lg:grid-cols-[minmax(420px,0.95fr)_1.05fr]">
      {/* ============================================================
       * LEFT BRAND EXPERIENCE
       * ========================================================== */}
      <aside className="relative hidden min-h-dvh overflow-hidden border-r border-border/70 bg-secondary/30 lg:flex">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <div className="absolute -left-32 top-20 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-10 right-[-120px] h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="absolute inset-0 opacity-[0.045] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:64px_64px]" />

          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background/40 to-transparent" />
        </div>

        <div className="relative flex w-full flex-col p-10 xl:p-14">
          <div className="flex items-center justify-between">
            <Brand />

            <div className="hidden items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground backdrop-blur md:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Secure access
            </div>
          </div>

          <div className="my-auto max-w-xl py-20">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Built around your decisions
            </div>

            <h1 className="mt-7 max-w-[620px] font-display text-5xl font-medium leading-[1.02] tracking-[-0.035em] text-foreground xl:text-[64px]">
              Your account.
              <br />
              <span className="text-muted-foreground">
                Your strategy.
              </span>
            </h1>

            <p className="mt-7 max-w-lg text-[15px] leading-7 text-muted-foreground">
              Manage your account, monitor your portfolio and explore trading
              strategies from one focused workspace.
            </p>

            <div className="mt-10 grid max-w-lg gap-3 sm:grid-cols-3">
              <Feature
                icon={ShieldCheck}
                eyebrow="Account"
                title="Protected"
              />
              <Feature
                icon={Sparkles}
                eyebrow="Strategies"
                title="Curated"
              />
              <Feature
                icon={Check}
                eyebrow="Control"
                title="Flexible"
              />
            </div>

            <div className="mt-10 rounded-2xl border border-border/70 bg-background/45 p-4 backdrop-blur">
              <div className="flex items-start gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <LockKeyhole className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-sm font-medium text-foreground">
                    Account security comes first
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Verification and account activity are kept inside your
                    account workspace.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border/60 pt-6 text-[11px] text-muted-foreground">
            <span>© 2026 Tronnlix Trade</span>

            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Systems operational
            </span>
          </div>
        </div>
      </aside>

      {/* ============================================================
       * FORM EXPERIENCE
       * ========================================================== */}
      <section className="relative flex min-h-dvh flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="flex items-center justify-between border-b border-border/70 px-5 py-4 lg:hidden">
          <Brand />

          <Link
            to="/"
            className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Home
          </Link>
        </header>

        <div className="pointer-events-none absolute right-0 top-0 hidden h-80 w-80 rounded-full bg-primary/[0.045] blur-3xl lg:block" />

        <div className="relative flex flex-1 items-center justify-center px-5 py-10 sm:px-8 lg:px-12 xl:px-16">
          <div className="w-full max-w-[430px]">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Tronnlix Trade
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Account access
                </p>
              </div>

              <div className="hidden items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1.5 text-[10px] font-medium text-muted-foreground sm:flex">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                Secure
              </div>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={view}
                initial={
                  reduceMotion
                    ? false
                    : {
                        opacity: 0,
                        y: 8,
                      }
                }
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={
                  reduceMotion
                    ? undefined
                    : {
                        opacity: 0,
                        y: -5,
                      }
                }
                transition={{
                  duration: reduceMotion ? 0 : 0.2,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <h2 className="font-display text-3xl font-medium tracking-[-0.025em] text-foreground sm:text-[38px]">
                  {headline}
                </h2>

                <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                  {subline}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Alerts */}
            <AnimatePresence initial={false}>
              {notice && (
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -5 }}
                  role="status"
                  aria-live="polite"
                  className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.07] px-4 py-3.5 text-sm text-foreground"
                >
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-500/10 text-emerald-500">
                    <Check className="h-3.5 w-3.5" />
                  </span>

                  <span className="leading-6">{notice}</span>
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -5 }}
                  role="alert"
                  aria-live="assertive"
                  className="mt-6 flex items-start gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/[0.07] px-4 py-3.5 text-sm text-foreground"
                >
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-rose-500/10 text-rose-500">
                    <CircleAlert className="h-3.5 w-3.5" />
                  </span>

                  <span className="leading-6">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form
              onSubmit={submit}
              className="mt-8 grid gap-5"
              noValidate
            >
              {/* Name */}
              {view === 'register' && (
                <label className="field-label">
                  Full name

                  <input
                    className="field-input"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    onBlur={() =>
                      setTouched((current) => ({
                        ...current,
                        name: true,
                      }))
                    }
                    required
                    autoComplete="name"
                    placeholder="Your full name"
                    disabled={busy}
                    aria-invalid={touched.name && !nameValid}
                  />

                  {touched.name && name !== '' && !nameValid && (
                    <span className="mt-1.5 block text-[11.5px] text-rose-600 dark:text-rose-400">
                      Enter your full name.
                    </span>
                  )}
                </label>
              )}

              {/* Email */}
              <label className="field-label">
                Email address

                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <input
                    className="field-input pl-10"
                    type="email"
                    inputMode="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    onBlur={() =>
                      setTouched((current) => ({
                        ...current,
                        email: true,
                      }))
                    }
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

              {/* Password */}
              {view !== 'forgot' && (
                <label className="field-label">
                  <div className="flex items-center justify-between">
                    <span>Password</span>

                    {view === 'login' && (
                      <button
                        type="button"
                        onClick={() => switchView('forgot')}
                        className="text-[11.5px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      className="field-input pr-12"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      onBlur={() =>
                        setTouched((current) => ({
                          ...current,
                          password: true,
                        }))
                      }
                      required
                      minLength={6}
                      autoComplete={
                        view === 'register'
                          ? 'new-password'
                          : 'current-password'
                      }
                      placeholder={
                        view === 'register'
                          ? 'Create a password'
                          : 'Your password'
                      }
                      disabled={busy}
                      aria-invalid={
                        touched.password && !passwordLengthValid
                      }
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      aria-label={
                        showPassword
                          ? 'Hide password'
                          : 'Show password'
                      }
                      aria-pressed={showPassword}
                      className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {view === 'register' ? (
                    <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1.5">
                      <PasswordRule
                        valid={passwordLengthValid}
                        label="6+ characters"
                      />
                      <PasswordRule
                        valid={passwordHasLetter}
                        label="A letter"
                      />
                      <PasswordRule
                        valid={passwordHasNumber}
                        label="A number"
                      />
                    </div>
                  ) : (
                    touched.password &&
                    password !== '' &&
                    !passwordLengthValid && (
                      <span className="mt-1.5 block text-[11.5px] text-rose-600 dark:text-rose-400">
                        Use at least 6 characters.
                      </span>
                    )
                  )}
                </label>
              )}

              {/* Forgot password navigation */}
              {view === 'forgot' && (
                <button
                  type="button"
                  onClick={() => switchView('login')}
                  className="justify-self-start text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Back to sign in
                </button>
              )}

              {/* Submit */}
              <Button
                type="submit"
                size="lg"
                disabled={busy || !canSubmit}
                className="mt-1 h-12 w-full rounded-xl text-sm font-semibold shadow-sm"
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

            {/* Switch mode */}
            <div className="mt-7 rounded-2xl border border-border/60 bg-card/40 px-4 py-3.5 text-center">
              <p className="text-xs text-muted-foreground">
                {view === 'register'
                  ? 'Already have an account?'
                  : view === 'forgot'
                    ? 'Remember your password?'
                    : 'New to Tronnlix Trade?'}{' '}
                <button
                  type="button"
                  onClick={() =>
                    switchView(
                      view === 'login' ? 'register' : 'login',
                    )
                  }
                  className="font-semibold text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-primary"
                >
                  {view === 'login' || view === 'forgot'
                    ? 'Create an account'
                    : 'Sign in'}
                </button>
              </p>
            </div>

            {/* Legal */}
            <p className="mt-7 text-center text-[11px] leading-5 text-muted-foreground">
              By continuing, you acknowledge the{' '}
              <Link
                to="/legal"
                className="underline underline-offset-2 transition-colors hover:text-foreground"
              >
                risk information
              </Link>{' '}
              and{' '}
              <Link
                to="/legal"
                className="underline underline-offset-2 transition-colors hover:text-foreground"
              >
                terms of service
              </Link>
              .
            </p>

            {/* Mobile home */}
            <div className="mt-7 text-center lg:hidden">
              <Link
                to="/"
                className="group inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Back to home

                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Feature({
  icon: Icon,
  eyebrow,
  title,
}: {
  icon: typeof ShieldCheck;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/45 p-3.5 backdrop-blur">
      <div className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-3.5 w-3.5" />
      </div>

      <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {eyebrow}
      </p>

      <p className="mt-1 text-sm font-medium text-foreground">
        {title}
      </p>
    </div>
  );
}

function PasswordRule({
  valid,
  label,
}: {
  valid: boolean;
  label: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10.5px] font-medium ${
        valid
          ? 'text-emerald-600 dark:text-emerald-400'
          : 'text-muted-foreground'
      }`}
    >
      <span
        className={`grid h-3.5 w-3.5 place-items-center rounded-full border ${
          valid
            ? 'border-emerald-500 bg-emerald-500 text-white'
            : 'border-border'
        }`}
      >
        {valid && <Check className="h-2.5 w-2.5" />}
      </span>

      {label}
    </span>
  );
}
