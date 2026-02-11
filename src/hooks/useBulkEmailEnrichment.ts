import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Prospect } from "@/types/prospects";

interface BulkEnrichmentState {
  isEnriching: boolean;
  progress: { current: number; total: number };
  foundCount: number;
}

export const useBulkEmailEnrichment = () => {
  const [state, setState] = useState<BulkEnrichmentState>({
    isEnriching: false,
    progress: { current: 0, total: 0 },
    foundCount: 0,
  });

  const enrichProspects = useCallback(async (prospects: Prospect[], onComplete: () => void) => {
    const enrichable = prospects.filter(
      (p) => (!p.email || p.email.toLowerCase() === 'n/a') && ((p.website && p.website.toLowerCase() !== 'n/a') || p.business_name)
    );

    if (enrichable.length === 0) {
      toast({ title: "No prospects to enrich", description: "All selected prospects already have emails or lack website/name data." });
      return;
    }

    setState({ isEnriching: true, progress: { current: 0, total: enrichable.length }, foundCount: 0 });
    let found = 0;

    for (let i = 0; i < enrichable.length; i++) {
      const prospect = enrichable[i];
      setState((prev) => ({ ...prev, progress: { current: i + 1, total: enrichable.length } }));

      try {
        // Extract domain from website
        let domain: string | undefined;
        if (prospect.website) {
          try {
            const url = prospect.website.startsWith("http") ? prospect.website : `https://${prospect.website}`;
            domain = new URL(url).hostname;
          } catch { /* ignore invalid URLs */ }
        }

        const { data, error } = await supabase.functions.invoke("enrich-prospect-email", {
          body: { domain, companyName: prospect.business_name },
        });

        if (error) throw error;

        // Extract email from Hunter.io response
        let email: string | null = null;
        if (data?.data?.emails?.length > 0) {
          email = data.data.emails[0].value;
        } else if (data?.data?.email) {
          email = data.data.email;
        }

        if (email) {
          await supabase.from("prospects").update({ email }).eq("id", prospect.id);
          found++;
          setState((prev) => ({ ...prev, foundCount: found }));
        }
      } catch (err) {
        console.error(`Failed to enrich ${prospect.business_name}:`, err);
      }

      // Rate limit delay (skip after last item)
      if (i < enrichable.length - 1) {
        await new Promise((r) => setTimeout(r, 500));
      }
    }

    setState({ isEnriching: false, progress: { current: 0, total: 0 }, foundCount: 0 });
    toast({
      title: "Bulk enrichment complete",
      description: `Found ${found} email${found !== 1 ? "s" : ""} out of ${enrichable.length} prospects.`,
    });
    onComplete();
  }, []);

  return { ...state, enrichProspects };
};
