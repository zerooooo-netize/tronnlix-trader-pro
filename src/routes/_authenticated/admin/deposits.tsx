import { routeHead } from '@/lib/route-head';
import { createFileRoute } from '@tanstack/react-router';import { AdminPage } from '@/components/admin-page';
export const Route=createFileRoute('/_authenticated/admin/deposits')({head:()=>routeHead('Deposit reviews','Review payment claims before crediting accounts.'),component:()=> <AdminPage page="deposits"/>});
