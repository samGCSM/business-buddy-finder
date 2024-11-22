import { User } from '@/types/user';

const USER_STORAGE_KEY = 'users';
const CURRENT_USER_KEY = 'currentUser';

export const getUsers = (): User[] => {
  const users = localStorage.getItem(USER_STORAGE_KEY);
  return users ? JSON.parse(users) : [
    { 
      id: '1', 
      email: 'admin@example.com', 
      password: 'admin', 
      type: 'admin',
      lastLogin: new Date().toISOString(),
      totalSearches: 0,
      savedSearches: 0
    },
    { 
      id: '2', 
      email: 'user@example.com', 
      password: 'user', 
      type: 'user',
      lastLogin: new Date().toISOString(),
      totalSearches: 0,
      savedSearches: 0
    }
  ];
};

export const saveUsers = (users: User[]) => {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
};

export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem(CURRENT_USER_KEY);
  return user ? JSON.parse(user) : null;
};

export const setCurrentUser = (user: User | null) => {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};

export const updateUserStats = (userId: string, type: 'search' | 'savedSearch') => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex !== -1) {
    if (type === 'search') {
      users[userIndex].totalSearches += 1;
    } else {
      users[userIndex].savedSearches += 1;
    }
    saveUsers(users);
    
    // Update current user if it's the same user
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(users[userIndex]);
    }
  }
};

export const updateUserLastLogin = (userId: string) => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex !== -1) {
    users[userIndex].lastLogin = new Date().toISOString();
    saveUsers(users);
  }
};

export const changeUserPassword = (userId: string, newPassword: string) => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex !== -1) {
    users[userIndex].password = newPassword;
    saveUsers(users);
    return true;
  }
  return false;
};