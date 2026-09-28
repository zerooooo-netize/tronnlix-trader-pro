import { routeHead } from '@/lib/route-head';
import { createFileRoute,redirect } from '@tanstack/react-router';import { AdminPage } from '@/components/admin-page';
export const Route=createFileRoute('/_authenticated/admin/settings')({head:()=>routeHead('Platform settings','Access restricted platform configuration.'),beforeLoad:({context})=>{if(context.staff&&!context.superAdmin)throw redirect({to:'/admin'})},component:()=> <AdminPage page="settings"/>});
