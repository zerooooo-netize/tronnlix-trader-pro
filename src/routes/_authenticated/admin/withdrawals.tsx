import { routeHead } from '@/lib/route-head';
import { createFileRoute } from '@tanstack/react-router';import { AdminPage } from '@/components/admin-page';
export const Route=createFileRoute('/_authenticated/admin/withdrawals')({head:()=>routeHead('Withdrawal reviews','Review pending manual withdrawal requests.'),component:()=> <AdminPage page="withdrawals"/>});
