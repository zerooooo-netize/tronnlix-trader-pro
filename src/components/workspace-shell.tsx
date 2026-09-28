import { Link, useLocation, useNavigate } from '@tanstack/react-router';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
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
  Ticket,
  UserRound,
  UsersRound,
  Wallet,
  X,
  type LucideIcon,
} from 'lucide-react';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { Brand } from './brand';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

type NavItem = {
  label: string;
  to: string;
  icon: LucideIcon;
};

type NavGroup = {
  caption: string;
  items: NavItem[];
};

const CLIENT_NAV: NavGroup[] = [
  {
    caption: 'Overview',
    items: [
      {
        label: 'Dashboard',
        to: '/dashboard',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    caption: 'Move money',
    items: [
      {
        label: 'Wallet',
        to: '/wallet',
        icon: Wallet,
      },
      {
        label: 'Deposit',
        to: '/deposit',
        icon: ArrowDownToLine,
      },
      {
        label: 'Withdraw',
        to: '/withdraw',
        icon: ArrowUpFromLine,
      },
    ],
  },
  {
    caption: 'Grow capital',
    items: [
      {
        label: 'Copy trading',
        to: '/traders',
        icon: UsersRound,
      },
      {
        label: 'Portfolio',
        to: '/portfolio',
        icon: ChartNoAxesCombined,
      },
    ],
  },
  {
    caption: 'Account',
    items: [
      {
        label: 'Profile and security',
        to: '/profile',
        icon: UserRound,
      },
      {
        label: 'Support',
        to: '/support',
        icon: LifeBuoy,
      },
      {
        label: 'Notifications',
        to: '/notifications',
        icon: Bell,
      },
    ],
  },
];

const ADMIN_NAV_BASE: NavGroup[] = [
  {
    caption: 'Overview',
    items: [
      {
        label: 'Dashboard',
        to: '/admin',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    caption: 'Queues',
    items: [
      {
        label: 'Deposits',
        to: '/admin/deposits',
        icon: ArrowDownToLine,
      },
      {
        label: 'Withdrawals',
        to: '/admin/withdrawals',
        icon: ArrowUpFromLine,
      },
      {
        label: 'Verification',
        to: '/admin/verification',
        icon: ShieldCheck,
      },
      {
        label: 'Support',
        to: '/admin/support',
        icon: Ticket,
      },
    ],
  },
  {
    caption: 'Operations',
    items: [
      {
        label: 'Users',
        to: '/admin/users',
        icon: UsersRound,
      },
      {
        label: 'Traders',
        to: '/admin/traders',
        icon: ShieldCheck,
      },
      {
        label: 'Crypto settings',
        to: '/admin/crypto',
        icon: Coins,
      },
    ],
  },
  {
    caption: 'System',
    items: [
      {
        label: 'Audit log',
        to: '/admin/audit',
        icon: ClipboardList,
      },
    ],
  },
];

const ADMIN_SUPER_GROUP: NavGroup = {
  caption: 'Super Admin',
  items: [
    {
      label: 'Platform settings',
      to: '/admin/settings',
      icon: ShieldCheck,
    },
  ],
};

type Props = {
  children: ReactNode;
  title: string;
  subtitle?: string;
  admin?: boolean;
  actions?: ReactNode;
};

export function WorkspaceShell({
  children,
  title,
  subtitle,
  admin = false,
  actions,
}: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [staff, setStaff] = useState(false);
  const [superAdmin, setSuperAdmin] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const accountButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  /*
   * Load authenticated identity and role state.
   *
   * These checks control UI visibility only.
   * Actual authorization must continue to be enforced by
   * Supabase RLS policies and secure RPC functions.
   */
  useEffect(() => {
    let mounted = true;

    async function loadIdentity() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      setEmail(user?.email ?? '');

      if (!user) {
        setStaff(false);
        setSuperAdmin(false);
        return;
      }

      const [staffResult, superAdminResult] = await Promise.all([
        supabase.rpc('is_staff', {
          _user_id: user.id,
        }),
        supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'super_admin',
        }),
      ]);

      if (!mounted) return;

      setStaff(Boolean(staffResult.data));
      setSuperAdmin(Boolean(superAdminResult.data));
    }

    loadIdentity();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * Close transient UI when navigating.
   */
  useEffect(() => {
    setMobileOpen(false);
    setAccountOpen(false);
  }, [location.pathname]);

  /*
   * Escape closes drawers and menus.
   */
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;

      if (accountOpen) {
        setAccountOpen(false);

        requestAnimationFrame(() => {
          accountButtonRef.current?.focus();
        });

        return;
      }

      if (mobileOpen) {
        setMobileOpen(false);

        requestAnimationFrame(() => {
          mobileMenuButtonRef.current?.focus();
        });
      }
    }

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [accountOpen, mobileOpen]);

  /*
   * Prevent the page behind the mobile drawer from scrolling.
   */
  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  async function logout() {
    if (signingOut) return;

    setSigningOut(true);

    try {
      await supabase.auth.signOut();

      navigate({
        to: '/auth',
        search: {
          mode: 'login',
        },
        replace: true,
      });
    } finally {
      setSigningOut(false);
    }
  }

  const adminGroups = useMemo<NavGroup[]>(() => {
    if (!superAdmin) return ADMIN_NAV_BASE;

    return [...ADMIN_NAV_BASE, ADMIN_SUPER_GROUP];
  }, [superAdmin]);

  const groups = admin ? adminGroups : CLIENT_NAV;

  const showAdminLink = !admin && staff;

  const breadcrumb = useMemo(() => {
    const parts = location.pathname.split('/').filter(Boolean);

    return parts.length
      ? parts
      : [admin ? 'admin' : 'dashboard'];
  }, [location.pathname, admin]);

  const displayRole = superAdmin
    ? 'Super Admin'
    : admin
      ? 'Admin'
      : 'Client';

  return (
    <div className="flex min-h-dvh bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-[264px] shrink-0 border-r border-border/70 bg-secondary/30 lg:flex lg:flex-col">
        <SidebarInner
          admin={admin}
          groups={groups}
          showAdminLink={showAdminLink}
          email={email}
          superAdmin={superAdmin}
          displayRole={displayRole}
          onNavigate={() => setMobileOpen(false)}
          onLogout={logout}
          signingOut={signingOut}
        />
      </aside>

      {/* Mobile navigation */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="workspace-scrim"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-40 bg-foreground/35 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />

            <motion.aside
              key="workspace-drawer"
              initial={
                reduceMotion
                  ? false
                  : {
                      x: '-100%',
                    }
              }
              animate={{ x: 0 }}
              exit={
                reduceMotion
                  ? undefined
                  : {
                      x: '-100%',
                    }
              }
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : {
                      duration: 0.24,
                      ease: [0.22, 1, 0.36, 1],
                    }
              }
              className="fixed inset-y-0 left-0 z-50 flex w-[min(88vw,300px)] flex-col border-r border-border/70 bg-background shadow-2xl lg:hidden"
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
                displayRole={displayRole}
                onNavigate={() => setMobileOpen(false)}
                onLogout={logout}
                onClose={() => {
                  setMobileOpen(false);

                  requestAnimationFrame(() =>
                    mobileMenuButtonRef.current?.focus()
                  );
                }}
                signingOut={signingOut}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main workspace */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/70 bg-background/85 px-4 backdrop-blur-xl sm:h-16 sm:px-6">
          <Button
            ref={mobileMenuButtonRef}
            size="icon"
            variant="ghost"
            className="shrink-0 lg:hidden"
            aria-label="Open navigation"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="hidden min-w-0 items-center gap-1.5 sm:flex"
          >
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.17em] text-muted-foreground">
              {admin ? 'Admin' : 'Client'}
            </span>

            {breadcrumb.map((part, index) => (
              <span
                key={`${part}-${index}`}
                className="flex min-w-0 items-center gap-1.5"
              >
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />

                <span
                  className={
                    index === breadcrumb.length - 1
                      ? 'truncate text-[13px] font-medium capitalize text-foreground'
                      : 'truncate text-[13px] capitalize text-muted-foreground'
                  }
                >
                  {part.replaceAll('-', ' ')}
                </span>
              </span>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            {/* Search */}
            <button
              type="button"
              disabled
              className="hidden h-9 cursor-default items-center gap-2 rounded-full border border-border/70 bg-background/60 px-3 text-[12.5px] text-muted-foreground md:flex"
              aria-label="Search is not available yet"
              title="Search will be available soon"
            >
              <Search className="h-3.5 w-3.5" />

              <span>Search</span>

              <kbd className="ml-2 rounded border border-border/70 bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                ⌘K
              </kbd>
            </button>

            {/* Notifications */}
            <Link
              to={admin ? '/admin' : '/notifications'}
              aria-label={
                admin
                  ? 'Open administration'
                  : 'Open notifications'
              }
              className="relative grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Bell className="h-4 w-4" />

              <span
                aria-hidden="true"
                className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary"
              />
            </Link>

            {/* Role badge */}
            {staff && (
              <span className="hidden rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary sm:inline-flex">
                {displayRole}
              </span>
            )}

            {/* Account */}
            <div className="relative">
              <button
                ref={accountButtonRef}
                type="button"
                onClick={() => setAccountOpen((value) => !value)}
                aria-haspopup="menu"
                aria-expanded={accountOpen}
                aria-label="Open account menu"
                className="grid h-9 w-9 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2"
              >
                {email[0]?.toUpperCase() || 'T'}
              </button>

              <AnimatePresence>
                {accountOpen && (
                  <>
                    <button
                      type="button"
                      className="fixed inset-0 z-40 cursor-default"
                      onClick={() => setAccountOpen(false)}
                      aria-label="Close account menu"
                    />

                    <motion.div
                      initial={
                        reduceMotion
                          ? false
                          : {
                              opacity: 0,
                              y: 4,
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
                              y: 4,
                            }
                      }
                      transition={{
                        duration: reduceMotion ? 0 : 0.16,
                      }}
                      role="menu"
                      aria-label="Account menu"
                      className="absolute right-0 top-full z-50 mt-2 w-[min(88vw,260px)] overflow-hidden rounded-2xl border border-border/70 bg-popover/95 shadow-xl backdrop-blur-xl"
                    >
                      <div className="border-b border-border/60 px-4 py-3.5">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          Signed in as
                        </p>

                        <p className="mt-1 truncate text-sm font-medium text-foreground">
                          {email || 'Account'}
                        </p>

                        <p className="mt-1 text-[11px] capitalize text-muted-foreground">
                          {displayRole}
                        </p>
                      </div>

                      <div className="p-1.5">
                        <AccountMenuLink
                          to="/profile"
                          icon={UserRound}
                          onClick={() => setAccountOpen(false)}
                        >
                          Profile and security
                        </AccountMenuLink>

                        <AccountMenuLink
                          to="/notifications"
                          icon={Bell}
                          onClick={() => setAccountOpen(false)}
                        >
                          Notifications
                        </AccountMenuLink>
                      </div>

                      <div className="border-t border-border/60 p-1.5">
                        <button
                          type="button"
                          onClick={logout}
                          disabled={signingOut}
                          role="menuitem"
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-foreground/90 transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
                        >
                          <LogOut className="h-4 w-4" />

                          {signingOut
                            ? 'Signing out...'
                            : 'Sign out'}
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
              initial={
                reduceMotion
                  ? false
                  : {
                      opacity: 0,
                      y: 4,
                    }
              }
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: reduceMotion ? 0 : 0.3,
                ease: [0.22, 1, 0.36, 1],
              }}
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

              {actions && (
                <div className="flex shrink-0 flex-wrap gap-2">
                  {actions}
                </div>
              )}
            </motion.header>

            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function AccountMenuLink({
  to,
  icon: Icon,
  children,
  onClick,
}: {
  to: '/profile' | '/notifications';
  icon: LucideIcon;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      to={to}
      role="menuitem"
      onClick={onClick}
      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-foreground/90 transition-colors hover:bg-accent"
    >
      <Icon className="h-4 w-4 text-muted-foreground" />
      {children}
    </Link>
  );
}

function SidebarInner({
  admin,
  groups,
  showAdminLink,
  email,
  displayRole,
  onNavigate,
  onLogout,
  onClose,
  signingOut,
}: {
  admin: boolean;
  groups: NavGroup[];
  showAdminLink: boolean;
  email: string;
  superAdmin: boolean;
  displayRole: string;
  onNavigate: () => void;
  onLogout: () => void;
  onClose?: () => void;
  signingOut: boolean;
}) {
  return (
    <>
      {/* Brand */}
      <div className="flex items-center justify-between px-5 pb-5 pt-6">
        <Link
          to={admin ? '/admin' : '/dashboard'}
          aria-label="Tronnlix Trade home"
          onClick={onNavigate}
        >
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

      {/* Workspace identity */}
      <div className="px-4">
        <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-background/70 px-3.5 py-3">
          <div
            aria-hidden="true"
            className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-primary/10 blur-2xl"
          />

          <div className="relative min-w-0">
            <p className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {admin ? 'Administration' : 'Client portal'}
            </p>

            <p className="mt-0.5 truncate text-[12.5px] font-medium text-foreground">
              Tronnlix broker
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav
        className="mt-5 flex-1 overflow-y-auto px-3 pb-4"
        aria-label={
          admin
            ? 'Administration navigation'
            : 'Client navigation'
        }
      >
        {groups.map((group) => (
          <div
            key={group.caption}
            className="mb-5 last:mb-0"
          >
            <p className="px-3 pb-2 text-[9.5px] font-semibold uppercase tracking-[0.17em] text-muted-foreground/75">
              {group.caption}
            </p>

            <ul className="space-y-0.5">
              {group.items.map(
                ({ label, to, icon: Icon }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      onClick={onNavigate}
                      activeOptions={{
                        exact: true,
                      }}
                      className="group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/30"
                      activeProps={{
                        className:
                          'group relative flex items-center gap-3 rounded-xl bg-primary/10 px-3 py-2.5 text-[13px] font-medium text-primary outline-none',
                      }}
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <motion.span
                              layoutId={`nav-active-${admin ? 'admin' : 'client'}`}
                              transition={{
                                type: 'spring',
                                stiffness: 500,
                                damping: 40,
                              }}
                              className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary"
                              aria-hidden="true"
                            />
                          )}

                          <Icon
                            className={`h-4 w-4 shrink-0 ${
                              isActive
                                ? 'text-primary'
                                : 'text-muted-foreground/80 group-hover:text-foreground'
                            }`}
                          />

                          <span className="truncate">
                            {label}
                          </span>
                        </>
                      )}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>
        ))}

        {/* Staff gateway */}
        {showAdminLink && (
          <div className="mt-6 border-t border-border/60 pt-4">
            <Link
              to="/admin"
              onClick={onNavigate}
              className="group flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/[0.06] px-3 py-2.5 text-[13px] font-medium text-primary transition-colors hover:bg-primary/10"
            >
              <ShieldCheck className="h-4 w-4" />

              <span className="flex-1">
                Administration
              </span>

              <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        )}
      </nav>

      {/* Account footer */}
      <div className="border-t border-border/60 p-3">
        <div className="flex items-center gap-2.5 rounded-2xl bg-background/40 px-2 py-2">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {email[0]?.toUpperCase() || 'T'}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[12.5px] font-medium text-foreground">
              {email
                ? email.split('@')[0]
                : 'Account'}
            </p>

            <p className="truncate text-[10.5px] text-muted-foreground">
              {displayRole}
            </p>
          </div>

          <button
            type="button"
            onClick={onLogout}
            disabled={signingOut}
            aria-label="Sign out"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );
}
