import { routeHead } from '@/lib/route-head';
import { createFileRoute } from '@tanstack/react-router';import { AccountPage } from '@/components/account-page';
export const Route=createFileRoute('/_authenticated/support')({head:()=>routeHead('Account support','Send a private support request and review replies.'),component:()=> <AccountPage page="support"/>});
