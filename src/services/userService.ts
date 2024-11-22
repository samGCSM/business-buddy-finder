import { User } from '@/types/user';
import * as supabaseService from './supabaseService';

export const getUsers = async (): Promise<User[]> => {
  return await supabaseService.getUsers();
};

export const saveUsers = async (users: User[]) => {
  for (const user of users) {
    await supabaseService.saveUser(user);
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  return await supabaseService.getCurrentUser();
};

export const setCurrentUser = async (user: User | null) => {
  if (user) {
    await supabaseService.saveUser(user);
  }
};

export const updateUserStats = async (userId: string, type: 'search' | 'savedSearch') => {
  await supabaseService.updateUserStats(userId, type);
};

export const updateUserLastLogin = async (userId: string) => {
  await supabaseService.updateUserLastLogin(userId);
};

export const changeUserPassword = async (userId: string, newPassword: string) => {
  await supabaseService.changeUserPassword(userId, newPassword);
};