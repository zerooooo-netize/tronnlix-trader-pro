import { routeHead } from '@/lib/route-head';
import { createFileRoute } from '@tanstack/react-router';import { AdminPage } from '@/components/admin-page';
export const Route=createFileRoute('/_authenticated/admin/verification')({head:()=>routeHead('Identity reviews','Review identity submissions after independent checks.'),component:()=> <AdminPage page="verification"/>});
