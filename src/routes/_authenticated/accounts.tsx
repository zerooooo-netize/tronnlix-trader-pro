import { routeHead } from '@/lib/route-head';
import { createFileRoute } from '@tanstack/react-router';
import { MyTradingAccounts } from '@/components/my-trading-accounts';
export const Route = createFileRoute('/_authenticated/accounts')({ head: () => routeHead('Trading accounts', 'Link your MT4, MT5 or Deriv account to copy trading experts.'), component: MyTradingAccounts });
