import { createFileRoute } from '@tanstack/react-router';import { AdminPage } from '@/components/admin-page';
export const Route=createFileRoute('/_authenticated/admin/crypto')({component:()=> <AdminPage page="crypto"/>});
