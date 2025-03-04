
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useEmailEnrichment = () => {
  const [enrichingProspectId, setEnrichingProspectId] = useState<string | null>(null);

  const enrichProspectEmail = async (prospectId: string, domain?: string, companyName?: string) => {
    if (!domain && !companyName) {
      toast({
        title: "Error",
        description: "Website or company name is required for email enrichment",
        variant: "destructive",
      });
      return;
    }

    setEnrichingProspectId(prospectId);

    try {
      console.log("Enriching email for prospect:", prospectId, "domain:", domain, "company:", companyName);
      
      const { data: enrichmentData, error: enrichmentError } = await supabase.functions
        .invoke('enrich-prospect-email', {
          body: { domain, companyName }
        });

      if (enrichmentError) throw enrichmentError;
      
      console.log("Enrichment data received:", enrichmentData);

      let email = null;

      if (domain) {
        // Handle domain-search response
        const firstEmail = enrichmentData.data?.emails?.[0]?.value;
        if (firstEmail) email = firstEmail;
      } else {
        // Handle email-finder response
        email = enrichmentData.data?.email;
      }

      console.log("Extracted email:", email);

      if (email) {
        const { error: updateError } = await supabase
          .from('prospects')
          .update({ email })
          .eq('id', prospectId);

        if (updateError) throw updateError;

        toast({
          title: "Success",
          description: "Email found and saved successfully",
        });

        return email;
      } else {
        toast({
          title: "No Email Found",
          description: "Could not find an email address for this business",
        });
      }
    } catch (error) {
      console.error('Email enrichment error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to enrich email",
        variant: "destructive",
      });
    } finally {
      setEnrichingProspectId(null);
    }
  };

  return {
    enrichProspectEmail,
    enrichingProspectId
  };
};
