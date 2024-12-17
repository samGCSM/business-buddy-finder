import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const getInsights = async (userId: number, userType: string) => {
  console.log('Getting insights for user:', userId, 'type:', userType);
  
  try {
    // First, ensure we have a tracking record
    const { data: tracking, error: trackingError } = await supabase
      .from('user_insights_tracking')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (trackingError) {
      console.error('Error checking tracking:', trackingError);
      throw trackingError;
    }

    const today = new Date().toISOString().split('T')[0];
    const needsPepTalk = !tracking?.last_pep_talk_date || tracking.last_pep_talk_date < today;
    const needsRecommendations = !tracking?.last_recommendations_date || tracking.last_recommendations_date < today;

    // If no tracking record exists, create one
    if (!tracking) {
      console.log('Creating new tracking record for user:', userId);
      const { error: insertError } = await supabase
        .from('user_insights_tracking')
        .insert([{
          user_id: userId,
          last_pep_talk_date: null,
          last_recommendations_date: null
        }]);

      if (insertError) {
        console.error('Error creating tracking record:', insertError);
        throw insertError;
      }
    }

    // Get existing insights
    const { data: existingInsights, error: insightsError } = await supabase
      .from('ai_insights')
      .select('*')
      .eq('user_id', userId)
      .in('content_type', ['pep_talk', 'recommendations'])
      .order('created_at', { ascending: false })
      .limit(2);

    if (insightsError) {
      console.error('Error fetching existing insights:', insightsError);
      throw insightsError;
    }

    console.log('Existing insights:', existingInsights);

    let pepTalk = existingInsights?.find(i => i.content_type === 'pep_talk')?.content || '';
    let recommendations = existingInsights?.find(i => i.content_type === 'recommendations')?.content || '';

    // Generate new insights if needed
    if (needsPepTalk) {
      console.log('Generating new pep talk');
      try {
        const { data, error } = await supabase.functions.invoke('generate-insights', {
          body: {
            userId,
            userType,
            insightType: 'pep_talk'
          }
        });

        if (error) throw error;
        pepTalk = data.content;

      } catch (error) {
        console.error('Error generating pep talk:', error);
        toast({
          title: "Error",
          description: "Unable to generate daily motivation. Please try again later.",
          variant: "destructive",
        });
        pepTalk = 'Unable to generate daily motivation at this time. Please try again later.';
      }
    }

    if (needsRecommendations) {
      console.log('Generating new recommendations');
      try {
        const { data, error } = await supabase.functions.invoke('generate-insights', {
          body: {
            userId,
            userType,
            insightType: 'recommendations'
          }
        });

        if (error) throw error;
        recommendations = data.content;

      } catch (error) {
        console.error('Error generating recommendations:', error);
        toast({
          title: "Error",
          description: "Unable to generate recommendations. Please try again later.",
          variant: "destructive",
        });
        recommendations = 'Unable to generate recommendations at this time. Please try again later.';
      }
    }

    return {
      pepTalk,
      recommendations
    };
  } catch (error) {
    console.error('Error getting insights:', error);
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