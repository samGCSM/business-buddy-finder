import { supabase } from "@/integrations/supabase/client";

export const generateDailyInsights = async (userId: number) => {
  try {
    console.log('Checking daily insights for user:', userId);
    
    const today = new Date().toISOString().split('T')[0];
    
    // Check if we already generated insights today
    const { data: tracking, error: trackingError } = await supabase
      .from('user_insights_tracking')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (trackingError && trackingError.code !== 'PGRST116') {
      console.error('Error checking insight tracking:', trackingError);
      return;
    }

    const needsPepTalk = !tracking?.last_pep_talk_date || 
      new Date(tracking.last_pep_talk_date).toISOString().split('T')[0] !== today;
    
    const needsRecommendations = !tracking?.last_recommendations_date || 
      new Date(tracking.last_recommendations_date).toISOString().split('T')[0] !== today;

    console.log('Needs pep talk:', needsPepTalk);
    console.log('Needs recommendations:', needsRecommendations);

    if (needsPepTalk) {
      console.log('Generating new pep talk');
      const pepTalk = generatePepTalk();
      const { error: insertError } = await supabase
        .from('ai_insights')
        .insert({
          user_id: userId,
          content_type: 'daily_motivation',
          content: pepTalk
        });

      if (insertError) {
        console.error('Error inserting pep talk:', insertError);
        return;
      }
    }

    if (needsRecommendations) {
      console.log('Generating new recommendations');
      const recommendations = generateRecommendations();
      const { error: insertError } = await supabase
        .from('ai_insights')
        .insert({
          user_id: userId,
          content_type: 'contact_recommendations',
          content: recommendations
        });

      if (insertError) {
        console.error('Error inserting recommendations:', insertError);
        return;
      }
    }

    // Update tracking
    const { error: upsertError } = await supabase
      .from('user_insights_tracking')
      .upsert({
        user_id: userId,
        last_pep_talk_date: needsPepTalk ? today : tracking?.last_pep_talk_date,
        last_recommendations_date: needsRecommendations ? today : tracking?.last_recommendations_date
      });

    if (upsertError) {
      console.error('Error updating tracking:', upsertError);
    }

  } catch (error) {
    console.error('Error generating daily insights:', error);
  }
};

const generatePepTalk = () => {
  const pepTalks = [
    "Today is your day to shine! Remember, every call is an opportunity to make a meaningful connection. Your dedication to building relationships sets you apart.",
    "You've got this! Your ability to understand and solve problems makes you invaluable to your prospects. Today's efforts are tomorrow's successes.",
    "Success is built one conversation at a time. Your persistence and professionalism are your superpowers. Make today count!",
    "Every 'no' brings you closer to a 'yes'. Your resilience is your greatest asset. Today could be the day you make that breakthrough connection!",
    "You're not just making calls – you're building bridges to success. Your expertise and dedication make a real difference. Let's make today amazing!"
  ];
  return pepTalks[Math.floor(Math.random() * pepTalks.length)];
};

const generateRecommendations = () => {
  const recommendations = [
    "Focus on high-priority prospects today. Consider reaching out to those you haven't contacted in the past week to maintain momentum.",
    "Review your prospect list for any follow-ups due this week. A timely check-in can make all the difference in moving deals forward.",
    "Look for opportunities to re-engage with prospects who showed initial interest. Sometimes, timing is everything in sales.",
    "Consider reaching out to your warm leads today. Your existing relationships are valuable assets waiting to be nurtured.",
    "Prioritize following up with prospects who requested additional information. Your prompt response could be the key to closing the deal."
  ];
  return recommendations[Math.floor(Math.random() * recommendations.length)];
};