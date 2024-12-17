import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const getInsights = async (userId: number, userType: string) => {
  console.log('Getting insights for user:', userId, 'type:', userType);
  
  try {
    // Check for existing recent insight
    const { data: existingInsights, error: fetchError } = await supabase
      .from('ai_insights')
      .select('*')
      .eq('user_id', userId)
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
      body: { userId, userType }
    });

    if (insightError) {
      console.error('Error generating insight:', insightError);
      
      // Handle rate limit error specifically
      if (insightError.status === 429) {
        const fallbackMessage = "Today's insight is not available right now due to high demand. Please try again in a few minutes.";
        toast({
          title: "Rate Limit Reached",
          description: "Please try again in a few minutes",
          variant: "destructive",
        });
        return { dailyInsight: fallbackMessage };
      }
      
      throw insightError;
    }

    console.log('Generated insight:', insightData);

    // Store the new insight
    const { error: insertError } = await supabase
      .from('ai_insights')
      .insert({
        user_id: userId,
        content_type: 'daily_insight',
        content: insightData.content
      });

    if (insertError) {
      console.error('Error storing insight:', insertError);
    }

    return { dailyInsight: insightData.content };
  } catch (error) {
    console.error('Error in getInsights:', error);
    toast({
      title: "Error",
      description: "Unable to load insights. Please try again later.",
      variant: "destructive",
    });
    return {
      dailyInsight: 'Unable to load insights at this time. Please try again later.'
    };
  }
};