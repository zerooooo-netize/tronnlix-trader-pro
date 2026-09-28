import { routeHead } from '@/lib/route-head';
import { createFileRoute } from '@tanstack/react-router';import { AccountPage } from '@/components/account-page';
export const Route=createFileRoute('/_authenticated/deposit')({head:()=>routeHead('Deposit funds','View verified deposit destinations and follow pending payment requests.'),component:()=> <AccountPage page="deposit"/>});
