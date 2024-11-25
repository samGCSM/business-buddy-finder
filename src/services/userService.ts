import { User } from '@/types/user';
import * as supabaseService from './supabaseService';

export const getUsers = async (): Promise<User[]> => {
  console.log('Getting users from service');
  return await supabaseService.getUsers();
};

export const saveUsers = async (users: User[]) => {
  console.log('Saving users:', users);
  for (const user of users) {
    if (user && user.id) {
      await supabaseService.saveUser(user);
    }
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  console.log('Getting current user from service');
  return await supabaseService.getCurrentUser();
};

export const setCurrentUser = async (user: User | null) => {
  console.log('Setting current user:', user);
  if (user && user.id) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    await supabaseService.saveUser(user);
  } else {
    localStorage.removeItem('currentUser');
  }
};

export const updateUserStats = async (userId: string, type: 'search' | 'savedSearch') => {
  console.log('Updating user stats:', userId, type);
  if (!userId) {
    console.error('No user ID provided for stats update');
    return;
  }
  await supabaseService.updateUserStats(userId, type);
};

export const updateUserLastLogin = async (userId: string) => {
  console.log('Updating user last login:', userId);
  if (!userId) {
    console.error('No user ID provided for last login update');
    return;
  }
  await supabaseService.updateUserLastLogin(userId);
};

export const changeUserPassword = async (userId: string, newPassword: string) => {
  console.log('Changing user password:', userId);
  if (!userId) {
    console.error('No user ID provided for password change');
    return false;
  }
  try {
    await supabaseService.changeUserPassword(userId, newPassword);
    return true;
  } catch (error) {
    console.error('Error changing password:', error);
    return false;
  }
};