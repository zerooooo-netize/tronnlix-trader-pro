import { Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  ShieldCheck,
  Lock,
  Globe2,
  CircleDot,
  Twitter,
  Linkedin,
  Youtube,
} from 'lucide-react';
import { Brand } from './brand';

type FooterColumn = {
  heading: string;
  items: { label: string; to: string; external?: boolean }[];
};

const COLUMNS: FooterColumn[] = [
  {
    heading: 'Trade',
    items: [
      { label: 'Markets', to: '/markets' },
      { label: 'Copy trading', to: '/copy-trading' },
      { label: 'Pricing', to: '/pricing' },
      { label: 'Market hours', to: '/markets' },
    ],
  },
  {
    heading: 'Company',
    items: [
      { label: 'About', to: '/about' },
      { label: 'Blog', to: '/blog' },
      { label: 'Announcements', to: '/announcements' },
      { label: 'Contact', to: '/contact' },
    ],
  },
  {
    heading: 'Support',
    items: [
      { label: 'Help centre', to: '/faq' },
      { label: 'FAQ', to: '/faq' },
      { label: 'Status', to: '/status' },
      { label: 'Report an issue', to: '/contact' },
    ],
  },
  {
    heading: 'Legal',
    items: [
      { label: 'Terms of service', to: '/legal' },
      { label: 'Privacy policy', to: '/legal' },
      { label: 'Risk disclosure', to: '/legal' },
      { label: 'Cookies', to: '/legal' },
    ],
  },
];

const TRUST = [
  { icon: ShieldCheck, label: 'Segregated client funds' },
  { icon: Lock, label: '256-bit encryption' },
  { icon: ShieldCheck, label: 'Two factor authentication' },
  { icon: Globe2, label: 'Regulated in supported regions' },
];

export function SiteFooter() {
  return (
    <footer className="relative border-t border-border/70 bg-secondary">
      {/* Top: brand + digest + link columns */}
      <div className="mx-auto max-w-7xl px-5 pb-14 pt-16 sm:px-8 sm:pt-20">
        <div className="grid gap-14 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
          {/* Brand + newsletter */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <Brand />
            <p className="mt-5 max-w-md text-[15px] leading-7 text-muted-foreground">
              A considered way to access global markets. Follow verified trading
              experts, keep full control of your capital and see every move in
              plain language.
            </p>

            <form
              className="mt-8 max-w-md"
              onSubmit={(e) => e.preventDefault()}
              aria-label="Subscribe to the market digest"
            >
              <label
                htmlFor="footer-email"
                className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground"
              >
                Market digest
              </label>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <input
                  id="footer-email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="h-11 w-full rounded-full border border-border/70 bg-background/60 px-4 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="submit"
                  className="group inline-flex h-11 items-center justify-center gap-1.5 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Subscribe
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                One email each Monday. Unsubscribe anytime.
              </p>
            </form>

            <div className="mt-8 flex items-center gap-2">
              {[
                { icon: Twitter, label: 'X' },
                { icon: Linkedin, label: 'LinkedIn' },
                { icon: Youtube, label: 'YouTube' },
              ].map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="grid h-9 w-9 place-items-center rounded-full border border-border/70 text-muted-foreground transition-colors hover:border-border hover:text-foreground"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4">
            {COLUMNS.map((col) => (
              <div key={col.heading}>
                <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground">
                  {col.heading}
                </p>
                <ul className="space-y-2.5">
                  {col.items.map((item) => (
                    <li key={item.label}>
                      <Link
                        to={item.to}
                        className="text-[13.5px] text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Middle: trust row */}
      <div className="border-t border-border/60">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-4 px-5 py-6 text-[12.5px] text-muted-foreground sm:grid-cols-4 sm:px-8">
          {TRUST.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon className="h-4 w-4 shrink-0 text-primary/80" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <span>© 2026 Tronnlix Trade. All rights reserved.</span>
            <span className="hidden h-3 w-px bg-border/70 sm:block" />
            <button
              type="button"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
            >
              <Globe2 className="h-3.5 w-3.5" />
              English (Global)
            </button>
            <span className="inline-flex items-center gap-1.5">
              <CircleDot className="h-3.5 w-3.5 text-emerald-500" />
              All systems operational
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <Link to="/legal" className="transition-colors hover:text-foreground">
              Terms
            </Link>
            <Link to="/legal" className="transition-colors hover:text-foreground">
              Privacy
            </Link>
            <Link to="/legal" className="transition-colors hover:text-foreground">
              Cookies
            </Link>
          </div>
        </div>
      </div>

      {/* Risk note */}
      <div className="border-t border-border/60 bg-background/40">
        <div className="mx-auto max-w-7xl px-5 py-6 text-[11.5px] leading-6 text-muted-foreground sm:px-8">
          Trading leveraged products carries a high level of risk and can result in
          the loss of all of your capital. Copy trading is not a guarantee of
          future performance. Only trade with money you can afford to lose.
          Availability of products and services depends on your jurisdiction and
          may be restricted in some countries. Nothing on this site is financial
          advice.
        </div>
      </div>
    </footer>
  );
}
