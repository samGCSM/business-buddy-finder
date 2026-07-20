import { supabase } from "@/integrations/supabase/client";
import { getWeekStart } from "@/lib/week";
import type { Prospect } from "@/types/prospects";

export interface AddToCallsResult {
  added: number;
  duplicates: number;
  failed: number;
}

/**
 * Push one or more prospects onto the current-week Calls Report for the given salesperson.
 * Auto-creates a matching `accounts` row (customer_number = PR-<prospect id first 8>) if needed,
 * then inserts a `call_tasks` row for the current week. Existing tasks for the same
 * account/week are skipped via the unique constraint.
 */
export const addProspectsToCalls = async (
  prospects: Prospect[],
  salespersonId: number
): Promise<AddToCallsResult> => {
  const result: AddToCallsResult = { added: 0, duplicates: 0, failed: 0 };
  const weekStart = getWeekStart();

  for (const p of prospects) {
    try {
      const customerNumber = `PR-${p.id.replace(/-/g, "").slice(0, 8)}`;

      // Find or create account
      const { data: existing, error: findErr } = await (supabase.from as any)("accounts")
        .select("id")
        .eq("customer_number", customerNumber)
        .maybeSingle();
      if (findErr) throw findErr;

      let accountId: string | null = existing?.id ?? null;

      if (!accountId) {
        const { data: created, error: createErr } = await (supabase.from as any)("accounts")
          .insert({
            customer_number: customerNumber,
            account_name: p.business_name,
            territory: p.territory || null,
            assigned_salesperson_id: salespersonId,
            source: "prospect",
            notes: p.business_address || null,
          })
          .select("id")
          .single();
        if (createErr) throw createErr;
        accountId = created.id;
      }

      // Insert call task; unique (account_id, week_start_date) means duplicates fail gracefully
      const { error: taskErr } = await (supabase.from as any)("call_tasks").insert({
        account_id: accountId,
        assigned_salesperson_id: salespersonId,
        territory: p.territory || null,
        week_start_date: weekStart,
        status: "not_called",
        priority: (p.priority || "normal").toLowerCase() === "high" ? "urgent" : "normal",
      });

      if (taskErr) {
        // 23505 = unique_violation → already on this week's list
        if ((taskErr as any).code === "23505") {
          result.duplicates += 1;
        } else {
          throw taskErr;
        }
      } else {
        result.added += 1;
      }
    } catch (e) {
      console.error("addProspectsToCalls failed for", p.id, e);
      result.failed += 1;
    }
  }

  return result;
};
