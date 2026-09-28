import { routeHead } from '@/lib/route-head';
import { createFileRoute } from '@tanstack/react-router';import { AdminPage } from '@/components/admin-page';
export const Route=createFileRoute('/_authenticated/admin/traders')({head:()=>routeHead('Trader profiles','Review illustrative strategy profiles.'),component:()=> <AdminPage page="traders"/>});
