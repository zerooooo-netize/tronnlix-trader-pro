import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

const META = 'https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai';
const metaClient = (region = 'new-york') => `https://mt-client-api-v1.${region}.agiliumtrade.ai`;

async function requireStaff(ctx: { supabase: any; userId: string }) {
  const { data } = await ctx.supabase.rpc('is_staff', { _user_id: ctx.userId });
  if (!data) throw new Error('Only staff can manage trader connections.');
}

async function derivAuthorize(token: string) {
  const appId = process.env['DERIV_APP_ID'] || '1089';
  return await new Promise<{ loginid: string; balance: number; currency: string }>((resolve, reject) => {
    const ws = new WebSocket(`wss://ws.derivws.com/websockets/v3?app_id=${appId}`);
    const timer = setTimeout(() => { ws.close(); reject(new Error('Deriv did not respond in time.')); }, 10000);
    ws.addEventListener('open', () => ws.send(JSON.stringify({ authorize: token })));
    ws.addEventListener('message', (e) => {
      clearTimeout(timer); ws.close();
      const m = JSON.parse(String(e.data));
      if (m.error) reject(new Error(`Deriv: ${m.error.message}`));
      else resolve({ loginid: m.authorize.loginid, balance: Number(m.authorize.balance), currency: m.authorize.currency });
    });
    ws.addEventListener('error', () => { clearTimeout(timer); reject(new Error('Could not reach Deriv.')); });
  });
}

export const connectTraderAccount = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    traderId: z.string().uuid(),
    platform: z.enum(['mt4', 'mt5', 'deriv']),
    login: z.string().trim().max(64).optional(),
    server: z.string().trim().max(128).optional(),
    password: z.string().min(1).max(256),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await requireStaff(context);
    const sb = context.supabase;
    if (data.platform === 'deriv') {
      const a = await derivAuthorize(data.password);
      const { error } = await sb.from('trader_connections').upsert({ trader_id: data.traderId, platform: 'deriv', account_login: a.loginid, status: 'connected', balance: a.balance, equity: a.balance, currency: a.currency, last_error: null, last_synced_at: new Date().toISOString() }, { onConflict: 'trader_id,platform,account_login' });
      if (error) throw new Error(error.message);
      return { ok: true, message: `Deriv account ${a.loginid} connected.` };
    }
    const token = process.env['METAAPI_TOKEN'];
    if (!token) throw new Error('MT4/MT5 connections need a MetaApi token. Ask the site owner to add it.');
    if (!data.login || !data.server) throw new Error('Enter the account number and broker server.');
    const res = await fetch(`${META}/users/current/accounts`, {
      method: 'POST', headers: { 'auth-token': token, 'content-type': 'application/json', 'transaction-id': crypto.randomUUID().replace(/-/g, '') },
      body: JSON.stringify({ name: `trader-${data.traderId.slice(0, 8)}`, type: 'cloud', login: data.login, password: data.password, server: data.server, platform: data.platform, magic: 0 }),
    });
    const body: any = await res.json().catch(() => ({}));
    if (!res.ok) {
      await sb.from('trader_connections').upsert({ trader_id: data.traderId, platform: data.platform, account_login: data.login, server: data.server, status: 'failed', last_error: body.message ?? `HTTP ${res.status}` }, { onConflict: 'trader_id,platform,account_login' });
      throw new Error(`MetaApi: ${body.message ?? 'connection refused'}. Check the login, investor password and server name.`);
    }
    const { error } = await sb.from('trader_connections').upsert({ trader_id: data.traderId, platform: data.platform, account_login: data.login, server: data.server, provider_account_id: body.id, status: 'pending', last_error: null }, { onConflict: 'trader_id,platform,account_login' });
    if (error) throw new Error(error.message);
    return { ok: true, message: 'Account submitted. Press Sync in a minute to confirm the connection.' };
  });

export const syncTraderConnection = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireStaff(context);
    const sb = context.supabase;
    const { data: c, error } = await sb.from('trader_connections').select('*').eq('id', data.id).single();
    if (error || !c) throw new Error('Connection not found.');
    if (c.platform === 'deriv') return { ok: true, message: 'Deriv balances refresh when you reconnect with a token.' };
    const token = process.env['METAAPI_TOKEN'];
    if (!token || !c.provider_account_id) throw new Error('MetaApi token or account id missing.');
    const acc: any = await (await fetch(`${META}/users/current/accounts/${c.provider_account_id}`, { headers: { 'auth-token': token } })).json();
    if (acc.connectionStatus !== 'CONNECTED') {
      if (acc.state === 'UNDEPLOYED') await fetch(`${META}/users/current/accounts/${c.provider_account_id}/deploy`, { method: 'POST', headers: { 'auth-token': token } });
      await sb.from('trader_connections').update({ status: 'pending', last_error: `Broker status: ${acc.connectionStatus ?? acc.state ?? 'unknown'}` }).eq('id', c.id);
      return { ok: false, message: `Still connecting (${acc.connectionStatus ?? acc.state}). Try again shortly.` };
    }
    const info: any = await (await fetch(`${metaClient(acc.region)}/users/current/accounts/${c.provider_account_id}/account-information`, { headers: { 'auth-token': token } })).json();
    await sb.from('trader_connections').update({ status: 'connected', balance: info.balance, equity: info.equity, currency: info.currency, last_error: null, last_synced_at: new Date().toISOString() }).eq('id', c.id);
    return { ok: true, message: 'Connected and synced.' };
  });

export const removeTraderConnection = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await requireStaff(context);
    const sb = context.supabase;
    const { data: c } = await sb.from('trader_connections').select('provider_account_id').eq('id', data.id).single();
    const token = process.env['METAAPI_TOKEN'];
    if (token && c?.provider_account_id) await fetch(`${META}/users/current/accounts/${c.provider_account_id}`, { method: 'DELETE', headers: { 'auth-token': token } }).catch(() => null);
    const { error } = await sb.from('trader_connections').delete().eq('id', data.id);
    if (error) throw new Error(error.message);
    return { ok: true, message: 'Connection removed.' };
  });
