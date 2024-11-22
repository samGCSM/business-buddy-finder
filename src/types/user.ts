export interface User {
  id: string;
  email: string;
  type: 'admin' | 'user';
  password: string;
  lastLogin: string;
  totalSearches: number;
  savedSearches: number;
}