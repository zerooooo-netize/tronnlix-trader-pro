import { routeHead } from '@/lib/route-head';
import { createFileRoute } from '@tanstack/react-router';import { AccountPage } from '@/components/account-page';
export const Route=createFileRoute('/_authenticated/dashboard')({head:()=>routeHead('Account overview','Review your private account balance, verification progress and recent activity.'),component:()=> <AccountPage page="dashboard"/>});
