import { supabase } from "@/integrations/supabase/client";
import type { Business } from "@/types/business";

export interface SavedSearch {
  id: string;
  date: string;
  location: string;
  keyword: string;
  results: Business[];
}

export const getSavedSearches = async (userId: string): Promise<SavedSearch[]> => {
  console.log('Fetching saved searches for user:', userId);
  const { data, error } = await supabase
    .from('saved_searches')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching saved searches:', error);
    throw error;
  }

  return data.map(search => ({
    id: search.id,
    date: new Date(search.created_at).toLocaleDateString(),
    location: search.location,
    keyword: search.keyword,
    results: search.results
  }));
};

export const saveSearch = async (
  userId: string,
  location: string,
  keyword: string,
  results: Business[]
): Promise<void> => {
  console.log('Saving search for user:', userId);
  const { error } = await supabase
    .from('saved_searches')
    .insert({
      user_id: userId,
      location,
      keyword,
      results
    });

  if (error) {
    console.error('Error saving search:', error);
    throw error;
  }
};