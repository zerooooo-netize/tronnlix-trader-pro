import { createFileRoute } from '@tanstack/react-router';
import { AccountPage } from '@/components/account-page';

export const Route = createFileRoute('/_authenticated/dashboard')({
  head: () => ({
    meta: [
      {
        title: 'Dashboard | Tronnlix Trade',
      },
      {
        name: 'description',
        content:
          'View your Tronnlix Trade portfolio, account activity, allocations and trading overview.',
      },
      {
        name: 'robots',
        content: 'noindex, nofollow',
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  return <AccountPage page="dashboard" />;
}
