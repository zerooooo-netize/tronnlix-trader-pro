import { routeHead } from '@/lib/route-head';
import { createFileRoute } from '@tanstack/react-router';import { AccountPage } from '@/components/account-page';
export const Route=createFileRoute('/_authenticated/notifications')({head:()=>routeHead('Notifications','Read private account and support updates.'),component:()=> <AccountPage page="notifications"/>});
