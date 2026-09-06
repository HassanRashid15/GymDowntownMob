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
const url = env.EXPO_PUBLIC_SUPABASE_URL;
const anon = env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const service = env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anon) {
  console.error('Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
  process.exit(1);
}

console.log('Project host:', new URL(url).host);

const client = createClient(url, anon);
const email = `diagnose-${Date.now()}@gmail.com`;

const metadata = {
  full_name: 'Diagnose User',
  first_name: 'Diagnose',
  last_name: 'User',
  role: 'customer',
  is_approved: true,
  fitness_age: '25',
  fitness_weight: '70',
  fitness_goal: 'Build Muscle',
  fitness_experience_level: 'Beginner',
  fitness_target_areas: 'Arms, Chest',
  fitness_workout_days: '3 days/week',
  fitness_workout_duration: '45 min',
  fitness_workout_type: 'Strength',
};

const { data, error } = await client.auth.signUp({
  email,
  password: 'TestPass123!',
  options: { data: metadata },
});

console.log(
  JSON.stringify(
    {
      signupEmailDomain: email.split('@')[1],
      userCreated: Boolean(data?.user?.id),
      hasSession: Boolean(data?.session),
      identitiesCount: data?.user?.identities?.length ?? null,
      error: error
        ? { message: error.message, status: error.status, code: error.code }
        : null,
    },
    null,
    2
  )
);

if (service && data?.user?.id) {
  const admin = createClient(url, service, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('id, full_name, role, is_approved')
    .eq('id', data.user.id)
    .maybeSingle();

  console.log(
    JSON.stringify(
      {
        profileCreated: Boolean(profile),
        profile,
        profileError: profileError
          ? { message: profileError.message, code: profileError.code }
          : null,
      },
      null,
      2
    )
  );

  await admin.auth.admin.deleteUser(data.user.id);
  console.log('Cleaned up diagnose user');
} else if (!service) {
  console.log('No service role key — skipped profile check / cleanup');
}

if (error) process.exit(1);
