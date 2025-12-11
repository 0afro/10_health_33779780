USE health;

-- Required user for marking
INSERT INTO users (username, password)
VALUES ('gold', 'smiths');

-- Sample workouts for user id 1
INSERT INTO workouts (user_id, exercise, weight, reps, notes)
VALUES
(1, 'Bench Press', 67, 6, 'Warmup set'),
(1, 'Squat', 80, 7, 'Good session'),
(1, 'Deadlift', 100, 6, 'Heavy day');
