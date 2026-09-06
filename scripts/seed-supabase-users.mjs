import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const loadEnv = () => {
  try {
    const envPath = resolve(process.cwd(), '.env');
    const content = readFileSync(envPath, 'utf8');
    const env = {};
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const index = trimmed.indexOf('=');
      if (index === -1) continue;
      const key = trimmed.slice(0, index).trim();
      const value = trimmed.slice(index + 1).trim();
      env[key] = value;
    }
    return env;
  } catch {
    return {};
  }
};

const env = { ...process.env, ...loadEnv() };
const supabaseUrl = env.EXPO_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing EXPO_PUBLIC_SUPABASE_URL or service role key in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DEMO_USERS = [
  {
    email: 'superadmin@gym.com',
    password: 'superadmin123',
    full_name: 'Super Admin',
    role: 'super_admin',
    gym_name: 'Forge Platform',
    phone: '+1 555 0100',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?fit=crop&w=150&h=150&q=80',
  },
  {
    email: 'admin@gym.com',
    password: 'admin123',
    full_name: 'Admin User',
    role: 'admin',
    gym_name: 'Forge Downtown',
    phone: '+1 555 0101',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?fit=crop&w=150&h=150&q=80',
  },
  {
    email: 'customer@gym.com',
    password: 'customer123',
    full_name: 'Jaxon Vance',
    role: 'customer',
    gym_name: 'Forge Downtown',
    phone: '+1 555 0102',
    avatar_url: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?fit=crop&w=300&h=300&q=80',
  },
];

const findAuthUserByEmail = async (email) => {
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw error;
  return data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase()) ?? null;
};

const upsertDemoUser = async (demoUser) => {
  const existing = await findAuthUserByEmail(demoUser.email);
  let userId = existing?.id;

  if (existing) {
    const { error } = await supabase.auth.admin.updateUserById(existing.id, {
      password: demoUser.password,
      email_confirm: true,
      user_metadata: {
        full_name: demoUser.full_name,
        role: demoUser.role,
        gym_name: demoUser.gym_name,
        phone: demoUser.phone,
        avatar_url: demoUser.avatar_url,
        is_approved: true,
      },
      app_metadata: { role: demoUser.role },
    });
    if (error) throw error;
    console.log(`Updated auth user: ${demoUser.email}`);
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: demoUser.email,
      password: demoUser.password,
      email_confirm: true,
      user_metadata: {
        full_name: demoUser.full_name,
        role: demoUser.role,
        gym_name: demoUser.gym_name,
        phone: demoUser.phone,
        avatar_url: demoUser.avatar_url,
        is_approved: true,
      },
      app_metadata: { role: demoUser.role },
    });
    if (error) throw error;
    userId = data.user.id;
    console.log(`Created auth user: ${demoUser.email}`);
  }

  const now = new Date().toISOString();
  const { error: profileError } = await supabase.from('profiles').upsert(
    {
      id: userId,
      full_name: demoUser.full_name,
      role: demoUser.role,
      phone: demoUser.phone,
      gym_name: demoUser.gym_name,
      avatar_url: demoUser.avatar_url,
      is_approved: true,
      approved_by: userId,
      approved_at: now,
      updated_at: now,
    },
    { onConflict: 'id' }
  );

  if (profileError) {
    throw profileError;
  }

  console.log(`Upserted profile (${demoUser.role}): ${demoUser.email}`);
};

const main = async () => {
  console.log('Seeding Supabase demo users...\n');
  for (const demoUser of DEMO_USERS) {
    await upsertDemoUser(demoUser);
  }
  console.log('\nDone. You can sign in with:');
  for (const demoUser of DEMO_USERS) {
    console.log(`  ${demoUser.email} / ${demoUser.password}`);
  }
};

main().catch((error) => {
  console.error('Seed failed:', error.message || error);
  process.exit(1);
});
