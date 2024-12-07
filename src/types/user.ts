export interface User {
  id: number;
  email: string;
  type: 'admin' | 'user';
  password: string;
  lastLogin: string;
  totalSearches: number;
  savedSearches: number;
}