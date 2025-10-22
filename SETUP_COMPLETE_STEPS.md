# Complete Setup Steps - Execute These Now

## 🎯 Step 1: Rebuild Backend (Create Tables)

```bash
# Rebuild backend with new TypeORM config
docker compose up -d --build backend

# Watch logs - you should see tables being created
docker compose logs -f backend
```

**Expected output:**
```
query: CREATE TABLE `user` ...
query: CREATE TABLE `student` ...
query: CREATE TABLE `teacher` ...
...
🚀 Lingoshid API is running on: http://localhost:3000/api
```

## 🎯 Step 2: Seed the Database

```bash
# After backend is up and healthy (wait 10 seconds)
docker compose exec backend npm run seed:prod
```

**Expected output:**
```
🌱 Starting database seeding...
👥 Seeding demo users...
🏆 Seeding badges...
📚 Seeding activities...
✅ Database seeding completed!
```

## 🎯 Step 3: Verify Setup

```bash
# Check tables were created
docker compose exec database mysql -u lingoshid_user -plingoshid_DB_pAssword_8711 lingoshid -e "SHOW TABLES;" 2>&1 | grep -v Warning

# Should show:
# activity
# badge
# parent
# student
# teacher
# user
# ... etc
```

## 🎯 Step 4: Test Login

1. Open browser: http://localhost:8080
2. Login with:
   - Email: `student@demo.com`
   - Password: `demo123`
3. Should successfully login!

## 🎯 Step 5: Check Logs for Any Errors

```bash
# Check all services
docker compose ps

# Check backend logs
docker compose logs backend --tail 50

# Check frontend logs
docker compose logs frontend --tail 20
```

---

## ✅ Complete Verification Checklist

- [ ] Backend container is healthy
- [ ] Database container is healthy
- [ ] Frontend container is healthy
- [ ] Tables created in database (run Step 3)
- [ ] Data seeded successfully (run Step 2)
- [ ] Can access http://localhost:8080
- [ ] Can login with student@demo.com / demo123
- [ ] No 500 errors in browser network tab

---

## 🔧 If Something Goes Wrong

### Tables not created?
```bash
# Check backend logs for schema creation
docker compose logs backend | grep "CREATE TABLE"

# Manually restart backend
docker compose restart backend
```

### Seeding fails?
```bash
# Check if tables exist first
docker compose exec database mysql -u lingoshid_user -plingoshid_DB_pAssword_8711 lingoshid -e "SHOW TABLES;" 2>&1 | grep -v Warning

# Try seeding again
docker compose exec backend npm run seed:prod
```

### Still getting 500 errors?
```bash
# Check what error is in backend
docker compose logs backend --tail 100 | grep ERROR

# Restart everything fresh
docker compose down
docker compose up -d
sleep 15
docker compose exec backend npm run seed:prod
```

---

## 📚 After Initial Setup (Optional)

Once everything works, you can disable auto-sync for safety:

1. Edit `.env`:
   ```bash
   TYPEORM_SYNC=false
   ```

2. Restart backend:
   ```bash
   docker compose restart backend
   ```

This prevents accidental schema changes in production.
