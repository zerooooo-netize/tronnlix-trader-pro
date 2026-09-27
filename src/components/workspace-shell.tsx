import { Link, useLocation, useNavigate } from '@tanstack/react-router';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Bell,
  ChartNoAxesCombined,
  ChevronRight,
  ClipboardList,
  Coins,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  Search,
  ShieldCheck,
  Sparkles,
  Ticket,
  UserRound,
  UsersRound,
  Wallet,
  X,
  type LucideIcon,
} from 'lucide-react';
import { Brand } from './brand';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

type NavItem = { label: string; to: string; icon: LucideIcon };
type NavGroup = { caption: string; items: NavItem[] };

const CLIENT_NAV: NavGroup[] = [
  {
    caption: 'Overview',
    items: [{ label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard }],
  },
  {
    caption: 'Move money',
    items: [
      { label: 'Wallet', to: '/wallet', icon: Wallet },
      { label: 'Deposit', to: '/deposit', icon: ArrowDownToLine },
      { label: 'Withdraw', to: '/withdraw', icon: ArrowUpFromLine },
    ],
  },
  {
    caption: 'Grow capital',
    items: [
      { label: 'Copy trading', to: '/traders', icon: UsersRound },
      { label: 'Portfolio', to: '/portfolio', icon: ChartNoAxesCombined },
    ],
  },
  {
    caption: 'Account',
    items: [
      { label: 'Profile and security', to: '/profile', icon: UserRound },
      { label: 'Support', to: '/support', icon: LifeBuoy },
      { label: 'Notifications', to: '/notifications', icon: Bell },
    ],
  },
];

const ADMIN_NAV_BASE: NavGroup[] = [
  {
    caption: 'Overview',
    items: [{ label: 'Dashboard', to: '/admin', icon: LayoutDashboard }],
  },
  {
    caption: 'Queues',
    items: [
      { label: 'Deposits', to: '/admin/deposits', icon: ArrowDownToLine },
      { label: 'Withdrawals', to: '/admin/withdrawals', icon: ArrowUpFromLine },
      { label: 'Verification', to: '/admin/verification', icon: ShieldCheck },
      { label: 'Support', to: '/admin/support', icon: Ticket },
    ],
  },
  {
    caption: 'Operations',
    items: [
      { label: 'Users', to: '/admin/users', icon: UsersRound },
      { label: 'Traders', to: '/admin/traders', icon: Sparkles },
      { label: 'Crypto settings', to: '/admin/crypto', icon: Coins },
    ],
  },
  {
    caption: 'System',
    items: [{ label: 'Audit log', to: '/admin/audit', icon: ClipboardList }],
  },
];

const ADMIN_SUPER_GROUP: NavGroup = {
  caption: 'Super Admin',
  items: [{ label: 'Platform settings', to: '/admin/settings', icon: ShieldCheck }],
};

type Props = {
  children: ReactNode;
  title: string;
  subtitle?: string;
  admin?: boolean;
  actions?: ReactNode;
};

export function WorkspaceShell({ children, title, subtitle, admin = false, actions }: Props) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [staff, setStaff] = useState(false);
  const [superAdmin, setSuperAdmin] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setEmail(data.user?.email ?? '');
      if (data.user) {
        const [s, sa] = await Promise.all([
          supabase.rpc('is_staff', { _user_id: data.user.id }),
          supabase.rpc('has_role', { _user_id: data.user.id, _role: 'super_admin' }),
        ]);
        setStaff(!!s.data);
        setSuperAdmin(!!sa.data);
      }
    });
  }, []);

  useEffect(() => {
    setOpen(false);
    setAccountOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setAccountOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  async function logout() {
    await supabase.auth.signOut();
    navigate({ to: '/auth', search: { mode: 'login' }, replace: true });
  }

  const adminGroups = useMemo<NavGroup[]>(() => {
    if (!superAdmin) return ADMIN_NAV_BASE;
    return [...ADMIN_NAV_BASE, ADMIN_SUPER_GROUP];
  }, [superAdmin]);

  const groups = admin ? adminGroups : CLIENT_NAV;
  const showAdminLink = !admin && staff;

  const breadcrumb = useMemo(() => {
    const parts = location.pathname.split('/').filter(Boolean);
    return parts.length ? parts : [admin ? 'admin' : 'dashboard'];
  }, [location.pathname, admin]);

  return (
    <div className="flex min-h-dvh bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-[264px] shrink-0 border-r border-border/70 bg-secondary/40 lg:flex lg:flex-col">
        <SidebarInner
          admin={admin}
          groups={groups}
          showAdminLink={showAdminLink}
          email={email}
          superAdmin={superAdmin}
          onNavigate={() => setOpen(false)}
          onLogout={logout}
        />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm lg:hidden"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <motion.aside
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-border/70 bg-background lg:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Workspace navigation"
            >
              <SidebarInner
                admin={admin}
                groups={groups}
                showAdminLink={showAdminLink}
                email={email}
                superAdmin={superAdmin}
                onNavigate={() => setOpen(false)}
                onLogout={logout}
                onClose={() => setOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/70 bg-background/80 px-4 backdrop-blur-xl sm:h-16 sm:px-6">
          <Button
            size="icon"
            variant="ghost"
            className="lg:hidden"
            aria-label="Open navigation"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-1.5 sm:flex">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {admin ? 'Admin' : 'Client'}
            </span>
            {breadcrumb.map((part, i) => (
              <span key={`${part}-${i}`} className="flex min-w-0 items-center gap-1.5">
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
                <span
                  className={`truncate text-[13px] capitalize ${
                    i === breadcrumb.length - 1
                      ? 'font-medium text-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  {part.replaceAll('-', ' ')}
                </span>
              </span>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <button
              type="button"
              className="hidden h-9 items-center gap-2 rounded-full border border-border/70 bg-background/60 px-3 text-[12.5px] text-muted-foreground transition-colors hover:text-foreground md:flex"
              aria-label="Search"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Search</span>
              <kbd className="ml-2 rounded border border-border/70 bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                ⌘K
              </kbd>
            </button>

            <Link
              to={admin ? '/admin' : '/notifications'}
              aria-label="Notifications"
              className="relative grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Bell className="h-4 w-4" />
              <span
                aria-hidden="true"
                className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary"
              />
            </Link>

            {staff && (
              <span className="hidden rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10.5px] font-medium uppercase tracking-wide text-primary sm:inline-block">
                {superAdmin ? 'Super Admin' : 'Admin'}
              </span>
            )}

            <div className="relative">
              <button
                type="button"
                onClick={() => setAccountOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={accountOpen}
                className="grid h-9 w-9 place-items-center rounded-full bg-primary font-semibold text-primary-foreground transition-transform hover:scale-[1.03]"
              >
                {email[0]?.toUpperCase() || 'T'}
              </button>

              <AnimatePresence>
                {accountOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setAccountOpen(false)}
                      aria-hidden="true"
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.16 }}
                      role="menu"
                      className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-xl border border-border/70 bg-popover/95 shadow-lg backdrop-blur-xl"
                    >
                      <div className="border-b border-border/60 px-4 py-3">
                        <p className="truncate text-xs text-muted-foreground">Signed in as</p>
                        <p className="mt-0.5 truncate text-sm font-medium text-foreground">
                          {email || 'Account'}
                        </p>
                      </div>
                      <div className="py-1">
                        <Link
                          to="/profile"
                          role="menuitem"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-foreground/90 transition-colors hover:bg-accent"
                          onClick={() => setAccountOpen(false)}
                        >
                          <UserRound className="h-4 w-4" />
                          Profile and security
                        </Link>
                        <Link
                          to="/notifications"
                          role="menuitem"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-foreground/90 transition-colors hover:bg-accent"
                          onClick={() => setAccountOpen(false)}
                        >
                          <Bell className="h-4 w-4" />
                          Notifications
                        </Link>
                      </div>
                      <div className="border-t border-border/60 py-1">
                        <button
                          type="button"
                          onClick={logout}
                          role="menuitem"
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground/90 transition-colors hover:bg-accent"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12">
          <div className="mx-auto w-full max-w-[1180px]">
            <motion.header
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
            >
              <div className="min-w-0">
                <h1 className="font-display text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
                  {title}
                </h1>
                {subtitle && (
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
                    {subtitle}
                  </p>
                )}
              </div>
              {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
            </motion.header>

            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarInner({
  admin,
  groups,
  showAdminLink,
  email,
  superAdmin,
  onNavigate,
  onLogout,
  onClose,
}: {
  admin: boolean;
  groups: NavGroup[];
  showAdminLink: boolean;
  email: string;
  superAdmin: boolean;
  onNavigate: () => void;
  onLogout: () => void;
  onClose?: () => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between px-5 pb-5 pt-6">
        <Link to={admin ? '/admin' : '/dashboard'} aria-label="Home" onClick={onNavigate}>
          <Brand />
        </Link>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close navigation"
            className="lg:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="px-4">
        <div className="flex items-center gap-2.5 rounded-xl border border-border/70 bg-background/60 px-3 py-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/10 text-primary">
            {admin ? <ShieldCheck className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
          </span>
          <div className="min-w-0">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {admin ? 'Administration' : 'Client portal'}
            </p>
            <p className="truncate text-[12.5px] font-medium text-foreground">Tronnlix Trade</p>
          </div>
        </div>
      </div>

      <nav className="mt-4 flex-1 overflow-y-auto px-3 pb-4" aria-label={admin ? 'Admin' : 'Client'}>
        {groups.map((group) => (
          <div key={group.caption} className="mb-4 last:mb-0">
            <p className="px-3 pb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/80">
              {group.caption}
            </p>
            <ul className="space-y-0.5">
              {group.items.map(({ label, to, icon: Icon }) => (
                <li key={to}>
                  <Link
                    to={to}
                    onClick={onNavigate}
                    activeOptions={{ exact: true }}
                    className="group relative flex items-center gap-3 rounded-xl px-3 py-2 text-[13.5px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    activeProps={{
                      className:
                        'relative flex items-center gap-3 rounded-xl px-3 py-2 text-[13.5px] font-medium bg-primary/10 text-primary',
                    }}
                  >
                    {({ isActive }: { isActive: boolean }) => (
                      <>
                        {isActive && (
                          <motion.span
                            layoutId={`nav-active-${admin ? 'a' : 'c'}`}
                            className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary"
                            transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                          />
                        )}
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{label}</span>
                      </>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {showAdminLink && (
          <div className="mt-6 border-t border-border/60 pt-4">
            <Link
              to="/admin"
              onClick={onNavigate}
              className="group flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/[0.06] px-3 py-2.5 text-[13px] font-medium text-primary transition-colors hover:bg-primary/10"
            >
              <ShieldCheck className="h-4 w-4" />
              <span className="flex-1">Administration</span>
              <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        )}
      </nav>

      <div className="border-t border-border/60 p-3">
        <div className="flex items-center gap-2.5 rounded-xl px-2 py-2">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {email[0]?.toUpperCase() || 'T'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12.5px] font-medium text-foreground">
              {email ? email.split('@')[0] : 'Account'}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              {superAdmin ? 'Super Admin' : admin ? 'Admin' : 'Client'}
            </p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            aria-label="Sign out"
            className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );
}
