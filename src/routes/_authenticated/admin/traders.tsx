import { routeHead } from '@/lib/route-head';
import { createFileRoute } from '@tanstack/react-router';
import { TraderAdmin } from '@/components/trader-admin';
export const Route = createFileRoute('/_authenticated/admin/traders')({ head: () => routeHead('Trading experts', 'Create, edit, feature and archive trading expert profiles.'), component: TraderAdmin });
