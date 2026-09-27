import { createFileRoute } from '@tanstack/react-router';import { AdminPage } from '@/components/admin-page';
export const Route=createFileRoute('/_authenticated/admin/')({component:()=> <AdminPage page="overview"/>});
