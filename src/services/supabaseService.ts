import { createClient } from '@supabase/supabase-js';
import type { User } from '@/types/user';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export const getUsers = async (): Promise<User[]> => {
  console.log('Fetching users from Supabase');
  
  // For demo purposes, return hardcoded users instead of querying Supabase
  const demoUsers: User[] = [
    {
      id: '1',
      email: 'admin@example.com',
      type: 'admin',
      password: 'admin',
      lastLogin: new Date().toISOString(),
      totalSearches: 0,
      savedSearches: 0
    },
    {
      id: '2',
      email: 'user@example.com',
      type: 'user',
      password: 'user',
      lastLogin: new Date().toISOString(),
      totalSearches: 0,
      savedSearches: 0
    }
  ];
  
  return demoUsers;
};

export const saveUser = async (user: User): Promise<void> => {
  console.log('Saving user to localStorage:', user);
  if (user && user.id) {
    localStorage.setItem(`user_${user.id}`, JSON.stringify(user));
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  console.log('Getting current user from localStorage');
  const storedUser = localStorage.getItem('currentUser');
  return storedUser ? JSON.parse(storedUser) : null;
};

export const updateUserStats = async (userId: string, type: 'search' | 'savedSearch'): Promise<void> => {
  console.log('Updating user stats in localStorage:', userId, type);
  const userKey = `user_${userId}`;
  const storedUser = localStorage.getItem(userKey);
  
  if (storedUser) {
    const user = JSON.parse(storedUser);
    if (type === 'search') {
      user.totalSearches = (user.totalSearches || 0) + 1;
    } else {
      user.savedSearches = (user.savedSearches || 0) + 1;
    }
    localStorage.setItem(userKey, JSON.stringify(user));
  }
};

export const updateUserLastLogin = async (userId: string): Promise<void> => {
  console.log('Updating user last login in localStorage:', userId);
  const userKey = `user_${userId}`;
  const storedUser = localStorage.getItem(userKey);
  
  if (storedUser) {
    const user = JSON.parse(storedUser);
    user.lastLogin = new Date().toISOString();
    localStorage.setItem(userKey, JSON.stringify(user));
  }
};

export const changeUserPassword = async (userId: string, newPassword: string): Promise<void> => {
  console.log('Changing user password in localStorage:', userId);
  const userKey = `user_${userId}`;
  const storedUser = localStorage.getItem(userKey);
  
  if (storedUser) {
    const user = JSON.parse(storedUser);
    user.password = newPassword;
    localStorage.setItem(userKey, JSON.stringify(user));
  }
};