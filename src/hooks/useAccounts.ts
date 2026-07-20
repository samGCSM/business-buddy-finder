import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Account {
  id: string;
  customer_number: string;
  account_name: string;
  region: string | null;
  territory: string | null;
  assigned_salesperson_id: number | null;
  date_last_sale: string | null;
  priority: string;
  notes: string | null;
  source: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const useAccounts = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await (supabase.from as any)("accounts")
      .select("*")
      .order("account_name", { ascending: true })
      .limit(5000);
    if (error) console.error(error);
    setAccounts((data || []) as Account[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { accounts, loading, refresh: load };
};
