import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getWeekStart } from "@/lib/week";

export interface CallTaskRow {
  id: string;
  account_id: string;
  assigned_salesperson_id: number | null;
  territory: string | null;
  week_start_date: string;
  status: string;
  priority: string;
  rollover_count: number;
  due_date: string | null;
  completed_at: string | null;
  account: {
    id: string;
    customer_number: string;
    account_name: string;
    date_last_sale: string | null;
    region: string | null;
    territory: string | null;
  } | null;
  last_note?: {
    note: string;
    next_follow_up_date: string | null;
    created_at: string;
  } | null;
}

export const useThisWeekCalls = (userId?: number | null) => {
  const [tasks, setTasks] = useState<CallTaskRow[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const weekStart = getWeekStart();
    // Run rollover first
    await (supabase.rpc as any)("roll_over_and_seed_week", {
      p_salesperson_id: userId,
      p_week_start: weekStart,
    });

    const { data, error } = await (supabase.from as any)("call_tasks")
      .select(
        `id, account_id, assigned_salesperson_id, territory, week_start_date, status, priority, rollover_count, due_date, completed_at,
         account:accounts(id, customer_number, account_name, date_last_sale, region, territory)`
      )
      .eq("assigned_salesperson_id", userId)
      .eq("week_start_date", weekStart)
      .order("priority", { ascending: false });

    if (error) {
      console.error("load tasks", error);
      setTasks([]);
    } else {
      setTasks((data || []) as CallTaskRow[]);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  return { tasks, loading, refresh: load };
};
