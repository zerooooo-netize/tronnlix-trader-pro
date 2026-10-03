import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { getConfig } from './config.server';

const META = 'https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai';
const metaClient = (region = 'new-york') => `https://mt-client-api-v1.${region}.agiliumtrade.ai`;

async function derivAuthorize(token: string) {
  const appId = (await getConfig('deriv_app_id', 'DERIV_APP_ID')) || '1089';
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

export const connectMyAccount = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ platform: z.enum(['mt4', 'mt5', 'deriv']), login: z.string().trim().max(64).optional(), server: z.string().trim().max(128).optional(), password: z.string().min(1).max(256) }).parse(d))
  .handler(async ({ data, context }) => {
    const sb = context.supabase, user_id = context.userId;
    if (data.platform === 'deriv') {
      const a = await derivAuthorize(data.password);
      const { error } = await sb.from('user_trading_accounts').upsert({ user_id, platform: 'deriv', account_login: a.loginid, status: 'connected', balance: a.balance, equity: a.balance, currency: a.currency, last_error: null, last_synced_at: new Date().toISOString() }, { onConflict: 'user_id,platform,account_login' });
      if (error) throw new Error(error.message);
      return { message: `Deriv account ${a.loginid} linked.` };
    }
    const token = await getConfig('metaapi_token', 'METAAPI_TOKEN');
    if (!token) throw new Error('MT4 and MT5 linking is not switched on yet. Please contact support.');
    if (!data.login || !data.server) throw new Error('Enter your account number and broker server.');
    const res = await fetch(`${META}/users/current/accounts`, {
      method: 'POST', headers: { 'auth-token': token, 'content-type': 'application/json', 'transaction-id': crypto.randomUUID().replace(/-/g, '') },
      body: JSON.stringify({ name: `client-${user_id.slice(0, 8)}-${data.login}`, type: 'cloud', login: data.login, password: data.password, server: data.server, platform: data.platform, magic: 0 }),
    });
    const body: any = await res.json().catch(() => ({}));
    if (!res.ok) {
      await sb.from('user_trading_accounts').upsert({ user_id, platform: data.platform, account_login: data.login, server: data.server, status: 'failed', last_error: body.message ?? `HTTP ${res.status}` }, { onConflict: 'user_id,platform,account_login' });
      throw new Error(`We couldn't link this account: ${body.message ?? 'connection refused'}. Check the account number, password and server name.`);
    }
    const { error } = await sb.from('user_trading_accounts').upsert({ user_id, platform: data.platform, account_login: data.login, server: data.server, provider_account_id: body.id, status: 'pending', last_error: null }, { onConflict: 'user_id,platform,account_login' });
    if (error) throw new Error(error.message);
    return { message: 'Account submitted. Press Refresh in a minute to finish linking.' };
  });

export const syncMyAccount = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const sb = context.supabase;
    const { data: c } = await sb.from('user_trading_accounts').select('*').eq('id', data.id).eq('user_id', context.userId).single();
    if (!c) throw new Error('Account not found.');
    if (c.platform === 'deriv') return { message: 'To refresh a Deriv balance, link it again with your token.' };
    const token = await getConfig('metaapi_token', 'METAAPI_TOKEN');
    if (!token || !c.provider_account_id) throw new Error('This account cannot be refreshed right now.');
    const acc: any = await (await fetch(`${META}/users/current/accounts/${c.provider_account_id}`, { headers: { 'auth-token': token } })).json();
    if (acc.connectionStatus !== 'CONNECTED') {
      if (acc.state === 'UNDEPLOYED') await fetch(`${META}/users/current/accounts/${c.provider_account_id}/deploy`, { method: 'POST', headers: { 'auth-token': token } });
      await sb.from('user_trading_accounts').update({ status: 'pending', last_error: `Broker status: ${acc.connectionStatus ?? acc.state ?? 'unknown'}` }).eq('id', c.id);
      return { message: 'Still connecting to your broker. Try again shortly.' };
    }
    const info: any = await (await fetch(`${metaClient(acc.region)}/users/current/accounts/${c.provider_account_id}/account-information`, { headers: { 'auth-token': token } })).json();
    await sb.from('user_trading_accounts').update({ status: 'connected', balance: info.balance, equity: info.equity, currency: info.currency, last_error: null, last_synced_at: new Date().toISOString() }).eq('id', c.id);
    return { message: 'Account linked and refreshed.' };
  });

export const removeMyAccount = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const sb = context.supabase;
    const { data: c } = await sb.from('user_trading_accounts').select('provider_account_id').eq('id', data.id).eq('user_id', context.userId).single();
    const token = await getConfig('metaapi_token', 'METAAPI_TOKEN');
    if (token && c?.provider_account_id) await fetch(`${META}/users/current/accounts/${c.provider_account_id}`, { method: 'DELETE', headers: { 'auth-token': token } }).catch(() => null);
    const { error } = await sb.from('user_trading_accounts').delete().eq('id', data.id).eq('user_id', context.userId);
    if (error) throw new Error(error.message);
    return { message: 'Account unlinked.' };
  });
