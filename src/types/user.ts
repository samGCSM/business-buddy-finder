export interface User {
  id: number;
  email: string;
  type: string;
  password: string;
  lastLogin: string;
  totalSearches: number;
  savedSearches: number;
}