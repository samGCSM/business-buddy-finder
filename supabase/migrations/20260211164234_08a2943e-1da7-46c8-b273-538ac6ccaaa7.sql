-- Clean up all related data then delete users
DELETE FROM territories WHERE user_id IN (15, 25);
DELETE FROM saved_searches WHERE user_id IN (15, 25);
DELETE FROM notifications WHERE user_id IN (15, 25);
DELETE FROM ai_insights WHERE user_id IN (15, 25);
DELETE FROM user_insights_tracking WHERE user_id IN (15, 25);
DELETE FROM users WHERE id IN (15, 25);