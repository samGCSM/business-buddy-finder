import { supabase } from "@/integrations/supabase/client";
import type { Business } from "@/types/business";
import { Database } from "@/integrations/supabase/types";

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
    .eq('user_id', parseInt(userId));

  if (error) {
    console.error('Error fetching saved searches:', error);
    throw error;
  }

  return data.map(search => {
    // Validate and transform the results array
    const results = Array.isArray(search.results) 
      ? search.results.map(result => ({
          id: String(result.id || ''),
          name: String(result.name || ''),
          phone: String(result.phone || ''),
          email: String(result.email || ''),
          website: String(result.website || ''),
          reviewCount: Number(result.reviewCount || 0),
          rating: Number(result.rating || 0),
          address: String(result.address || '')
        }))
      : [];

    return {
      id: search.id,
      date: new Date(search.created_at || '').toLocaleDateString(),
      location: search.location,
      keyword: search.keyword,
      results: results
    };
  });
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
      user_id: parseInt(userId),
      location,
      keyword,
      results: results as unknown as Database['public']['Tables']['saved_searches']['Insert']['results']
    });

  if (error) {
    console.error('Error saving search:', error);
    throw error;
  }
};