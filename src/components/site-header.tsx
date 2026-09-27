import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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

type NavItem = {
  label: string;
  to: string;
  panel?: {
    tagline: string;
    columns: {
      heading: string;
      items: { label: string; to: string; desc: string; icon: React.ElementType }[];
    }[];
    footer?: { label: string; to: string };
  };
};

const NAV: NavItem[] = [
  {
    label: 'Markets',
    to: '/markets',
    panel: {
      tagline: 'Live pricing across FX, metals and crypto.',
      columns: [
        {
          heading: 'Instruments',
          items: [
            { label: 'Forex majors', to: '/markets', desc: 'EUR/USD, GBP/USD, USD/JPY', icon: BarChart3 },
            { label: 'Metals', to: '/markets', desc: 'Gold, silver, platinum', icon: BarChart3 },
            { label: 'Crypto CFDs', to: '/markets', desc: 'BTC, ETH, SOL and more', icon: BarChart3 },
          ],
        },
        {
          heading: 'Tools',
          items: [
            { label: 'Economic calendar', to: '/markets', desc: 'Events that move price', icon: BookOpen },
            { label: 'Market hours', to: '/markets', desc: 'Sessions and holidays', icon: Globe2 },
            { label: 'Spreads and fees', to: '/pricing', desc: 'Transparent, no surprises', icon: Wallet },
          ],
        },
      ],
      footer: { label: 'Open the market board', to: '/markets' },
    },
  },
  {
    label: 'Copy trading',
    to: '/copy-trading',
    panel: {
      tagline: 'Follow verified traders with one tap.',
      columns: [
        {
          heading: 'Discover',
          items: [
            { label: 'Trading experts', to: '/copy-trading', desc: 'Ranked by ROI and risk', icon: Users },
            { label: 'Risk score', to: '/copy-trading', desc: 'Every strategy graded', icon: Shield },
            { label: 'Performance', to: '/copy-trading', desc: 'Verified monthly returns', icon: BarChart3 },
          ],
        },
        {
          heading: 'How it works',
          items: [
            { label: 'Allocate capital', to: '/copy-trading', desc: 'From $100 per strategy', icon: Wallet },
            { label: 'Pause or stop', to: '/copy-trading', desc: 'Full control, always', icon: Shield },
            { label: 'Read the guide', to: '/faq', desc: 'Answers in plain English', icon: BookOpen },
          ],
        },
      ],
      footer: { label: 'Browse the marketplace', to: '/copy-trading' },
    },
  },
  { label: 'Pricing', to: '/pricing' },
  { label: 'About', to: '/about' },
];

const MOBILE_GROUPS: { heading: string; items: { label: string; to: string }[] }[] = [
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
  const [scrolled, setScrolled] = useState(false);
  const [openPanel, setOpenPanel] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setSigned(!!data.user));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => setSigned(!!session));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll when the mobile drawer is open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  return (
    <header
      className={`site-header fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-border/60 bg-background/80 backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent'
      }`}
      onMouseLeave={() => setOpenPanel(null)}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-5 sm:h-[72px] sm:px-8">
        <Link to="/" className="shrink-0" aria-label="Tronnlix Trade home">
          <Brand />
        </Link>

        {/* Desktop nav with mega panels */}
        <nav className="ml-6 hidden items-center gap-1 lg:flex" aria-label="Primary">
          {NAV.map((item) => {
            const hasPanel = !!item.panel;
            const isOpen = openPanel === item.label;
            return (
              <div
                key={item.to}
                className="relative"
                onMouseEnter={() => setOpenPanel(hasPanel ? item.label : null)}
              >
                <Link
                  to={item.to}
                  className={`group inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13.5px] font-medium tracking-tight transition-colors ${
                    isOpen ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                  aria-haspopup={hasPanel || undefined}
                  aria-expanded={hasPanel ? isOpen : undefined}
                >
                  {item.label}
                  {hasPanel && (
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  )}
                </Link>

                <AnimatePresence>
                  {hasPanel && isOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute left-1/2 top-full z-50 mt-2 w-[640px] -translate-x-1/2"
                    >
                      <div className="overflow-hidden rounded-2xl border border-border/70 bg-popover/95 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.35)] backdrop-blur-xl">
                        <div className="border-b border-border/60 bg-muted/40 px-6 py-4">
                          <p className="text-[12px] uppercase tracking-[0.14em] text-muted-foreground">
                            {item.label}
                          </p>
                          <p className="mt-1 text-sm text-foreground/80">{item.panel!.tagline}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 p-4">
                          {item.panel!.columns.map((col) => (
                            <div key={col.heading} className="p-2">
                              <p className="px-2 pb-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                                {col.heading}
                              </p>
                              <ul className="space-y-1">
                                {col.items.map((sub) => {
                                  const Icon = sub.icon;
                                  return (
                                    <li key={sub.label}>
                                      <Link
                                        to={sub.to}
                                        className="flex items-start gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-accent"
                                      >
                                        <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                                          <Icon className="h-4 w-4" />
                                        </span>
                                        <span className="min-w-0">
                                          <span className="block text-[13.5px] font-medium text-foreground">
                                            {sub.label}
                                          </span>
                                          <span className="mt-0.5 block text-xs text-muted-foreground">
                                            {sub.desc}
                                          </span>
                                        </span>
                                      </Link>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          ))}
                        </div>
                        {item.panel!.footer && (
                          <div className="flex items-center justify-between border-t border-border/60 bg-muted/30 px-6 py-3.5">
                            <Link
                              to={item.panel!.footer.to}
                              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                            >
                              {item.panel!.footer.label}
                              <ArrowUpRight className="h-3.5 w-3.5" />
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

        <div className="ml-auto hidden items-center gap-2 lg:flex">
          <button
            type="button"
            className="hidden items-center gap-1.5 rounded-full border border-border/70 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground xl:inline-flex"
            aria-label="Change region"
          >
            <Globe2 className="h-3.5 w-3.5" />
            Global
          </button>
          <span className="hidden h-6 w-px bg-border/70 xl:block" />
          {signed ? (
            <Button asChild className="group h-10 rounded-full px-5">
              <Link to="/dashboard">
                Go to account
                <ArrowUpRight className="ml-1 h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild className="h-10 rounded-full px-4 text-sm">
                <Link to="/auth" search={{ mode: 'login' }}>
                  Log in
                </Link>
              </Button>
              <Button asChild className="group h-10 rounded-full px-5">
                <Link to="/auth" search={{ mode: 'register' }}>
                  Open an account
                  <ArrowUpRight className="ml-1 h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile trigger */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          className="ml-auto grid h-10 w-10 place-items-center rounded-full border border-border/70 bg-background/60 text-foreground backdrop-blur lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 top-16 z-40 bg-background/95 backdrop-blur-xl lg:hidden"
          >
            <motion.nav
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="flex h-[calc(100dvh-4rem)] flex-col overflow-y-auto px-5 pb-10 pt-6 sm:px-8"
              aria-label="Mobile"
            >
              {MOBILE_GROUPS.map((group) => (
                <div key={group.heading} className="mb-7">
                  <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                    {group.heading}
                  </p>
                  <ul className="space-y-0.5">
                    {group.items.map((item) => (
                      <li key={item.to}>
                        <Link
                          to={item.to}
                          onClick={() => setOpen(false)}
                          className="flex items-center justify-between rounded-xl px-3 py-3.5 text-[15px] font-medium text-foreground transition-colors hover:bg-accent"
                        >
                          {item.label}
                          <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <div className="mt-auto space-y-3 border-t border-border/60 pt-6">
                {signed ? (
                  <Button asChild className="h-12 w-full rounded-full text-[15px]">
                    <Link to="/dashboard" onClick={() => setOpen(false)}>
                      Go to account
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button asChild className="h-12 w-full rounded-full text-[15px]">
                      <Link to="/auth" search={{ mode: 'register' }} onClick={() => setOpen(false)}>
                        Open an account
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="h-12 w-full rounded-full text-[15px]"
                    >
                      <Link to="/auth" search={{ mode: 'login' }} onClick={() => setOpen(false)}>
                        Log in
                      </Link>
                    </Button>
                  </>
                )}
                <Link
                  to="/contact"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 pt-2 text-sm text-muted-foreground"
                >
                  <LifeBuoy className="h-4 w-4" />
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
