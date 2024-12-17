import { supabase } from "@/integrations/supabase/client";

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
      const { error: createError } = await supabase
        .from('user_insights_tracking')
        .insert([{
          user_id: userId,
          last_pep_talk_date: null,
          last_recommendations_date: null
        }]);

      if (createError) {
        console.error('Error creating tracking record:', createError);
        throw createError;
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

    const insights = {
      pepTalk: '',
      recommendations: ''
    };

    // Generate new insights if needed
    if (needsPepTalk) {
      console.log('Generating new pep talk');
      const { data, error } = await supabase.functions.invoke('generate-insights', {
        body: {
          userId,
          userType,
          insightType: 'pep_talk'
        }
      });

      if (error) {
        console.error('Error generating pep talk:', error);
        throw error;
      }

      insights.pepTalk = data.content;

      // Update tracking record
      const { error: upsertError } = await supabase
        .from('user_insights_tracking')
        .upsert({
          user_id: userId,
          last_pep_talk_date: today
        });

      if (upsertError) {
        console.error('Error updating tracking:', upsertError);
        throw upsertError;
      }
    } else {
      insights.pepTalk = existingInsights?.find(i => i.content_type === 'pep_talk')?.content || 'Loading pep talk...';
    }

    if (needsRecommendations) {
      console.log('Generating new recommendations');
      const { data, error } = await supabase.functions.invoke('generate-insights', {
        body: {
          userId,
          userType,
          insightType: 'recommendations'
        }
      });

      if (error) {
        console.error('Error generating recommendations:', error);
        throw error;
      }

      insights.recommendations = data.content;

      // Update tracking record
      const { error: upsertError } = await supabase
        .from('user_insights_tracking')
        .upsert({
          user_id: userId,
          last_recommendations_date: today
        });

      if (upsertError) {
        console.error('Error updating tracking:', upsertError);
        throw upsertError;
      }
    } else {
      insights.recommendations = existingInsights?.find(i => i.content_type === 'recommendations')?.content || 'Loading recommendations...';
    }

    return insights;
  } catch (error) {
    console.error('Error getting insights:', error);
    throw error;
  }
};