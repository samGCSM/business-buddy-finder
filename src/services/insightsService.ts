import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { getCurrentUser } from "@/services/userService";

export const getInsights = async (userId: number, userType: string) => {
  console.log('Getting insights for user:', userId, 'type:', userType);
  
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      console.error('No current user found');
      return { 
        dailyInsight: 'Please log in to view your insights.' 
      };
    }

    // Check for existing recent insight
    const { data: existingInsights, error: fetchError } = await supabase
      .from('ai_insights')
      .select('*')
      .eq('user_id', currentUser.id)
      .eq('content_type', 'daily_insight')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(1);

    if (fetchError) {
      console.error('Error fetching existing insights:', fetchError);
      throw fetchError;
    }

    console.log('Existing insights:', existingInsights);

    // If we have today's insight, return it
    if (existingInsights && existingInsights.length > 0) {
      return { dailyInsight: existingInsights[0].content };
    }

    // Generate new insight if we don't have one from today
    console.log('Generating new insight via edge function');
    const { data: insightData, error: insightError } = await supabase.functions.invoke('generate-insights', {
      body: { userId: currentUser.id, userType: currentUser.type }
    });

    if (insightError) {
      console.error('Error generating insight:', insightError);
      
      // Handle rate limit error specifically
      if (insightError.status === 429) {
        const fallbackMessage = "Today's insight will be available shortly. Please check back in a few minutes.";
        toast({
          title: "Rate limit reached",
          description: "Please try again in a few minutes.",
          variant: "default"
        });
        return { dailyInsight: fallbackMessage };
      }
      
      throw insightError;
    }

    // Only try to store the insight if we successfully generated one
    if (insightData?.content) {
      // Store the generated insight
      const { error: insertError } = await supabase
        .from('ai_insights')
        .insert({
          user_id: currentUser.id,
          content_type: 'daily_insight',
          content: insightData.content
        });

      if (insertError) {
        console.error('Error storing insight:', insertError);
        // Log the error but don't throw since we still have the insight to return
      }

      return { dailyInsight: insightData.content };
    }

    // Fallback message if no content was generated
    return {
      dailyInsight: 'Your daily insight will be available shortly. Please check back in a few minutes.'
    };
  } catch (error) {
    console.error('Error in getInsights:', error);
    toast({
      title: "Temporarily unavailable",
      description: "Daily insights will be back shortly. Please try again in a few minutes.",
      variant: "default"
    });
    return {
      dailyInsight: 'Your daily insight will be available shortly. Please check back in a few minutes.'
    };
  }
};