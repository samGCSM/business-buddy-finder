export interface UserStats {
  id: number;
  total_prospects: number;
  searches_last_30_days: number;
  total_saved_searches: number;
}

export interface User {
  id: number;
  email: string;
  type: string;
  password: string;
  lastLogin: string;
  totalSearches: number;
  savedSearches: number;
  stats?: UserStats;
}