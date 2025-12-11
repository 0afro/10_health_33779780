# RepsRealm – Fitness Tracking Web App

RepsRealm is a fitness tracking application built for the Dynamic Web Applications module.  
It allows users to register, log in, and track their workouts over time using a clean and simple interface.

Users can:
- Log workouts (exercise, weight, reps, notes)
- View workout history
- Edit existing workouts
- Delete workouts
- Search workouts by exercise name
- View graphs and progress charts (coming soon)
- Use a secure login system with session handling

The marking account **gold / smiths** comes pre-loaded with sample workout data.

---

## Features Implemented

### User Accounts
- Register new users with password validation  
  (8+ characters, 2 numbers, 1 uppercase letter)
- Login system using **express-session**
- Protected routes (users must be logged in)

### Workout Tracking
- Add a workout  
- View all workouts in a table  
- Edit a workout  
- Delete a workout  
- Search workouts by exercise name

### Database
- MySQL database (`health`)
- Users table + Workouts table
- Dummy data for `gold` account for marking

### Templates & Styling
- EJS templating with a single `layout.ejs`
- Clean purple/white/black theme (`style.css`)

---

## Installation & Setup

### 1. Install required Node packages
Run this in the project root:

```bash
npm install express ejs mysql2 dotenv express-session
