import { routeHead } from '@/lib/route-head';
import { createFileRoute } from '@tanstack/react-router';import { AccountPage } from '@/components/account-page';
export const Route=createFileRoute('/_authenticated/profile')({head:()=>routeHead('Profile and security','Manage your personal details and verification status.'),component:()=> <AccountPage page="profile"/>});
