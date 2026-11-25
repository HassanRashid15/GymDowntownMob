import 'react-native-url-polyfill/auto';
import { Platform } from 'react-native';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from '../../types/database';
import { rateLimitAwareFetch } from './supabaseFetch';

const supabaseUrl = (process.env.EXPO_PUBLIC_SUPABASE_URL || '').trim();
const supabaseKey = (process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '').trim();

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    'Supabase URL or key is missing. Add them to .env, then restart with: npx expo start --clear'
  );
}

// Avoid hard crash when Metro was started before .env was filled
export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder',
  {
    global: {
      fetch: rateLimitAwareFetch,
    },
    auth: {
      storage: AsyncStorage as any,
      autoRefreshToken: Boolean(supabaseUrl && supabaseKey),
      persistSession: Boolean(supabaseUrl && supabaseKey),
      // Web: pick up tokens from email confirmation redirect URL
      detectSessionInUrl: Platform.OS === 'web',
      // Implicit: confirmation links work when opened from the email app
      // (PKCE fails with "code verifier not found" across browsers/devices)
      flowType: 'implicit',
    },
  }
);

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);
