import { routeHead } from '@/lib/route-head';
import { createFileRoute } from '@tanstack/react-router';import { AdminPage } from '@/components/admin-page';
export const Route=createFileRoute('/_authenticated/admin/users')({head:()=>routeHead('Customer accounts','Review customer accounts and verification status.'),component:()=> <AdminPage page="users"/>});
