# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# Supabase Integration

This project uses Supabase for authentication and data storage. Supabase provides a browser-compatible database and authentication system that works seamlessly across web, iOS, and Android platforms.

## Configuration
- Supabase URL is configured in `.env` as `EXPO_PUBLIC_SUPABASE_URL`
- Supabase publishable key is configured as `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- Service role key is configured as `EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY`

## Setup Requirements

### Supabase Project Setup
1. Create a new project at https://supabase.com
2. Copy your project URL and API keys
3. Add them to your `.env` file:
```env
EXPO_PUBLIC_SUPABASE_URL=your-project-url
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Database Schema
- `profiles` table for user profiles
- `fitness_profiles` table for fitness data
- Row Level Security (RLS) policies for data protection

## Implementation Details

### Cross-Platform Compatibility
- Supabase JavaScript client works on web, iOS, and Android
- No platform-specific authentication implementations needed
- Same code works across all platforms

### Auth Features
- Email/password authentication
- Role-based access control (customer, admin, super_admin)
- Admin approval workflow
- Session management with automatic token refresh
- Profile management and updates
- Two-factor authentication support

### Key Benefits
- ✅ Works directly in web browsers (no backend server needed)
- ✅ Real-time database subscriptions
- ✅ Built-in authentication and authorization
- ✅ Row-level security for data protection
- ✅ No platform-specific code required

## Troubleshooting

If Supabase connection fails:
1. Verify your Supabase project is active
2. Check that your API keys are correct in `.env`
3. Ensure your database tables exist and have proper RLS policies
4. Check browser console for specific error messages
