# Production Setup on Ubuntu Server - Complete Guide

## ✅ Will Everything Work? YES!

Your setup will work perfectly on Ubuntu because:
- ✅ Docker containers work the same everywhere
- ✅ nginx reverse proxy works the same
- ✅ The architecture is already production-ready

## 🚀 Step-by-Step Ubuntu Deployment

### Prerequisites on Ubuntu Server:
- Ubuntu 20.04 or higher
- Docker & Docker Compose installed
- Domain pointing to server (lingoshid.com)
- Ports 80, 443, 22 open

---

### Step 1: Install Dependencies (If Not Already)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose plugin
sudo apt install docker-compose-plugin -y

# Install nginx (for external reverse proxy)
sudo apt install nginx certbot python3-certbot-nginx -y

# Verify
docker --version
docker compose version
nginx -v
```

### Step 2: Clone Your Repository

```bash
# Create directory
sudo mkdir -p /var/www
cd /var/www

# Clone repo (replace with your repo URL)
sudo git clone https://github.com/yourusername/lingoshid.git
cd lingoshid

# Set permissions
sudo chown -R $USER:$USER /var/www/lingoshid
```

### Step 3: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit with production values
nano .env
```

**Update these values:**
```bash
# Strong passwords
DB_PASSWORD=YOUR_VERY_STRONG_DATABASE_PASSWORD_HERE
JWT_SECRET=YOUR_SUPER_SECRET_JWT_KEY_AT_LEAST_32_CHARACTERS_LONG
MYSQL_ROOT_PASSWORD=YOUR_STRONG_MYSQL_ROOT_PASSWORD

# Production settings
NODE_ENV=production
TYPEORM_SYNC=true  # For initial deployment, set to false later

# Your domains
FRONTEND_URL=https://admin.lingoshid.com
CORS_ORIGINS=https://admin.lingoshid.com,https://lingoshid.com
```

### Step 4: Configure Cloudflare DNS

In Cloudflare dashboard, add these A records:

| Type | Name   | Content          | Proxy |
|------|--------|------------------|-------|
| A    | @      | YOUR_SERVER_IP   | ✅ On |
| A    | www    | YOUR_SERVER_IP   | ✅ On |
| A    | admin  | YOUR_SERVER_IP   | ✅ On |
| A    | server | YOUR_SERVER_IP   | ✅ On |

**Set SSL/TLS mode to "Full (strict)"** in Cloudflare

### Step 5: Get SSL Certificates

```bash
# Make sure DNS is propagated first (check: nslookup admin.lingoshid.com)

# Get SSL certificate for admin subdomain
sudo certbot certonly --nginx -d admin.lingoshid.com

# Get SSL certificate for API subdomain
sudo certbot certonly --nginx -d server.lingoshid.com

# Get SSL certificate for main domain
sudo certbot certonly --nginx -d lingoshid.com -d www.lingoshid.com

# Verify certificates
sudo certbot certificates
```

### Step 6: Configure External nginx (Ubuntu Host)

```bash
# Copy the nginx reverse proxy config
sudo cp nginx-reverse-proxy.conf /etc/nginx/sites-available/lingoshid.com

# Enable the site
sudo ln -s /etc/nginx/sites-available/lingoshid.com /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### Step 7: Configure Firewall

```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw --force enable

# Check status
sudo ufw status
```

### Step 8: Deploy with Docker

```bash
# Make sure you're in the project directory
cd /var/www/lingoshid

# Start containers
docker compose up -d --build

# Wait for services to be ready
sleep 15

# Check status
docker compose ps

# All should show "healthy" status
```

### Step 9: Seed Database

```bash
# Seed initial data
docker compose exec backend npm run seed:prod

# Verify seeding worked
docker compose exec database mysql -u lingoshid_user -p$DB_PASSWORD lingoshid -e "SELECT COUNT(*) FROM user;"

# Should return: count > 0
```

### Step 10: Verify Everything Works

```bash
# Check Docker containers
docker compose ps

# Check nginx is running
sudo systemctl status nginx

# Check SSL certificates
sudo certbot certificates

# Test endpoints from server
curl http://localhost:3000/api
curl http://localhost:8080/

# Test from outside (your computer)
curl https://admin.lingoshid.com
curl https://server.lingoshid.com/api
```

---

## 🌐 How API Calls Work in Production

### Architecture Flow:

```
User's Browser
    ↓
https://admin.lingoshid.com (loads Angular app)
    ↓
Angular makes API call: /api/students/dashboard
    ↓
Since it's relative URL, browser sends to: https://admin.lingoshid.com/api/students/dashboard
    ↓
Request goes to: Ubuntu nginx (external reverse proxy)
    ↓
nginx sees: admin.lingoshid.com/api/
    ↓
nginx proxies to: localhost:8080/api/ (webapp container)
    ↓
webapp nginx sees: /api/
    ↓
webapp nginx proxies to: lingoshid-api:3000/api/
    ↓
Backend processes request
    ↓
Response flows back through the chain
    ↓
User sees data!
```

### Why This Works:

1. **Angular uses relative URLs**: `/api/students/dashboard`
2. **Browser resolves to current host**: `https://admin.lingoshid.com/api/students/dashboard`
3. **External nginx proxies**: Port 443 → localhost:8080
4. **Internal nginx proxies**: Port 8080 → lingoshid-api:3000
5. **Backend responds**: Through same chain in reverse

**No code changes needed!** Everything works automatically.

---

## 🔧 Configuration Summary

### What's Configured:

✅ **Docker Containers** (docker-compose.yml)
- Backend: lingoshid-api:3000
- Frontend: lingoshid-webapp:80 (exposed as localhost:8080)
- Database: lingoshid-db:3306 (exposed as localhost:3307)

✅ **Internal nginx** (webapp/nginx.conf)
- Proxies `/api/` → `http://lingoshid-api:3000/api/`

✅ **External nginx** (nginx-reverse-proxy.conf)
- `admin.lingoshid.com` → `localhost:8080` (webapp)
- `server.lingoshid.com` → `localhost:3000` (backend)
- `lingoshid.com` → `localhost:8081` (landing page)

✅ **SSL Certificates** (Let's Encrypt)
- admin.lingoshid.com
- server.lingoshid.com
- lingoshid.com

✅ **Cloudflare**
- DNS routing
- DDoS protection
- CDN caching

---

## 📊 API Call Examples in Production

### Example 1: Student Dashboard

```javascript
// Angular service code
this.http.get('/api/students/dashboard')
```

**What happens:**
1. Browser resolves to: `https://admin.lingoshid.com/api/students/dashboard`
2. External nginx receives request on port 443
3. External nginx proxies to: `http://localhost:8080/api/students/dashboard`
4. Internal nginx (webapp) proxies to: `http://lingoshid-api:3000/api/students/dashboard`
5. Backend responds
6. Response flows back to browser

### Example 2: Login Request

```javascript
// Angular auth service
this.http.post('/api/auth/login', credentials)
```

**What happens:**
1. Browser sends to: `https://admin.lingoshid.com/api/auth/login`
2. Same proxy chain as above
3. Backend validates credentials
4. Returns JWT token
5. Angular stores token

### Example 3: Direct API Access (Optional)

If you want direct API access without going through webapp nginx:

```javascript
// Configure Angular to use server subdomain directly
apiUrl: 'https://server.lingoshid.com/api'
```

Then calls go:
1. `https://server.lingoshid.com/api/students/dashboard`
2. External nginx proxies directly to: `http://localhost:3000/api/students/dashboard`
3. Backend responds

---

## 🚨 Troubleshooting

### Issue: nginx shows 502 Bad Gateway

**Check:**
```bash
# Are Docker containers running?
docker compose ps

# Check backend logs
docker compose logs backend

# Check external nginx logs
sudo tail -f /var/log/nginx/error.log
```

### Issue: SSL certificate errors

**Fix:**
```bash
# Make sure DNS is propagated
nslookup admin.lingoshid.com

# Try getting certificate again
sudo certbot certonly --nginx -d admin.lingoshid.com

# Check Cloudflare SSL mode is "Full (strict)"
```

### Issue: API calls fail with CORS errors

**Fix:**
```bash
# Update CORS_ORIGINS in .env
CORS_ORIGINS=https://admin.lingoshid.com,https://lingoshid.com

# Restart backend
docker compose restart backend
```

### Issue: Database connection fails

**Fix:**
```bash
# Check database is running
docker compose ps database

# Check database logs
docker compose logs database

# Verify DB_PASSWORD in .env matches
grep DB_PASSWORD .env
```

---

## 🔒 Security Best Practices

After deployment:

1. **Disable TypeORM sync:**
   ```bash
   # Edit .env
   TYPEORM_SYNC=false

   # Restart backend
   docker compose restart backend
   ```

2. **Set up automated backups:**
   ```bash
   # Create backup script
   cat > backup-db.sh << 'EOF'
   #!/bin/bash
   DATE=$(date +%Y%m%d_%H%M%S)
   docker compose exec -T database mysqldump -u root -p$MYSQL_ROOT_PASSWORD lingoshid > /backups/lingoshid_$DATE.sql
   EOF

   chmod +x backup-db.sh

   # Add to crontab (daily at 2 AM)
   echo "0 2 * * * /var/www/lingoshid/backup-db.sh" | sudo crontab -
   ```

3. **Monitor logs:**
   ```bash
   # Set up log rotation
   sudo nano /etc/logrotate.d/lingoshid

   # Add:
   /var/log/nginx/admin.lingoshid.com*.log {
       daily
       rotate 14
       compress
       delaycompress
       notifempty
       sharedscripts
   }
   ```

4. **Keep system updated:**
   ```bash
   # Auto-update SSL certificates
   sudo certbot renew --dry-run

   # Update Docker images periodically
   docker compose pull
   docker compose up -d --build
   ```

---

## ✅ Success Checklist

After deployment, verify:

- [ ] All Docker containers show "healthy" status
- [ ] https://admin.lingoshid.com loads without SSL warnings
- [ ] Can login with student@demo.com / demo123
- [ ] https://server.lingoshid.com/api returns API response
- [ ] No CORS errors in browser console
- [ ] No 502/500 errors
- [ ] SSL rating is A or A+ (check: ssllabs.com)
- [ ] Firewall is enabled and configured
- [ ] Auto-renewal for SSL works: `sudo certbot renew --dry-run`

---

## 🎉 You're Done!

Your platform is now:
- ✅ Running on Ubuntu server
- ✅ Secured with SSL/TLS
- ✅ Protected by Cloudflare
- ✅ Using Docker for easy management
- ✅ Production-ready

Access your platform:
- **Admin Panel**: https://admin.lingoshid.com
- **API Server**: https://server.lingoshid.com/api
- **Main Site**: https://lingoshid.com

**Congratulations! 🎊**
