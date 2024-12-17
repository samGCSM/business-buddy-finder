import { supabase } from "@/integrations/supabase/client";

export const getInsights = async (userId: number, userType: string) => {
  console.log('Getting insights for user:', userId, 'type:', userType);
  
  try {
    // Check if we need to generate new insights
    const { data: tracking } = await supabase
      .from('user_insights_tracking')
      .select('*')
      .eq('user_id', userId)
      .single();

    const today = new Date().toISOString().split('T')[0];
    const needsPepTalk = !tracking?.last_pep_talk_date || tracking.last_pep_talk_date < today;
    const needsRecommendations = !tracking?.last_recommendations_date || tracking.last_recommendations_date < today;

    // Get existing insights
    const { data: existingInsights } = await supabase
      .from('ai_insights')
      .select('*')
      .eq('user_id', userId)
      .in('content_type', ['pep_talk', 'recommendations'])
      .order('created_at', { ascending: false })
      .limit(2);

    const insights: Record<string, string> = {
      pepTalk: '',
      recommendations: ''
    };

    // Generate new insights if needed
    if (needsPepTalk) {
      console.log('Generating new pep talk');
      const response = await fetch('/api/generate-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          userType,
          insightType: 'pep_talk'
        }),
      });
      const data = await response.json();
      insights.pepTalk = data.content;
    } else {
      insights.pepTalk = existingInsights?.find(i => i.content_type === 'pep_talk')?.content || '';
    }

    if (needsRecommendations) {
      console.log('Generating new recommendations');
      const response = await fetch('/api/generate-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          userType,
          insightType: 'recommendations'
        }),
      });
      const data = await response.json();
      insights.recommendations = data.content;
    } else {
      insights.recommendations = existingInsights?.find(i => i.content_type === 'recommendations')?.content || '';
    }

    return insights;
  } catch (error) {
    console.error('Error getting insights:', error);
    throw error;
  }
};