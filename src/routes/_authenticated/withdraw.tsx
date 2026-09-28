import { routeHead } from '@/lib/route-head';
import { createFileRoute } from '@tanstack/react-router';import { AccountPage } from '@/components/account-page';
export const Route=createFileRoute('/_authenticated/withdraw')({head:()=>routeHead('Withdraw funds','Request and track manual withdrawal reviews.'),component:()=> <AccountPage page="withdraw"/>});
