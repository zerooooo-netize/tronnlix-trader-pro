import { routeHead } from '@/lib/route-head';
import { createFileRoute } from '@tanstack/react-router';import { AdminPage } from '@/components/admin-page';
export const Route=createFileRoute('/_authenticated/admin/')({head:()=>routeHead('Operations overview','Review accounts, funding requests and verification queues.'),component:()=> <AdminPage page="overview"/>});
