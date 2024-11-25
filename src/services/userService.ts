import { User } from '@/types/user';
import * as supabaseService from './supabaseService';

export const getUsers = async (): Promise<User[]> => {
  return await supabaseService.getUsers();
};

export const saveUsers = async (users: User[]) => {
  for (const user of users) {
    if (user && user.id) {
      await supabaseService.saveUser(user);
    }
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  return await supabaseService.getCurrentUser();
};

export const setCurrentUser = async (user: User | null) => {
  if (user && user.id) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    await supabaseService.saveUser(user);
  } else {
    localStorage.removeItem('currentUser');
  }
};

export const updateUserStats = async (userId: string, type: 'search' | 'savedSearch') => {
  if (!userId) {
    console.error('No user ID provided for stats update');
    return;
  }
  await supabaseService.updateUserStats(userId, type);
};

export const updateUserLastLogin = async (userId: string) => {
  if (!userId) {
    console.error('No user ID provided for last login update');
    return;
  }
  await supabaseService.updateUserLastLogin(userId);
};

export const changeUserPassword = async (userId: string, newPassword: string) => {
  if (!userId) {
    console.error('No user ID provided for password change');
    return;
  }
  await supabaseService.changeUserPassword(userId, newPassword);
};