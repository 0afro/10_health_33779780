USE health;

-- Get gold user ID
SET @gold_id = (SELECT id FROM users WHERE username = 'gold');

-- Bench Press progression
INSERT INTO workouts (user_id, exercise, weight, reps, notes) VALUES
(@gold_id, 'Bench Press', 40, 10, 'Week 1'),
(@gold_id, 'Bench Press', 45, 10, 'Week 2'),
(@gold_id, 'Bench Press', 50, 8, 'Week 3'),
(@gold_id, 'Bench Press', 55, 8, 'Week 4'),
(@gold_id, 'Bench Press', 60, 6, 'Week 5'),
(@gold_id, 'Bench Press', 62, 6, 'Week 6');

-- Squat progression
INSERT INTO workouts (user_id, exercise, weight, reps, notes) VALUES
(@gold_id, 'Squat', 60, 12, 'Light day'),
(@gold_id, 'Squat', 70, 10, 'Good form'),
(@gold_id, 'Squat', 80, 8, 'Heavy set'),
(@gold_id, 'Squat', 85, 6, 'PR attempt'),
(@gold_id, 'Squat', 90, 5, 'Strong');

-- Deadlift progression
INSERT INTO workouts (user_id, exercise, weight, reps, notes) VALUES
(@gold_id, 'Deadlift', 80, 6, 'Warmup'),
(@gold_id, 'Deadlift', 100, 5, 'Good pull'),
(@gold_id, 'Deadlift', 110, 5, 'Felt heavy'),
(@gold_id, 'Deadlift', 120, 3, 'Progressing'),
(@gold_id, 'Deadlift', 130, 2, 'New PR');

-- Shoulder Press
INSERT INTO workouts (user_id, exercise, weight, reps, notes) VALUES
(@gold_id, 'Shoulder Press', 20, 12, 'Warmup'),
(@gold_id, 'Shoulder Press', 30, 10, 'Good'),
(@gold_id, 'Shoulder Press', 35, 8, 'Challenging'),
(@gold_id, 'Shoulder Press', 40, 6, 'Heavy');

-- Barbell Rows
INSERT INTO workouts (user_id, exercise, weight, reps, notes) VALUES
(@gold_id, 'Barbell Row', 40, 12, ''),
(@gold_id, 'Barbell Row', 45, 10, ''),
(@gold_id, 'Barbell Row', 50, 8, '');

-- Dumbbell Curls
INSERT INTO workouts (user_id, exercise, weight, reps, notes) VALUES
(@gold_id, 'Dumbbell Curl', 10, 12, ''),
(@gold_id, 'Dumbbell Curl', 12, 10, ''),
(@gold_id, 'Dumbbell Curl', 14, 8, '');

-- Lat Pulldown
INSERT INTO workouts (user_id, exercise, weight, reps, notes) VALUES
(@gold_id, 'Lat Pulldown', 35, 12, ''),
(@gold_id, 'Lat Pulldown', 40, 10, ''),
(@gold_id, 'Lat Pulldown', 45, 8, '');

-- Pushups (bodyweight)
INSERT INTO workouts (user_id, exercise, weight, reps, notes) VALUES
(@gold_id, 'Pushups', 0, 20, ''),
(@gold_id, 'Pushups', 0, 25, ''),
(@gold_id, 'Pushups', 0, 30, '');
