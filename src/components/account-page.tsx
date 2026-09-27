function PortfolioPage({ data }: { data: Account }) {
  const balance = data.profile?.balance ?? 0;
  const allocated = data.allocations
    .filter((x) => x.status !== 'stopped')
    .reduce((a, x) => a + x.amount, 0);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Metric
          label="Available balance"
          value={money(balance)}
          note="Unallocated"
          icon={Wallet}
        />
        <Metric
          label="Allocated capital"
          value={money(allocated)}
          note="Across copy strategies"
          icon={TrendingUp}
        />
        <Metric
          label="Total equity"
          value={money(balance + allocated)}
          note="Excludes unrealized trading results"
          icon={ChartLineIcon}
        />
      </div>

      <section>
        <SectionHeader title="Strategy allocations" to="/traders" />
        <RecordList
          rows={data.allocations.map((x) => ({
            id: x.id,
            title: x.traders?.name ?? 'Trader',
            sub: date(x.created_at),
            amount: x.amount,
            status: x.status,
          }))}
        />
      </section>

      <div className="rounded-2xl border border-border/60 bg-secondary/40 p-5 text-sm leading-7 text-muted-foreground">
        Live trade history, performance charts, profit and loss and monthly
        reports will appear when an execution and reporting provider is
        connected. No simulated gains are shown as real account performance.
      </div>
    </div>
  );
}

/* ================================================================
 * Profile
 * ============================================================== */

function ProfilePage({
  data,
  busy,
  action,
}: {
  data: Account;
  busy: boolean;
  action: (fn: () => Promise<void>, text: string) => Promise<void>;
}) {
  const [name, setName] = useState(data.profile?.full_name ?? '');
  const [phone, setPhone] = useState(data.profile?.phone ?? '');
  const [country, setCountry] = useState(data.profile?.country ?? '');

  const kyc = data.profile?.kyc_status ?? 'not_started';

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_.85fr]">
        <form
          className="form-panel"
          onSubmit={(e) => {
            e.preventDefault();
            action(async () => {
              const { error } = await supabase
                .from('profiles')
                .update({ full_name: name, phone, country })
                .eq('id', data.user.id);
              if (error) throw error;
            }, 'Profile saved.');
          }}
        >
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Personal information
          </span>
          <h2 className="mt-3 font-display text-2xl tracking-tight text-foreground">
            Your details
          </h2>

          <div className="mt-8 grid gap-5">
            <label className="field-label">
              Full name
              <input
                className="field-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={busy}
              />
            </label>
            <label className="field-label">
              Email
              <input
                className="field-input"
                value={data.user.email ?? ''}
                disabled
              />
            </label>
            <label className="field-label">
              Phone
              <input
                className="field-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={busy}
              />
            </label>
            <label className="field-label">
              Country
              <input
                className="field-input"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                disabled={busy}
              />
            </label>
            <Button type="submit" disabled={busy} className="w-fit">
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Save changes
                </>
              )}
            </Button>
          </div>
        </form>

        <div className="space-y-6">
          <div className="form-panel">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Identity verification
            </span>
            <h3 className="mt-3 font-display text-2xl tracking-tight text-foreground">
              Your account status
            </h3>
            <div className="mt-5">
              <Status value={kyc} />
            </div>
            <p className="mt-5 text-sm leading-7 text-muted-foreground">
              Submit your profile for manual review. Identity document uploads
              and automated checks are not connected yet; approval requires
              independent verification.
            </p>
            {['not_started', 'rejected'].includes(kyc) && (
              <Button
                variant="outline"
                className="mt-6"
                disabled={busy}
                onClick={() =>
                  action(async () => {
                    const { error } = await supabase.rpc('submit_kyc' as never);
                    if (error) throw error;
                  }, 'Verification submitted for review.')
                }
              >
                <ShieldCheck className="mr-1.5 h-4 w-4" />
                Submit for review
              </Button>
            )}
          </div>

          <div className="form-panel">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Security
            </span>
            <h3 className="mt-3 font-display text-xl tracking-tight text-foreground">
              Password and sessions
            </h3>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Use the password reset flow to change your password securely.
            </p>
            <Button variant="outline" asChild className="mt-5">
              <Link to="/auth" search={{ mode: 'login' }}>
                Account access
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <section>
        <SectionHeader title="Activity log" />
        {data.activity.length === 0 ? (
          <Empty
            eyebrow="No activity"
            title="Nothing recorded yet"
            body="Your account actions will appear here as they happen."
            icon={Receipt}
            compact
          />
        ) : (
          <ul className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/70">
            {data.activity.map((x) => (
              <li
                key={x.id}
                className="flex items-center justify-between gap-4 bg-background px-5 py-3.5"
              >
                <span className="truncate text-[13.5px] capitalize text-foreground">
                  {x.action.replaceAll('_', ' ')}
                </span>
                <span className="shrink-0 text-[11.5px] text-muted-foreground">
                  {date(x.created_at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/* ================================================================
 * Support
 * ============================================================== */

function SupportPage({
  data,
  busy,
  action,
}: {
  data: Account;
  busy: boolean;
  action: (fn: () => Promise<void>, text: string) => Promise<void>;
}) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_.85fr]">
        <form
          className="form-panel"
          onSubmit={(e) => {
            e.preventDefault();
            action(async () => {
              const { error } = await supabase
                .from('support_tickets')
                .insert({ user_id: data.user.id, subject, message });
              if (error) throw error;
              setSubject('');
              setMessage('');
            }, 'Support request sent.');
          }}
        >
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Send a request
          </span>
          <h2 className="mt-3 font-display text-2xl tracking-tight text-foreground">
            How can we help?
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Our support team can reply directly to your account request.
          </p>

          <div className="mt-8 grid gap-5">
            <label className="field-label">
              Subject
              <input
                className="field-input"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="How can we help?"
                disabled={busy}
              />
            </label>
            <label className="field-label">
              Message
              <textarea
                className="field-input min-h-36"
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us a little more"
                disabled={busy}
              />
            </label>
            <Button type="submit" disabled={busy} className="w-fit">
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending
                </>
              ) : (
                <>
                  Send request
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>

        <aside className="lg:border-l lg:border-border/60 lg:pl-8">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Quick answers
          </span>
          <h3 className="mt-4 font-display text-2xl tracking-tight text-foreground">
            Looking for guidance?
          </h3>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            Review common questions about verification, funding and account
            access.
          </p>
          <Button asChild variant="outline" className="mt-6">
            <Link to="/faq">
              View FAQ
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </aside>
      </div>

      <section>
        <SectionHeader title="Your requests" />
        {data.tickets.length === 0 ? (
          <Empty
            eyebrow="No requests"
            title="No open requests"
            body="When you contact support, your conversations will appear here."
            icon={LifeBuoy}
            compact
          />
        ) : (
          <ul className="space-y-3">
            {data.tickets.map((x) => (
              <li
                key={x.id}
                className="rounded-2xl border border-border/70 bg-background p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <strong className="text-sm text-foreground">{x.subject}</strong>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                      {x.message}
                    </p>
                  </div>
                  <Status value={x.status} />
                </div>
                {x.reply && (
                  <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                      Support reply
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground/90">
                      {x.reply}
                    </p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/* ================================================================
 * Notifications
 * ============================================================== */

function NotificationsPage({
  data,
  busy,
  action,
}: {
  data: Account;
  busy: boolean;
  action: (fn: () => Promise<void>, text: string) => Promise<void>;
}) {
  return (
    <div className="space-y-4">
      {data.notifications.length === 0 ? (
        <Empty
          eyebrow="All caught up"
          title="No new notifications"
          body="Account updates will appear here when there is something to review."
          icon={Bell}
        />
      ) : (
        <ul className="space-y-3">
          {data.notifications.map((x) => (
            <li
              key={x.id}
              className={`rounded-2xl border p-5 transition-colors ${
                x.read_at
                  ? 'border-border/60 bg-background'
                  : 'border-primary/20 bg-primary/[0.04]'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <strong className="text-sm text-foreground">{x.title}</strong>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                    {x.message}
                  </p>
                  <p className="mt-3 text-[11px] text-muted-foreground">
                    {date(x.created_at)}
                  </p>
                </div>
                {!x.read_at && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={() =>
                      action(async () => {
                        const { error } = await supabase
                          .from('notifications')
                          .update({ read_at: new Date().toISOString() })
                          .eq('id', x.id);
                        if (error) throw error;
                      }, 'Marked as read.')
                    }
                  >
                    <Check className="h-3.5 w-3.5" />
                    Mark read
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
