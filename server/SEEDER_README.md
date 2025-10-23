# 🌱 Database Seeder - Demo Data Generator

This enhanced seeder creates **realistic demo data** perfect for presentations and demonstrations.

## ✨ NEW: Run Multiple Times!

The seeder now generates **unique users every time** using timestamp-based identifiers. You can run it multiple times to create as many demo users as you need!

## 📊 What It Creates

- **100 Students** with varied performance levels (configurable)
- **100 Parents** (one for each student)
- **3 Teachers** (students distributed among them)
- **1 Admin** user
- **9 Badges** (achievement system)
- **6 Activities** (speaking, pronunciation, etc.)
- **Activity Completions** with realistic scores and dates (up to 60 per student)
- **Progress Records** for all skill areas
- **Leaderboard data** with varied points and levels

## 🔑 Unique Batch System

Each time you run the seeder, it creates a unique batch with:
- **Unique Batch ID**: 6-digit timestamp (e.g., `234567`)
- **Unique Emails**: `student.234567.1@demo.com`, `parent.234567.1@demo.com`
- **No Duplicates**: Run multiple times safely!

## 🎯 Performance Distribution

The seeder creates a realistic distribution of student performance:

- **20% High Performers**
  - 1500-3000 points
  - Level 12-20
  - 30-60 activities completed
  - 5-9 badges earned
  - Advanced proficiency

- **50% Average Performers**
  - 500-1500 points
  - Level 5-12
  - 15-30 activities completed
  - 2-5 badges earned
  - Intermediate proficiency

- **30% Low Performers**
  - 50-500 points
  - Level 1-5
  - 3-15 activities completed
  - 0-2 badges earned
  - Beginner proficiency

## 🔧 Customization

To change the number of students, edit `server/src/database/seeder.service.ts`:

```typescript
private readonly STUDENT_COUNT = 50;  // Change this number
```

## 🚀 How to Run

### Option 1: Using Deploy Script (RECOMMENDED! ⭐)

The easiest way - just run the deploy script and select option 6:

```bash
# On your server
cd ~/lingoshid
./deploy.sh

# Select option 6: Seed demo data (100 students)
```

**Benefits:**
- ✅ Interactive confirmation
- ✅ Shows batch ID for reference
- ✅ Displays login credentials
- ✅ Safe to run multiple times

### Option 2: Direct Command

**Add 100 students to existing database:**

```bash
# On your server (production)
cd ~/lingoshid
docker compose exec backend npm run seed:prod

# Or local development
npm run seed
```

**Run multiple times to add more batches!** Each run creates 100 unique students.

### Option 3: Fresh Database

**Drop the existing database and start fresh:**

```bash
# On your server
cd ~/lingoshid

# Stop containers and remove data
docker compose down -v

# Start fresh and seed
docker compose up -d
sleep 30
docker compose exec backend npm run seed
```

### Option 4: Development Mode

```bash
# Local development
cd server
npm run seed
```

## 📝 Generated Demo Accounts

### Teachers (Always the same)

| Email | Password | Name |
|-------|----------|------|
| teacher@demo.com | demo123 | Maryam Hosseini |
| teacher2@demo.com | demo123 | Ahmad Karimi |
| teacher3@demo.com | demo123 | Zahra Rahimi |

### Students (Unique per batch)

- **Format:** `student.XXXXXX.1@demo.com` through `student.XXXXXX.100@demo.com`
- **XXXXXX** = 6-digit batch ID (shown in logs)
- **Password:** `demo123`
- **Names:** Realistic Iranian names (Ali, Zahra, Mohammad, etc.)
- **Example:** `student.234567.1@demo.com`

### Parents (Unique per batch)

- **Format:** `parent.XXXXXX.1@demo.com` through `parent.XXXXXX.100@demo.com`
- **XXXXXX** = Same batch ID as students
- **Password:** `demo123`
- **Each parent is linked to one student**
- **Example:** `parent.234567.1@demo.com`

### Admin (Always the same)

| Email | Password | Role |
|-------|----------|------|
| admin@demo.com | demo123 | Admin |

## 📈 What You'll See

After seeding, your platform will have:

### Leaderboard
- 50 students with varied points (50-3000 points)
- Realistic competition with top performers
- Students spread across different levels

### Teacher Analytics
- Activity trends over last 60 days
- Performance distribution charts
- Top 5 performers
- Students needing attention (bottom 5)
- Skill area analytics

### Student Dashboards
- Recent activity history
- Badges earned
- Progress tracking
- Realistic completion dates

### Progress Data
- 5 skill areas tracked per student
- Assessment levels (1-5)
- Detailed metrics and recommendations

## 🎓 Perfect for University Presentation

This seed data provides:
- ✅ **Full leaderboards** (not just one student!)
- ✅ **Realistic analytics** with trends and patterns
- ✅ **Varied performance levels** showing system capabilities
- ✅ **Complete data** for all features (badges, progress, etc.)
- ✅ **Activity history** spanning 60 days
- ✅ **Multiple teachers** to demonstrate multi-teacher support

## 🔄 Resetting Demo Data

To refresh the demo data:

```bash
# On server
cd ~/lingoshid

# Stop and remove everything
docker compose down -v

# Start fresh and seed
docker compose up -d
sleep 30  # Wait for database to be ready
docker compose exec backend npm run seed

# Check logs
docker compose logs backend
```

## 📊 Expected Output

When running the seeder, you should see:

```
🌱 Starting database seeding...
📊 Creating 100 students with realistic data...
🔑 Unique batch ID: 234567

🏅 Seeding badges...
   ✓ Badges already exist, skipping
🎯 Seeding activities...
   ✓ Activities already exist, skipping
👨‍🏫 Seeding teachers...
   ⚠️  Teacher teacher@demo.com already exists, skipping
   ⚠️  Teacher teacher2@demo.com already exists, skipping
   ⚠️  Teacher teacher3@demo.com already exists, skipping
   ✓ Teachers seeding completed
👨‍🎓 Seeding students and parents...
   ✓ Created 10/100 students...
   ✓ Created 20/100 students...
   ✓ Created 30/100 students...
   ...
   ✓ Created 100/100 students...
   ✓ All 100 students and parents created successfully

✅ Database seeding completed!

📈 Summary:
   - 100 students created
   - 100 parents created
   - 3 teachers created
   - All with realistic activity data, badges, and progress
   - Batch ID: 234567 (for reference)
```

**Note:** The batch ID (234567 in this example) is unique for each run. Use it to identify which users belong to this batch!

## 🎨 Data Features

- **Iranian Names:** Uses authentic Iranian first and last names
- **Realistic Dates:** Activity completions spread over last 60 days
- **Varied Scores:** 40-100% based on performance tier
- **Time Spent:** 2-15 minutes per activity
- **Streaks:** 0-45 days based on engagement level
- **Phone Numbers:** Iranian format (+98-912-XXX-XXXX)
- **Occupations:** Realistic parent occupations

## 🐛 Troubleshooting

**Issue:** "Users already exist, skipping"
- This is normal! The seeder won't duplicate data
- To reset, use `docker compose down -v`

**Issue:** Database connection errors
- Make sure database is running: `docker compose ps`
- Wait longer for DB to initialize: `sleep 30`

**Issue:** Out of memory
- Reduce STUDENT_COUNT to 25 or 30
- The seeder processes students one at a time

## 🎉 Ready for Your Presentation!

Your platform is now populated with 50 students, making all features look active and realistic. Perfect for impressing your university audience!

---

**Need Help?** Check the logs: `docker compose logs backend -f`
