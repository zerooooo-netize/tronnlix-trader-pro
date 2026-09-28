import { Link } from '@tanstack/react-router';
import { useEffect, useRef, useState, type ElementType } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  Menu,
  X,
  ArrowUpRight,
  ChevronDown,
  BarChart3,
  Users,
  Wallet,
  Shield,
  Globe2,
  BookOpen,
  LifeBuoy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Brand } from './brand';
import { supabase } from '@/integrations/supabase/client';

type PanelItem = {
  label: string;
  to: string;
  desc: string;
  icon: ElementType;
};

type PanelColumn = {
  heading: string;
  items: PanelItem[];
};

type NavItem = {
  label: string;
  to: string;
  panel?: {
    eyebrow: string;
    tagline: string;
    columns: PanelColumn[];
    footer?: {
      label: string;
      to: string;
    };
  };
};

const NAV: NavItem[] = [
  {
    label: 'Markets',
    to: '/markets',
    panel: {
      eyebrow: 'Market overview',
      tagline: 'Explore instruments, sessions and market context.',
      columns: [
        {
          heading: 'Instruments',
          items: [
            {
              label: 'Forex majors',
              to: '/markets',
              desc: 'EUR/USD, GBP/USD, USD/JPY',
              icon: BarChart3,
            },
            {
              label: 'Metals',
              to: '/markets',
              desc: 'Gold, silver and other metals',
              icon: BarChart3,
            },
            {
              label: 'Crypto CFDs',
              to: '/markets',
              desc: 'Digital assets and market context',
              icon: BarChart3,
            },
          ],
        },
        {
          heading: 'Explore',
          items: [
            {
              label: 'Market calendar',
              to: '/markets',
              desc: 'Events that can move markets',
              icon: BookOpen,
            },
            {
              label: 'Market sessions',
              to: '/markets',
              desc: 'Global trading session context',
              icon: Globe2,
            },
            {
              label: 'Pricing',
              to: '/pricing',
              desc: 'Fees and account information',
              icon: Wallet,
            },
          ],
        },
      ],
      footer: {
        label: 'Open the market board',
        to: '/markets',
      },
    },
  },
  {
    label: 'Copy trading',
    to: '/copy-trading',
    panel: {
      eyebrow: 'Copy trading',
      tagline: 'Compare strategies before allocating capital.',
      columns: [
        {
          heading: 'Discover',
          items: [
            {
              label: 'Trading experts',
              to: '/copy-trading',
              desc: 'Explore available trading strategies',
              icon: Users,
            },
            {
              label: 'Risk context',
              to: '/copy-trading',
              desc: 'Review risk alongside performance',
              icon: Shield,
            },
            {
              label: 'Performance',
              to: '/copy-trading',
              desc: 'Review reported historical results',
              icon: BarChart3,
            },
          ],
        },
        {
          heading: 'How it works',
          items: [
            {
              label: 'Allocate capital',
              to: '/copy-trading',
              desc: 'Choose an amount for a strategy',
              icon: Wallet,
            },
            {
              label: 'Manage allocations',
              to: '/copy-trading',
              desc: 'Pause or stop when available',
              icon: Shield,
            },
            {
              label: 'Read the guide',
              to: '/faq',
              desc: 'Understand copy trading in plain English',
              icon: BookOpen,
            },
          ],
        },
      ],
      footer: {
        label: 'Browse copy trading',
        to: '/copy-trading',
      },
    },
  },
  {
    label: 'Pricing',
    to: '/pricing',
  },
  {
    label: 'About',
    to: '/about',
  },
];

const MOBILE_GROUPS: {
  heading: string;
  items: { label: string; to: string }[];
}[] = [
  {
    heading: 'Trade',
    items: [
      { label: 'Markets', to: '/markets' },
      { label: 'Copy trading', to: '/copy-trading' },
      { label: 'Pricing', to: '/pricing' },
    ],
  },
  {
    heading: 'Company',
    items: [
      { label: 'About', to: '/about' },
      { label: 'Blog', to: '/blog' },
      { label: 'Announcements', to: '/announcements' },
      { label: 'Legal', to: '/legal' },
    ],
  },
  {
    heading: 'Help',
    items: [
      { label: 'FAQ', to: '/faq' },
      { label: 'Contact', to: '/contact' },
    ],
  },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [signed, setSigned] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openPanel, setOpenPanel] = useState<string | null>(null);

  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (!mounted) return;

      setSigned(!!data.session);
      setSessionReady(true);
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      setSigned(!!session);
      setSessionReady(true);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
    };

    onScroll();

    window.addEventListener('scroll', onScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (openPanel) {
          setOpenPanel(null);
        }

        if (open) {
          setOpen(false);
          requestAnimationFrame(() => {
            mobileMenuButtonRef.current?.focus();
          });
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, openPanel]);

  const closeNavigation = () => {
    setOpen(false);
    setOpenPanel(null);
  };

  const panelMotion = prefersReducedMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.01 },
      }
    : {
        initial: {
          opacity: 0,
          y: 6,
        },
        animate: {
          opacity: 1,
          y: 0,
        },
        exit: {
          opacity: 0,
          y: 4,
        },
        transition: {
          duration: 0.18,
          ease: [0.22, 1, 0.36, 1],
        },
      };

  return (
    <header
      className={[
        'site-header fixed inset-x-0 top-0 z-50',
        'transition-[background-color,border-color,box-shadow,backdrop-filter]',
        'duration-300',
        scrolled
          ? 'border-b border-border/60 bg-background/80 shadow-[0_8px_30px_-24px_rgba(0,0,0,0.45)] backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent',
      ].join(' ')}
      onMouseLeave={() => setOpenPanel(null)}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-5 sm:h-[72px] sm:px-8">
        <Link
          to="/"
          className="shrink-0 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Tronnlix Trade home"
          onClick={closeNavigation}
        >
          <Brand />
        </Link>

        {/* Desktop navigation */}
        <nav
          className="ml-6 hidden items-center gap-1 lg:flex"
          aria-label="Primary navigation"
        >
          {NAV.map((item) => {
            const hasPanel = Boolean(item.panel);
            const isOpen = openPanel === item.label;

            return (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => {
                  if (hasPanel) {
                    setOpenPanel(item.label);
                  } else {
                    setOpenPanel(null);
                  }
                }}
              >
                <Link
                  to={item.to}
                  className={[
                    'group inline-flex items-center gap-1.5 rounded-full',
                    'px-3.5 py-2 text-[13.5px] font-medium tracking-tight',
                    'outline-none transition-colors',
                    'focus-visible:ring-2 focus-visible:ring-ring',
                    isOpen
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground',
                  ].join(' ')}
                  aria-haspopup={hasPanel ? 'menu' : undefined}
                  aria-expanded={hasPanel ? isOpen : undefined}
                  onFocus={() => {
                    if (hasPanel) {
                      setOpenPanel(item.label);
                    }
                  }}
                  onClick={() => {
                    if (!hasPanel) {
                      setOpenPanel(null);
                    }
                  }}
                >
                  {item.label}

                  {hasPanel && (
                    <ChevronDown
                      aria-hidden="true"
                      className={[
                        'h-3.5 w-3.5 transition-transform duration-200',
                        isOpen ? 'rotate-180' : '',
                      ].join(' ')}
                    />
                  )}
                </Link>

                <AnimatePresence>
                  {hasPanel && isOpen && (
                    <motion.div
                      {...panelMotion}
                      className="absolute left-1/2 top-full z-50 mt-2 w-[640px] -translate-x-1/2"
                      role="menu"
                    >
                      <div className="overflow-hidden rounded-2xl border border-border/70 bg-popover/95 shadow-[0_28px_80px_-28px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                        <div className="border-b border-border/60 bg-muted/35 px-6 py-4">
                          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                            {item.panel!.eyebrow}
                          </p>

                          <p className="mt-1.5 max-w-xl text-sm leading-6 text-foreground/80">
                            {item.panel!.tagline}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 p-4">
                          {item.panel!.columns.map((column) => (
                            <div key={column.heading} className="p-2">
                              <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                {column.heading}
                              </p>

                              <ul className="space-y-1">
                                {column.items.map((sub) => {
                                  const Icon = sub.icon;

                                  return (
                                    <li key={sub.label}>
                                      <Link
                                        to={sub.to}
                                        role="menuitem"
                                        onClick={closeNavigation}
                                        className="group/item flex items-start gap-3 rounded-xl px-2 py-2.5 outline-none transition-colors hover:bg-accent focus-visible:bg-accent"
                                      >
                                        <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary transition-transform duration-200 group-hover/item:scale-[1.03]">
                                          <Icon
                                            aria-hidden="true"
                                            className="h-4 w-4"
                                          />
                                        </span>

                                        <span className="min-w-0">
                                          <span className="block text-[13.5px] font-medium text-foreground">
                                            {sub.label}
                                          </span>

                                          <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
                                            {sub.desc}
                                          </span>
                                        </span>

                                        <ArrowUpRight
                                          aria-hidden="true"
                                          className="ml-auto mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-all duration-200 group-hover/item:translate-x-0.5 group-hover/item:-translate-y-0.5 group-hover/item:opacity-100"
                                        />
                                      </Link>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          ))}
                        </div>

                        {item.panel!.footer && (
                          <div className="flex items-center justify-between border-t border-border/60 bg-muted/25 px-6 py-3.5">
                            <Link
                              to={item.panel!.footer.to}
                              onClick={closeNavigation}
                              className="group inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                            >
                              {item.panel!.footer.label}

                              <ArrowUpRight
                                aria-hidden="true"
                                className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                              />
                            </Link>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* Desktop actions */}
        <div className="ml-auto hidden items-center gap-2 lg:flex">
          <button
            type="button"
            className="hidden items-center gap-1.5 rounded-full border border-border/70 px-3 py-1.5 text-xs font-medium text-muted-foreground outline-none transition-colors hover:border-border hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring xl:inline-flex"
            aria-label="Current region: Global"
          >
            <Globe2 aria-hidden="true" className="h-3.5 w-3.5" />
            Global
          </button>

          <span
            aria-hidden="true"
            className="hidden h-6 w-px bg-border/70 xl:block"
          />

          {!sessionReady ? (
            <div
              className="h-10 w-28 animate-pulse rounded-full bg-muted"
              aria-hidden="true"
            />
          ) : signed ? (
            <Button asChild className="group h-10 rounded-full px-5">
              <Link to="/dashboard">
                Go to account
                <ArrowUpRight
                  aria-hidden="true"
                  className="ml-1 h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </Link>
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                asChild
                className="h-10 rounded-full px-4 text-sm"
              >
                <Link to="/auth" search={{ mode: 'login' }}>
                  Log in
                </Link>
              </Button>

              <Button asChild className="group h-10 rounded-full px-5">
                <Link to="/auth" search={{ mode: 'register' }}>
                  Open an account
                  <ArrowUpRight
                    aria-hidden="true"
                    className="ml-1 h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile trigger */}
        <button
          ref={mobileMenuButtonRef}
          type="button"
          onClick={() => {
            setOpen((value) => !value);
            setOpenPanel(null);
          }}
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          className="ml-auto grid h-10 w-10 place-items-center rounded-full border border-border/70 bg-background/60 text-foreground outline-none backdrop-blur transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
        >
          {open ? (
            <X aria-hidden="true" className="h-5 w-5" />
          ) : (
            <Menu aria-hidden="true" className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile navigation */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-navigation"
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
            transition={{
              duration: prefersReducedMotion ? 0.01 : 0.18,
            }}
            className="fixed inset-0 top-16 z-40 bg-background/95 backdrop-blur-xl sm:top-[72px] lg:hidden"
          >
            <motion.nav
              id="mobile-navigation"
              initial={
                prefersReducedMotion
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: -8 }
              }
              animate={{ opacity: 1, y: 0 }}
              exit={
                prefersReducedMotion
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: -8 }
              }
              transition={{
                duration: prefersReducedMotion ? 0.01 : 0.22,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="flex h-[calc(100dvh-4rem)] flex-col overflow-y-auto px-5 pb-10 pt-6 sm:h-[calc(100dvh-4.5rem)] sm:px-8"
              aria-label="Mobile navigation"
            >
              {MOBILE_GROUPS.map((group) => (
                <div key={group.heading} className="mb-7">
                  <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    {group.heading}
                  </p>

                  <ul className="space-y-0.5">
                    {group.items.map((item) => (
                      <li key={item.label}>
                        <Link
                          to={item.to}
                          onClick={closeNavigation}
                          className="group flex items-center justify-between rounded-xl px-3 py-3.5 text-[15px] font-medium text-foreground outline-none transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <span>{item.label}</span>

                          <ArrowUpRight
                            aria-hidden="true"
                            className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                          />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <div className="mt-auto space-y-3 border-t border-border/60 pt-6">
                {!sessionReady ? (
                  <div className="h-12 w-full animate-pulse rounded-full bg-muted" />
                ) : signed ? (
                  <Button
                    asChild
                    className="h-12 w-full rounded-full text-[15px]"
                  >
                    <Link to="/dashboard" onClick={closeNavigation}>
                      Go to account
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button
                      asChild
                      className="h-12 w-full rounded-full text-[15px]"
                    >
                      <Link
                        to="/auth"
                        search={{ mode: 'register' }}
                        onClick={closeNavigation}
                      >
                        Open an account
                      </Link>
                    </Button>

                    <Button
                      asChild
                      variant="outline"
                      className="h-12 w-full rounded-full text-[15px]"
                    >
                      <Link
                        to="/auth"
                        search={{ mode: 'login' }}
                        onClick={closeNavigation}
                      >
                        Log in
                      </Link>
                    </Button>
                  </>
                )}

                <Link
                  to="/contact"
                  onClick={closeNavigation}
                  className="flex items-center justify-center gap-2 rounded-lg pt-2 text-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <LifeBuoy aria-hidden="true" className="h-4 w-4" />
                  Talk to support
                </Link>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
