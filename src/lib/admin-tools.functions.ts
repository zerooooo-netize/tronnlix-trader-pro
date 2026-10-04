import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

export const SETTING_KEYS = ['resend_api_key', 'email_from_address', 'email_from_name', 'metaapi_token', 'deriv_app_id', 'trongrid_api_key', 'support_email', 'site_name', 'logo_path'] as const;
const SECRET_KEYS = new Set(['resend_api_key', 'metaapi_token', 'trongrid_api_key']);

export const getBrandSettings = createServerFn({ method: 'GET' }).handler(async () => {
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const { data } = await supabaseAdmin.from('app_settings').select('key,value').in('key', ['site_name', 'logo_path']);
  const name = data?.find((item) => item.key === 'site_name')?.value?.trim() || 'Tronnlix Trade';
  const path = data?.find((item) => item.key === 'logo_path')?.value;
  const logo = path ? await supabaseAdmin.storage.from('site-branding').createSignedUrl(path, 3600) : null;
  return { name, logoUrl: logo?.data?.signedUrl ?? null };
});

async function requireSuper(ctx: { supabase: any; userId: string }) {
  const { data } = await ctx.supabase.rpc('has_role', { _user_id: ctx.userId, _role: 'super_admin' });
  if (!data) throw new Error('Only the Super Admin can do this.');
}

export const getPlatformSettings = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireSuper(context);
    const { data, error } = await context.supabase.from('app_settings').select('key,value');
    if (error) throw new Error(error.message);
    const out: Record<string, { value: string; set: boolean }> = {};
    for (const k of SETTING_KEYS) {
      const v = (data ?? []).find((r: { key: string }) => r.key === k)?.value ?? '';
      out[k] = { value: SECRET_KEYS.has(k) ? (v ? '••••••' + v.slice(-4) : '') : v, set: !!v };
    }
    return out;
  });

export const savePlatformSettings = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.record(z.enum(SETTING_KEYS), z.string().max(500)).parse(d))
  .handler(async ({ data, context }) => {
    await requireSuper(context);
    const rows = Object.entries(data).filter(([k, v]) => !(SECRET_KEYS.has(k) && v.startsWith('••••'))).map(([key, value]) => ({ key, value: value.trim() }));
    if (rows.length) {
      const { error } = await context.supabase.from('app_settings').upsert(rows);
      if (error) throw new Error(error.message);
    }
    return { message: 'Settings saved.' };
  });

export const sendTestEmail = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ to: z.string().email() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireSuper(context);
    const { data: rows } = await context.supabase.from('app_settings').select('key,value').in('key', ['resend_api_key', 'email_from_address', 'email_from_name']);
    const get = (k: string) => rows?.find((r: { key: string }) => r.key === k)?.value;
    const key = get('resend_api_key'), from = get('email_from_address');
    if (!key || !from) throw new Error('Add the Resend API key and sender address first.');
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST', headers: { Authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({ from: `${get('email_from_name') || 'Tronnlix Trade'} <${from}>`, to: [data.to], subject: 'Tronnlix Trade test email', html: '<p>Your email settings work.</p>' }),
    });
    const body: any = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(`Resend: ${body.message ?? res.status}. Check that the sender domain is verified in Resend.`);
    return { message: `Test email sent to ${data.to}.` };
  });

export const runSql = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ sql: z.string().trim().min(1).max(20000) }).parse(d))
  .handler(async ({ data, context }) => {
    await requireSuper(context);
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { data: result, error } = await (supabaseAdmin.rpc as any)('exec_sql', { _sql: data.sql, _actor: context.userId });
    if (error) throw new Error(error.message);
    return { json: JSON.stringify(result) };
  });
