import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getWeekStart } from "@/lib/week";

export interface CallsDashboardCounts {
  this_week_calls: number;
  overdue_calls: number;
  follow_ups_due: number;
  completed_this_week: number;
  not_called_yet: number;
  rolled_over: number;
  sold_this_week: number;
}

const EMPTY: CallsDashboardCounts = {
  this_week_calls: 0,
  overdue_calls: 0,
  follow_ups_due: 0,
  completed_this_week: 0,
  not_called_yet: 0,
  rolled_over: 0,
  sold_this_week: 0,
};

export const useCallsDashboard = (userId?: number | null) => {
  const [data, setData] = useState<CallsDashboardCounts>(EMPTY);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const weekStart = getWeekStart();
    const { data: rows, error } = await (supabase.rpc as any)(
      "get_calls_dashboard",
      { p_user_id: userId, p_week_start: weekStart }
    );
    if (!error && rows && rows[0]) {
      setData(rows[0] as CallsDashboardCounts);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, refresh };
};
