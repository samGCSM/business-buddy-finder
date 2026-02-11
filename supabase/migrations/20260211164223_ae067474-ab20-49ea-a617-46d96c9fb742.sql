-- Step 1: Transfer all prospects from Tom (15) and Olivia (25) to Diane (14)
UPDATE prospects SET user_id = 14 WHERE user_id IN (15, 25);