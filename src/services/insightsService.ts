import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const getInsights = async (userId: number, userType: string) => {
  console.log('Getting insights for user:', userId, 'type:', userType);
  
  try {
    // First check for existing recent insights
    const { data: existingInsights, error: fetchError } = await supabase
      .from('ai_insights')
      .select('*')
      .eq('user_id', userId)
      .in('content_type', ['pep_talk', 'recommendations'])
      .order('created_at', { ascending: false })
      .limit(2);

    if (fetchError) {
      console.error('Error fetching existing insights:', fetchError);
      throw fetchError;
    }

    console.log('Existing insights:', existingInsights);

    // Check if we have recent insights (less than 24 hours old)
    const recentPepTalk = existingInsights?.find(i => 
      i.content_type === 'pep_talk' && 
      new Date(i.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );
    
    const recentRecommendations = existingInsights?.find(i => 
      i.content_type === 'recommendations' && 
      new Date(i.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );

    // Initialize results object
    let insights = {
      pepTalk: recentPepTalk?.content || '',
      recommendations: recentRecommendations?.content || ''
    };

    // Generate new insights if needed
    if (!recentPepTalk || !recentRecommendations) {
      console.log('Generating new insights via edge function');
      
      try {
        const { data, error } = await supabase.functions.invoke('generate-insights', {
          body: { userId, userType, insightType: !recentPepTalk ? 'pep_talk' : 'recommendations' }
        });

        if (error) {
          console.error('Error generating insights:', error);
          toast({
            title: "Error",
            description: "Failed to generate new insights. Please try again later.",
            variant: "destructive",
          });
        } else {
          console.log('Generated insights:', data);
          if (!recentPepTalk) {
            insights.pepTalk = data.content;
          }
          if (!recentRecommendations) {
            insights.recommendations = data.content;
          }
        }
      } catch (error) {
        console.error('Error invoking generate-insights function:', error);
        toast({
          title: "Error",
          description: "Failed to generate insights. Please try again later.",
          variant: "destructive",
        });
      }
    }

    return insights;
  } catch (error) {
    console.error('Error in getInsights:', error);
    toast({
      title: "Error",
      description: "Unable to load insights. Please try again later.",
      variant: "destructive",
    });
    return {
      pepTalk: 'Unable to load insights at this time. Please try again later.',
      recommendations: 'Unable to load insights at this time. Please try again later.'
    };
  }
};