import { routeHead } from '@/lib/route-head';
import { createFileRoute } from '@tanstack/react-router';import { AccountPage } from '@/components/account-page';
export const Route=createFileRoute('/_authenticated/wallet')({head:()=>routeHead('Wallet','Review account balances and transaction history.'),component:()=> <AccountPage page="wallet"/>});
