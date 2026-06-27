import { createClient } from '@supabase/supabase-js';
import { logWarn } from '../utils/logger';

function resolveSupabaseUrl(rawUrl: string | undefined): string | null {
  try {
    const url = new URL(rawUrl || '');
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return url.toString().replace(/\/$/, '');
    }
  } catch {
    return null;
  }

  return null;
}

const supabaseUrl = resolveSupabaseUrl(process.env.SUPABASE_URL);
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || null;

export const isSupabaseConfigured = Boolean(supabaseUrl && serviceRoleKey);

if (!isSupabaseConfigured) {
  logWarn('Supabase env is incomplete. Backend will use local fallback mode for supported flows.');
}

export const supabase = createClient(supabaseUrl || 'http://127.0.0.1:54321', serviceRoleKey || 'missing-service-role-key', {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
