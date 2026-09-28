import { routeHead } from '@/lib/route-head';
import { createFileRoute } from '@tanstack/react-router';import { AdminPage } from '@/components/admin-page';
export const Route=createFileRoute('/_authenticated/admin/crypto')({head:()=>routeHead('Crypto destinations','Configure and activate verified deposit destinations.'),component:()=> <AdminPage page="crypto"/>});
