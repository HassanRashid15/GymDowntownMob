import React, { createContext, useContext, useState, useEffect } from 'react';
import { verifyTwoFactorForUser } from '../utils/twoFactorStorage';
import {
  sendWelcomeEmail,
  sendAdminApprovalEmail,
  sendAdminRejectionEmail,
  sendPendingAdminNotification,
} from '../utils/brevo';
import { hasAdminAccess, isSuperAdminRole, UserRole } from '../types/user';
import {
  type AuthUser,
  type ProfileUpdateInput,
  type RegisterInput,
  type RegisterResult,
  type SignUpResult,
  getSession,
  getAuthUser,
  signInWithPassword,
  signUp,
  signOut,
  resetPasswordForEmail,
  resendVerificationEmail,
  onAuthStateChange,
  buildAuthUser,
  fetchProfileByUserId,
  upsertProfileOnSignup,
  ensureProfileFromAuthUser,
  markCustomerApprovedIfEmailConfirmed,
  updateUserProfile,
  fetchPendingAdmins,
  approveAdminProfile,
  fetchAdminProfile,
  deleteAdminProfile,
  fetchSuperAdmins,
  setAwaitingEmailVerification,
  isAwaitingEmailVerification,
  getCurrentUrlForAuthCallback,
} from '../api/auth';

export type { AuthUser, ProfileUpdateInput, RegisterFitnessProfile, RegisterInput, RegisterResult } from '../api/auth';

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string, verificationCode?: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<RegisterResult>;
  updateProfile: (input: ProfileUpdateInput) => Promise<void>;
  logout: () => Promise<void>;
  approveAdmin: (adminId: string) => Promise<void>;
  rejectAdmin: (adminId: string, reason?: string) => Promise<void>;
  getPendingAdmins: () => Promise<AuthUser[]>;
  resetPassword: (email: string) => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
    const { data: { subscription } } = onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Email confirmation redirects sign the user in temporarily.
        // EmailVerificationScreen completes the flow and sends them to Login.
        if (isAwaitingEmailVerification()) {
          return;
        }
        await loadUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => subscription?.unsubscribe?.();
  }, []);

  const loadUser = async () => {
    try {
      const callbackUrl = getCurrentUrlForAuthCallback();
      const isAuthRedirect =
        !!callbackUrl &&
        (callbackUrl.includes('access_token=') ||
          callbackUrl.includes('type=signup') ||
          callbackUrl.includes('code='));

      if (isAuthRedirect || isAwaitingEmailVerification()) {
        setAwaitingEmailVerification(true);
        return;
      }

      const session = await getSession();
      if (session?.user) {
        await loadUserProfile(session.user.id);
      }
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      const authUser = await getAuthUser();
      if (!authUser || authUser.id !== userId) return;

      let profile = await fetchProfileByUserId(userId);
      if (!profile) {
        profile = await ensureProfileFromAuthUser(authUser);
      } else {
        await markCustomerApprovedIfEmailConfirmed(authUser);
        profile = (await fetchProfileByUserId(userId)) ?? profile;
      }
      // MongoDB implementation has a different buildAuthUser signature
      setUser(buildAuthUser(authUser as any, profile as any));
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  };

  const login = async (email: string, password: string, verificationCode?: string) => {
    try {
      const result = await signInWithPassword(email, password);
      if (!result?.user) {
        throw new Error('Login failed. Please try again.');
      }
      
      const authUser = result.user;
      let profile = await fetchProfileByUserId(authUser.id);
      if (!profile) {
        profile = await ensureProfileFromAuthUser(authUser);
      } else {
        await markCustomerApprovedIfEmailConfirmed(authUser);
        profile = (await fetchProfileByUserId(authUser.id)) ?? profile;
      }
      // MongoDB implementation has a different buildAuthUser signature
      const authUserData = buildAuthUser(authUser as any, profile as any);

      if (authUserData.role === 'admin' && authUserData.isApproved === false) {
        await signOut();
        const adminApprovalError = new Error('Your admin account is pending approval from a super admin. Please wait for approval.');
        (adminApprovalError as Error & { code?: string }).code = 'ADMIN_APPROVAL_PENDING';
        throw adminApprovalError;
      }

      const twoFactorResult = await verifyTwoFactorForUser(authUser.id, verificationCode);
      if (!twoFactorResult.success) {
        await signOut();
        const twoFactorError = new Error(twoFactorResult.error ?? 'Two-factor verification required.');
        if (!verificationCode) {
          (twoFactorError as Error & { code?: string }).code = 'TWO_FACTOR_REQUIRED';
        }
        throw twoFactorError;
      }

      setUser(authUserData);
    } catch (error: any) {
      // Pass through email verification errors with special code
      const loginMessage = String(error?.message ?? '').toLowerCase();
      if (
        error?.code === 'email_not_confirmed' ||
        error?.code === 'EMAIL_NOT_CONFIRMED' ||
        loginMessage.includes('email not confirmed') ||
        loginMessage.includes('confirm your email')
      ) {
        await signOut();
        const emailVerificationError = new Error(error.message || 'Please confirm your email before signing in.');
        (emailVerificationError as Error & { code?: string }).code = 'EMAIL_NOT_CONFIRMED';
        throw emailVerificationError;
      }
      throw error;
    }
  };

  const register = async (input: RegisterInput): Promise<RegisterResult> => {
    const { role } = input;
    const isApproved = false;

    const signupResult: SignUpResult = await signUp(input);
    if (!signupResult?.user) {
      throw new Error('Registration failed. Please try again.');
    }

    const authUser = signupResult.user;
    const { session, email, fullName } = signupResult;

    // MongoDB handles profile creation during signup, so no separate upsert needed
    // When email confirmation is ON, session is null
    if (session) {
      await upsertProfileOnSignup({
        userId: authUser.id,
        fullName,
        role,
        isApproved,
        phone: input.phone,
        gymName: input.gymName,
      });
    }

    const needsEmailConfirmation = !session;

    if (role === 'customer') {
      try {
        await sendWelcomeEmail(email, fullName);
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
      }
    } else {
      try {
        const superAdmins = await fetchSuperAdmins();
        for (const superAdmin of superAdmins as { fullName?: string; email?: string }[]) {
          await sendPendingAdminNotification(
            superAdmin.email || 'superadmin@gym.com',
            superAdmin.fullName || 'Super Admin',
            fullName,
            email
          );
        }
      } catch (emailError) {
        console.error('Failed to send admin notification:', emailError);
      }
    }

    setAwaitingEmailVerification(needsEmailConfirmation);

    // Sign out after registration since we use a verification / login handoff
    await signOut();
    setUser(null);

    return { role, needsEmailConfirmation, pendingApproval: role === 'admin' };
  };

  const updateProfile = async (input: ProfileUpdateInput) => {
    if (!user) {
      throw new Error('Not signed in');
    }

    await updateUserProfile(user.id, input);
    await loadUserProfile(user.id);
  };

  const logout = async () => {
    await signOut();
    setUser(null);
  };

  const approveAdmin = async (adminId: string) => {
    if (!user || user.role !== 'super_admin') {
      throw new Error('Only super admins can approve admin accounts');
    }

    const adminProfile = await fetchAdminProfile(adminId);
    if (!adminProfile) {
      throw new Error('Admin profile not found');
    }
    
    await approveAdminProfile(adminId, user.id);

    try {
      await sendAdminApprovalEmail('admin@gym.com', adminProfile.full_name ?? 'Admin');
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError);
    }
  };

  const rejectAdmin = async (adminId: string, reason?: string) => {
    if (!user || user.role !== 'super_admin') {
      throw new Error('Only super admins can reject admin accounts');
    }

    const adminProfile = await fetchAdminProfile(adminId);
    if (!adminProfile) {
      throw new Error('Admin profile not found');
    }
    
    await deleteAdminProfile(adminId);

    try {
      await sendAdminRejectionEmail('admin@gym.com', adminProfile.full_name ?? 'Admin', reason);
    } catch (emailError) {
      console.error('Failed to send rejection email:', emailError);
    }
  };

  const getPendingAdmins = async (): Promise<AuthUser[]> => {
    if (!user || user.role !== 'super_admin') {
      throw new Error('Only super admins can view pending admins');
    }

    const profiles = await fetchPendingAdmins();

    return profiles.map((profile: any) => ({
      id: profile._id?.toString() || profile.id,
      email: profile.email,
      name: profile.fullName || 'Unknown',
      role: profile.role,
      avatar: profile.avatar || undefined,
      phone: profile.phone || undefined,
      gymName: profile.gymName || undefined,
    }));
  };

  const resetPassword = async (email: string) => {
    try {
      await resetPasswordForEmail(email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  const handleResendVerificationEmail = async (email: string) => {
    try {
      await resendVerificationEmail(email);
    } catch (error) {
      console.error('Resend verification email error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    updateProfile,
    logout,
    approveAdmin,
    rejectAdmin,
    getPendingAdmins,
    resetPassword,
    resendVerificationEmail: handleResendVerificationEmail,
    isAuthenticated: !!user,
    isAdmin: hasAdminAccess(user?.role),
    isSuperAdmin: isSuperAdminRole(user?.role),
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export type { UserRole };
