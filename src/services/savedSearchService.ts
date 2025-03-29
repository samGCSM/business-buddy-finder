
import { supabase } from "@/integrations/supabase/client";
import type { Business } from "@/types/business";
import type { Json } from "@/integrations/supabase/types";

export interface SavedSearch {
  id: string;
  date: string;
  location: string;
  keyword: string;
  radius?: number;
  results: Business[];
}

interface JsonResult {
  id: string;
  name: string;
  phone: string;
  email: string;
  website: string;
  reviewCount: number;
  rating: number;
  address: string;
}

export const getSavedSearches = async (userId: string): Promise<SavedSearch[]> => {
  console.log('Fetching saved searches for user:', userId);
  
  const userIdNumber = parseInt(userId);
  if (isNaN(userIdNumber)) {
    console.error('Invalid user ID format');
    throw new Error('Invalid user ID format');
  }

  const { data, error } = await supabase
    .from('saved_searches')
    .select('*')
    .eq('user_id', userIdNumber)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching saved searches:', error);
    throw error;
  }

  console.log('Raw saved searches data:', data);

  return data.map(search => {
    const results = Array.isArray(search.results) 
      ? ((search.results as unknown) as JsonResult[]).map(result => ({
          id: result.id,
          name: result.name,
          phone: result.phone,
          email: result.email,
          website: result.website,
          reviewCount: result.reviewCount,
          rating: result.rating,
          address: result.address
        }))
      : [];

    return {
      id: search.id,
      date: new Date(search.created_at || '').toLocaleDateString(),
      location: search.location,
      keyword: search.keyword,
      radius: search.radius || 10, // Use default radius of 10 if not defined
      results: results
    };
  });
};

export const saveSearch = async (
  userId: string,
  location: string,
  keyword: string,
  radius: number = 10,
  results: Business[]
): Promise<void> => {
  console.log('Attempting to save search for user:', userId);
  
  try {
    const userIdNumber = parseInt(userId);
    console.log('Parsed user ID:', userIdNumber);
    
    if (isNaN(userIdNumber)) {
      console.error('Invalid user ID format');
      throw new Error('Invalid user ID format');
    }

    const searchData = {
      user_id: userIdNumber,
      location,
      keyword,
      radius,
      results: results as unknown as Json,
      created_at: new Date().toISOString()
    };

    console.log('Saving search data:', searchData);

    const { error: insertError } = await supabase
      .from('saved_searches')
      .insert(searchData);

    if (insertError) {
      console.error('Insert error:', insertError);
      throw new Error('Failed to save search to database');
    }

    console.log('Search saved successfully');
  } catch (error) {
    console.error('Save search error:', error);
    throw error;
  }
};
