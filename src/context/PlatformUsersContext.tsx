import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  INITIAL_PLATFORM_USERS,
  loadPlatformUsers,
  savePlatformUsers,
  createPlatformUser,
  updatePlatformUser,
  deletePlatformUser,
  CreatePlatformUserInput,
  UpdatePlatformUserInput,
} from '../data/authUsers';
import { PlatformUser, UserRole, UserStatus } from '../types/user';

interface PlatformUsersContextValue {
  users: PlatformUser[];
  isLoading: boolean;
  createUser: (input: CreatePlatformUserInput) => Promise<PlatformUser>;
  updateUser: (userId: string, input: UpdatePlatformUserInput) => Promise<PlatformUser>;
  deleteUser: (userId: string) => Promise<void>;
  updateUserRole: (userId: string, role: UserRole) => Promise<void>;
  updateUserStatus: (userId: string, status: UserStatus) => Promise<void>;
  stats: {
    total: number;
    superAdmins: number;
    admins: number;
    members: number;
    suspended: number;
  };
}

const PlatformUsersContext = createContext<PlatformUsersContextValue | undefined>(undefined);

export const PlatformUsersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<PlatformUser[]>(INITIAL_PLATFORM_USERS);
  const [isLoading, setIsLoading] = useState(true);

  const reload = async () => {
    const stored = await loadPlatformUsers();
    setUsers(stored);
  };

  useEffect(() => {
    const load = async () => {
      try {
        await reload();
      } catch (error) {
        console.error('Failed to load platform users:', error);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const persist = async (next: PlatformUser[]) => {
    setUsers(next);
    await savePlatformUsers(next);
  };

  const createUser = async (input: CreatePlatformUserInput) => {
    const created = await createPlatformUser(input);
    await reload();
    return created;
  };

  const updateUser = async (userId: string, input: UpdatePlatformUserInput) => {
    const updated = await updatePlatformUser(userId, input);
    await reload();
    return updated;
  };

  const deleteUser = async (userId: string) => {
    await deletePlatformUser(userId);
    await reload();
  };

  const updateUserRole = async (userId: string, role: UserRole) => {
    await updateUser(userId, { role });
  };

  const updateUserStatus = async (userId: string, status: UserStatus) => {
    await updateUser(userId, { status });
  };

  const stats = useMemo(
    () => ({
      total: users.length,
      superAdmins: users.filter((user) => user.role === 'super_admin').length,
      admins: users.filter((user) => user.role === 'admin').length,
      members: users.filter((user) => user.role === 'customer').length,
      suspended: users.filter((user) => user.status === 'suspended').length,
    }),
    [users]
  );

  const value = useMemo(
    () => ({
      users,
      isLoading,
      createUser,
      updateUser,
      deleteUser,
      updateUserRole,
      updateUserStatus,
      stats,
    }),
    [users, isLoading, stats]
  );

  return <PlatformUsersContext.Provider value={value}>{children}</PlatformUsersContext.Provider>;
};

export const usePlatformUsers = () => {
  const context = useContext(PlatformUsersContext);
  if (!context) {
    throw new Error('usePlatformUsers must be used within PlatformUsersProvider');
  }
  return context;
};
