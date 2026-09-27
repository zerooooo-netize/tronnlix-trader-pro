import { createFileRoute,redirect } from '@tanstack/react-router';import { AdminPage } from '@/components/admin-page';
export const Route=createFileRoute('/_authenticated/admin/settings')({beforeLoad:({context})=>{if(!context.superAdmin)throw redirect({to:'/admin'})},component:()=> <AdminPage page="settings"/>});
