// Server-only: reads a setting from the environment first, then from admin-managed app settings.
export async function getConfig(key: string, envName?: string): Promise<string | undefined> {
  const env = envName ? process.env[envName] : undefined;
  if (env) return env;
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const { data } = await supabaseAdmin.from('app_settings').select('value').eq('key', key).maybeSingle();
  return data?.value || undefined;
}
