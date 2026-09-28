import { routeHead } from '@/lib/route-head';
import { createFileRoute } from '@tanstack/react-router';import { AccountPage } from '@/components/account-page';
export const Route=createFileRoute('/_authenticated/portfolio')({head:()=>routeHead('Portfolio','Review your allocations and available account balance.'),component:()=> <AccountPage page="portfolio"/>});
