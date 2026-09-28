import { routeHead } from '@/lib/route-head';
import { createFileRoute } from '@tanstack/react-router';import { AccountPage } from '@/components/account-page';
export const Route=createFileRoute('/_authenticated/traders')({head:()=>routeHead('Copy trading strategies','Explore illustrative strategy profiles and manage your allocations.'),component:()=> <AccountPage page="traders"/>});
