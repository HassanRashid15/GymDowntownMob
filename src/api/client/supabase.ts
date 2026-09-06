import 'react-native-url-polyfill/auto';
import { Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from '../../types/database';
import { rateLimitAwareFetch } from './supabaseFetch';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase URL or key is missing. Please check your .env file.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  global: {
    fetch: rateLimitAwareFetch,
  },
  auth: {
    storage: AsyncStorage as any,
    autoRefreshToken: true,
    persistSession: true,
    // Web: pick up tokens from email confirmation redirect URL
    detectSessionInUrl: Platform.OS === 'web',
    // Implicit: confirmation links work when opened from the email app
    // (PKCE fails with "code verifier not found" across browsers/devices)
    flowType: 'implicit',
  },
});
