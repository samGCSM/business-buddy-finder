import { Json } from "@/integrations/supabase/types";

export type ContactType = 'Phone Call' | 'Email' | 'Text Message' | 'Face to Face';

export interface ContactHistoryItem {
  type: ContactType;
  timestamp: string;
  notes: string;
  [key: string]: string; // Add index signature to make it compatible with Json type
}

export interface ContactLogProps {
  isOpen: boolean;
  onClose: () => void;
  prospectId: string;
  prospectName: string;
  onContactLogged: () => void;
}

export interface ContactHistoryProps {
  contactHistory: ContactHistoryItem[];
}

export interface ContactFormProps {
  onSubmit: (contact: ContactHistoryItem) => void;
}