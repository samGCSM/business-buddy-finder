// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = "https://yjyokzmqbllxsdkixcfd.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqeW9rem1xYmxseHNka2l4Y2ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIyOTg1MTgsImV4cCI6MjA0Nzg3NDUxOH0.qh5zSmSP5mMFOaUWpI0bzEO0BfMk79Dmg5ogkF6MChk";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);