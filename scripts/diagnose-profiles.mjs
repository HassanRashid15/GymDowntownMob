import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const loadEnv = () => {
  const content = readFileSync(resolve(process.cwd(), '.env'), 'utf8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const index = trimmed.indexOf('=');
    if (index === -1) continue;
    env[trimmed.slice(0, index).trim()] = trimmed.slice(index + 1).trim();
  }
  return env;
};

const env = loadEnv();
const supabase = createClient(env.EXPO_PUBLIC_SUPABASE_URL, env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

const { data: signIn, error: signErr } = await supabase.auth.signInWithPassword({
  email: 'superadmin@gym.com',
  password: 'superadmin123',
});

if (signErr) {
  console.error('Sign-in failed:', signErr);
  process.exit(1);
}

console.log('Signed in as:', signIn.user.id);

const { data, error } = await supabase.from('profiles').select('*').eq('id', signIn.user.id).single();
console.log('Profile error:', JSON.stringify(error, null, 2));
console.log('Profile data:', data);
