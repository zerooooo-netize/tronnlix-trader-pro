import { routeHead } from '@/lib/route-head';
import { createFileRoute } from '@tanstack/react-router';import { AdminPage } from '@/components/admin-page';
export const Route=createFileRoute('/_authenticated/admin/audit')({head:()=>routeHead('Audit trail','Review recorded operational actions.'),component:()=> <AdminPage page="audit"/>});
