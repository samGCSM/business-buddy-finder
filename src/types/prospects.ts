import { Json } from "@/integrations/supabase/types";

export interface Prospect {
  id: string;
  user_id: number;
  business_name: string;
  notes: string | null;
  website: string | null;
  email: string | null;
  business_address: string | null;
  phone_number: string | null;
  owner_name: string | null;
  status: string | null;
  priority: string | null;
  owner_phone: string | null;
  owner_email: string | null;
  last_contact: string | null;
  activity_log: Json[] | null;
  rating: number | null;
  review_count: number | null;
  territory: string | null;
  ai_company_insights: Json[] | null;
  location_type: string | null;
}