import { createFileRoute } from '@tanstack/react-router';import { AccountPage } from '@/components/account-page';
export const Route=createFileRoute('/_authenticated/withdraw')({component:()=> <AccountPage page="withdraw"/>});
