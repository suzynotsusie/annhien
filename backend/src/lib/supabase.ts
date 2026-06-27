import { createClient } from '@supabase/supabase-js';

function resolveSupabaseUrl(rawUrl: string | undefined) {
  try {
    const url = new URL(rawUrl || '');
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return url.toString().replace(/\/$/, '');
    }
  } catch {
    // Fallback below keeps the API bootable while env values are still placeholders.
  }

  console.warn('SUPABASE_URL chua hop le, tam dung local fallback http://127.0.0.1:54321');
  return 'http://127.0.0.1:54321';
}

const supabaseUrl = resolveSupabaseUrl(process.env.SUPABASE_URL);
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'missing-service-role-key';

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('Thieu SUPABASE_SERVICE_ROLE_KEY trong .env');
}

export const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
