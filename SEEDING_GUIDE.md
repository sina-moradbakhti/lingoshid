# Database Seeding Guide

Complete guide for seeding your Lingoshid database with demo data.

## 📚 What is Database Seeding?

Seeding populates your database with initial demo data including:
- **Demo Users** (student, teacher, parent accounts)
- **Badges** (achievement badges for students)
- **Activities** (learning activities and exercises)

---

## 🌱 Seeding Methods

### Method 1: Automatic Seeding (During Deployment)

When you run `./deploy.sh` and choose option **1** (Fresh deployment), it automatically seeds the database if it's empty.

**How it works:**
1. Deployment script checks if database has data
2. If empty, automatically runs the seeder
3. Creates all demo users, badges, and activities

**Note:** This only works on fresh deployments with empty databases.

---

### Method 2: Manual Seeding (Recommended)

#### A. In Production (Docker Container)

**Seed the database:**
```bash
docker compose exec backend npm run seed
```

**What happens:**
- ✅ Checks if data already exists (prevents duplicates)
- ✅ Creates demo users with hashed passwords
- ✅ Creates badges for achievements
- ✅ Creates sample activities
- ✅ Safe to run multiple times (won't duplicate)

#### B. In Development (Local)

**From root directory:**
```bash
npm run seed
```

**Or from server directory:**
```bash
cd server
npm run seed
```

---

### Method 3: Force Re-seed (Clear and Re-populate)

**⚠️ WARNING: This deletes ALL data!**

```bash
# Stop containers
docker compose down

# Remove database volume
docker volume rm lingoshid_mysql_data

# Start fresh and seed
docker compose up -d
sleep 15  # Wait for database to be ready
docker compose exec backend npm run seed
```

---

## 🔍 What Gets Seeded?

### 1. Demo Users

The seeder creates these test accounts:

**Student Account:**
- Email: `student@demo.com`
- Password: (check `server/src/database/seeder.service.ts` for current password)
- Role: Student
- Linked to demo parent

**Teacher Account:**
- Email: `teacher@demo.com`
- Password: (check seeder service)
- Role: Teacher

**Parent Account:**
- Email: `parent@demo.com`
- Password: (check seeder service)
- Role: Parent
- Linked to demo student

### 2. Badges

Achievement badges for:
- First Steps
- Speaking Star
- Grammar Guru
- Vocabulary Victor
- etc.

### 3. Activities

Sample learning activities:
- Speaking exercises
- Listening comprehension
- Grammar quizzes
- Vocabulary games

---

## 🚀 Common Seeding Scenarios

### Scenario 1: Initial Setup

**When:** First time deploying the platform

```bash
# Deploy and seed automatically
./deploy.sh
# Choose option 1 (Fresh deployment)
```

### Scenario 2: Adding More Data

**When:** Need to add more seed data after deployment

```bash
# Run seeder manually
docker compose exec backend npm run seed
```

**Note:** Seeder checks for existing data and won't duplicate.

### Scenario 3: Reset Database

**When:** Want to start completely fresh

```bash
# Option A: Drop and recreate database
docker compose exec database mysql -u root -p$DB_PASSWORD -e "DROP DATABASE lingoshid; CREATE DATABASE lingoshid;"
docker compose restart backend
sleep 5
docker compose exec backend npm run seed

# Option B: Remove volume (nuclear option)
docker compose down
docker volume rm lingoshid_mysql_data
docker compose up -d
sleep 15
docker compose exec backend npm run seed
```

### Scenario 4: Custom Seeding

**When:** Want to add your own custom data

1. **Edit seeder service:**
```bash
nano server/src/database/seeder.service.ts
```

2. **Add your custom data** to the appropriate seed methods

3. **Rebuild and run:**
```bash
# If running locally
npm run seed

# If in Docker
docker compose up -d --build backend
docker compose exec backend npm run seed
```

---

## 🛠️ Seeding Commands Reference

### Production (Docker)

```bash
# Seed database
docker compose exec backend npm run seed

# Check if seeding succeeded (view logs)
docker compose logs backend | grep "seed"

# Restart backend after seeding
docker compose restart backend
```

### Development (Local)

```bash
# Seed (development)
cd server
npm run seed

# Seed (if built)
npm run seed:prod
```

### Deployment Script Options

```bash
./deploy.sh
# Option 1: Fresh deployment → Auto-seeds if empty
# Option 2: Update deployment → Doesn't seed
```

---

## 🔎 Verify Seeding

### Check Database Tables

```bash
# Access MySQL
docker compose exec database mysql -u root -p$DB_PASSWORD lingoshid

# Inside MySQL, run:
SELECT COUNT(*) FROM user;
SELECT COUNT(*) FROM badge;
SELECT COUNT(*) FROM activity;
SELECT * FROM user WHERE email LIKE '%demo.com';
```

### Check Logs

```bash
# View seeding logs
docker compose logs backend | grep -i seed

# Should see output like:
# 🌱 Starting database seeding...
# 👥 Seeding demo users...
# 🏆 Seeding badges...
# 📚 Seeding activities...
# ✅ Database seeding completed!
```

### Test Login

Try logging in with demo accounts:
- Go to https://admin.lingoshid.com
- Login with: `student@demo.com` (check seeder for password)

---

## 📝 Seeder Service Location

The seeding logic is located in:
```
server/
├── src/
│   ├── seed.ts                      # Seed entry point
│   └── database/
│       ├── seeder.module.ts         # Seeder module
│       └── seeder.service.ts        # Seeding logic
```

**To customize seeding:**
1. Edit `server/src/database/seeder.service.ts`
2. Modify the `seedUsers()`, `seedBadges()`, or `seedActivities()` methods
3. Run seeder to populate with your custom data

---

## ⚠️ Troubleshooting

### Error: "npm run seed" command not found

**Solution:**
```bash
# Make sure you've updated server/package.json with seed scripts
# Then rebuild:
docker compose up -d --build backend
```

### Error: Database connection failed

**Solution:**
```bash
# Make sure database is running and healthy
docker compose ps

# Check database logs
docker compose logs database

# Restart backend
docker compose restart backend
```

### Error: Tables already exist / Duplicate entries

**Solution:**
The seeder checks for existing data and skips if found. If you want to force re-seed:
```bash
# Clear database and re-seed
docker compose down
docker volume rm lingoshid_mysql_data
docker compose up -d
sleep 15
docker compose exec backend npm run seed
```

### Seeding hangs or times out

**Solution:**
```bash
# Database might not be ready
# Wait longer before seeding
sleep 20
docker compose exec backend npm run seed

# Or check database health
docker compose ps database
```

---

## 🎯 Best Practices

1. **Always seed on first deployment** - Ensures you have demo data to test with

2. **Don't seed in production with real users** - Only use for development/staging

3. **Customize passwords** - Change demo account passwords in seeder before production

4. **Back up before re-seeding** - Always backup data before dropping/re-creating database

5. **Check existing data** - Seeder checks for duplicates, but verify first:
   ```bash
   docker compose exec database mysql -u root -p$DB_PASSWORD -e "SELECT COUNT(*) FROM lingoshid.user;"
   ```

---

## 🔐 Security Notes

**For Production:**
- Change demo account passwords in `seeder.service.ts`
- Or disable seeding entirely in production
- Remove demo accounts after testing

**Default Passwords:**
Currently defined in `server/src/database/seeder.service.ts` - check the file for actual passwords.

---

## 📞 Quick Reference

| Task | Command |
|------|---------|
| Seed in Docker | `docker compose exec backend npm run seed` |
| Seed locally | `cd server && npm run seed` |
| Check seed status | `docker compose logs backend \| grep seed` |
| View database | `docker compose exec database mysql -u root -p$DB_PASSWORD lingoshid` |
| Reset database | `docker compose down && docker volume rm lingoshid_mysql_data` |
| Auto-seed on deploy | `./deploy.sh` → Option 1 |

---

**🎉 You're ready to seed your database!**

For most users: `docker compose exec backend npm run seed`
