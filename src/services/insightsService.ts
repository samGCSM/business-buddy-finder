import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
      
      // Generate pep talk if needed
      if (!recentPepTalk) {
        try {
          const { data: pepTalkData, error: pepTalkError } = await supabase.functions.invoke('generate-insights', {
            body: { userId, userType, insightType: 'pep_talk' }
          });

          if (pepTalkError) {
            console.error('Error generating pep talk:', pepTalkError);
            toast({
              title: "Error",
              description: "Failed to generate pep talk. Please try again later.",
              variant: "destructive",
            });
          } else {
            console.log('Generated pep talk:', pepTalkData);
            insights.pepTalk = pepTalkData.content;
          }
        } catch (error) {
          console.error('Error invoking generate-insights for pep talk:', error);
        }
      }

      // Add delay between requests to avoid rate limits
      await delay(2000);

      // Generate recommendations if needed
      if (!recentRecommendations) {
        try {
          const { data: recommendationsData, error: recommendationsError } = await supabase.functions.invoke('generate-insights', {
            body: { userId, userType, insightType: 'recommendations' }
          });

          if (recommendationsError) {
            console.error('Error generating recommendations:', recommendationsError);
            toast({
              title: "Error",
              description: "Failed to generate recommendations. Please try again later.",
              variant: "destructive",
            });
          } else {
            console.log('Generated recommendations:', recommendationsData);
            insights.recommendations = recommendationsData.content;
          }
        } catch (error) {
          console.error('Error invoking generate-insights for recommendations:', error);
        }
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