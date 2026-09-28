import { routeHead } from '@/lib/route-head';
import { createFileRoute } from '@tanstack/react-router';import { AdminPage } from '@/components/admin-page';
export const Route=createFileRoute('/_authenticated/admin/support')({head:()=>routeHead('Support requests','Reply to private customer support requests.'),component:()=> <AdminPage page="support"/>});
