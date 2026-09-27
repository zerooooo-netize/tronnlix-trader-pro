import { createFileRoute } from '@tanstack/react-router';import { AccountPage } from '@/components/account-page';
export const Route=createFileRoute('/_authenticated/notifications')({component:()=> <AccountPage page="notifications"/>});
