# SSL & Cloudflare Setup Guide for lingoshid.com

Complete guide to set up your domain with subdomains, SSL certificates, and Cloudflare.

## 🌐 Domain Structure

```
lingoshid.com (or landing.lingoshid.com)  →  Landing Page (port 8081)
admin.lingoshid.com                       →  Admin Panel (port 8080)
server.lingoshid.com                      →  API Server (port 3000)
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│  Cloudflare CDN + DDoS Protection + DNS                     │
└─────────────────────┬───────────────────────────────────────┘
                      │ (SSL/TLS - Full Strict)
                      │
┌─────────────────────▼───────────────────────────────────────┐
│  Your Server (VPS)                                          │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  nginx (Reverse Proxy + SSL Termination)              │ │
│  │  - Port 80 (HTTP → HTTPS redirect)                    │ │
│  │  - Port 443 (HTTPS with Let's Encrypt certs)          │ │
│  └───────┬─────────┬──────────┬──────────────────────────┘ │
│          │         │          │                             │
│  ┌───────▼────┐ ┌──▼─────┐ ┌─▼────────────┐              │
│  │ Frontend   │ │Backend │ │ Landing Page │              │
│  │ (Docker)   │ │(Docker)│ │ (Docker)     │              │
│  │ :8080      │ │ :3000  │ │ :8081        │              │
│  └───────┬────┘ └──┬─────┘ └──────────────┘              │
│          │         │                                        │
│          │    ┌────▼─────┐                                 │
│          │    │ MySQL    │                                 │
│          │    │ (Docker) │                                 │
│          └───▶│ :3306    │                                 │
│               └──────────┘                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Part 1: Cloudflare DNS Setup

### Step 1: Add Domain to Cloudflare

1. **Log in to Cloudflare**: https://dash.cloudflare.com/
2. **Add Site**: Click "Add a Site"
3. **Enter domain**: `lingoshid.com`
4. **Select Plan**: Choose Free plan (sufficient for most needs)
5. **Add DNS Records** (see below)

### Step 2: Configure DNS Records

Add these DNS records in Cloudflare:

| Type  | Name     | Content              | Proxy Status | TTL  |
|-------|----------|----------------------|--------------|------|
| A     | @        | YOUR_SERVER_IP       | Proxied (🧡) | Auto |
| A     | www      | YOUR_SERVER_IP       | Proxied (🧡) | Auto |
| A     | admin    | YOUR_SERVER_IP       | Proxied (🧡) | Auto |
| A     | server   | YOUR_SERVER_IP       | Proxied (🧡) | Auto |
| A     | landing  | YOUR_SERVER_IP       | Proxied (🧡) | Auto |

**Important:**
- Replace `YOUR_SERVER_IP` with your actual server IP address
- Keep "Proxied" (orange cloud) enabled for DDoS protection and CDN
- TTL can be "Auto"

### Step 3: Update Nameservers at Domain Registrar

Cloudflare will provide you with nameservers like:
```
ava.ns.cloudflare.com
king.ns.cloudflare.com
```

Go to your domain registrar (where you bought lingoshid.com) and:
1. Find DNS/Nameserver settings
2. Replace existing nameservers with Cloudflare's nameservers
3. Wait 24-48 hours for propagation (usually takes 1-2 hours)

### Step 4: Cloudflare SSL/TLS Settings

1. Go to **SSL/TLS** tab in Cloudflare
2. Set encryption mode to **"Full (strict)"**
3. Enable **"Always Use HTTPS"**
4. Enable **"Automatic HTTPS Rewrites"**
5. Set **Minimum TLS Version** to 1.2 or higher

**Why Full (strict)?**
- "Flexible": Cloudflare ↔ Server uses HTTP (insecure)
- "Full": Cloudflare ↔ Server uses HTTPS but doesn't verify cert
- **"Full (strict)"**: Cloudflare ↔ Server uses valid HTTPS (recommended)

---

## Part 2: Server Setup (Ubuntu/Debian)

### Step 1: Install nginx and Certbot

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install nginx
sudo apt install nginx -y

# Install Certbot for Let's Encrypt
sudo apt install certbot python3-certbot-nginx -y

# Start nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check nginx status
sudo systemctl status nginx
```

### Step 2: Configure Firewall

```bash
# Allow SSH (if not already allowed)
sudo ufw allow ssh
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw --force enable

# Check status
sudo ufw status
```

### Step 3: Install Docker and Docker Compose

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Verify installation
docker --version
docker compose version
```

**Important:** Log out and back in for docker group changes to take effect.

---

## Part 3: SSL Certificate Setup with Certbot

### Step 1: Obtain SSL Certificates

**Before running certbot**, make sure:
- DNS records are pointing to your server (check with `nslookup admin.lingoshid.com`)
- Port 80 and 443 are open in firewall
- nginx is running

**Obtain certificates for all subdomains:**

```bash
# Create directory for certbot webroot
sudo mkdir -p /var/www/certbot

# Get certificate for admin.lingoshid.com
sudo certbot certonly --nginx -d admin.lingoshid.com

# Get certificate for server.lingoshid.com
sudo certbot certonly --nginx -d server.lingoshid.com

# Get certificate for lingoshid.com (and www)
sudo certbot certonly --nginx -d lingoshid.com -d www.lingoshid.com

# Get certificate for landing.lingoshid.com (optional - for future)
sudo certbot certonly --nginx -d landing.lingoshid.com
```

During setup:
- Enter your email address (for renewal notifications)
- Agree to Terms of Service
- Choose whether to share email with EFF (optional)

**Alternative: Get all certificates at once (wildcard or multiple domains):**

```bash
# Option 1: Get all subdomains in one certificate
sudo certbot certonly --nginx \
  -d lingoshid.com \
  -d www.lingoshid.com \
  -d admin.lingoshid.com \
  -d server.lingoshid.com \
  -d landing.lingoshid.com

# Option 2: Wildcard certificate (requires DNS challenge)
sudo certbot certonly --dns-cloudflare \
  -d lingoshid.com \
  -d *.lingoshid.com
```

### Step 2: Verify Certificates

```bash
# Check installed certificates
sudo certbot certificates

# Test certificate renewal (dry run)
sudo certbot renew --dry-run
```

### Step 3: Auto-Renewal Setup

Certbot automatically installs a renewal cron job. Verify it:

```bash
# Check systemd timer
sudo systemctl status certbot.timer

# Or check cron
sudo cat /etc/cron.d/certbot
```

**Manual renewal command:**
```bash
sudo certbot renew
sudo systemctl reload nginx
```

---

## Part 4: nginx Reverse Proxy Configuration

### Step 1: Upload nginx Configuration

Copy the provided `nginx-reverse-proxy.conf` to your server:

```bash
# On your server, upload the config
sudo nano /etc/nginx/sites-available/lingoshid.com
```

Paste the contents of `nginx-reverse-proxy.conf` file.

### Step 2: Update SSL Certificate Paths

The config file already has the correct paths. Certbot will create certificates at:
```
/etc/letsencrypt/live/admin.lingoshid.com/fullchain.pem
/etc/letsencrypt/live/admin.lingoshid.com/privkey.pem
```

### Step 3: Enable Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/lingoshid.com /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### Step 4: Test Configuration

```bash
# Check nginx status
sudo systemctl status nginx

# View nginx error logs if there are issues
sudo tail -f /var/log/nginx/error.log
```

---

## Part 5: Deploy Docker Containers

### Step 1: Clone Repository

```bash
# Clone your repository
cd /var/www
sudo git clone https://github.com/yourusername/lingoshid.git
cd lingoshid

# Set proper permissions
sudo chown -R $USER:$USER /var/www/lingoshid
```

### Step 2: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit with production values
nano .env
```

Update these critical values:
```bash
DB_PASSWORD=your_very_strong_database_password_here
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
MYSQL_ROOT_PASSWORD=your_strong_mysql_root_password
```

### Step 3: Start Production Containers

```bash
# Use production docker-compose
docker compose up -d --build

# Check status
docker compose ps

# View logs
docker compose logs -f
```

### Step 4: Seed Database

```bash
# Seed initial data (first time only)
docker compose exec backend npm run seed
```

---

## Part 6: Verification & Testing

### Step 1: Check Docker Containers

```bash
# Check all containers are running
docker compose ps

# Should see:
# lingoshid-db-prod         (healthy)
# lingoshid-api-prod        (healthy)
# lingoshid-webapp-prod     (healthy)
```

### Step 2: Test Each Domain

```bash
# Test admin panel
curl -I https://admin.lingoshid.com

# Test API server
curl https://server.lingoshid.com/api

# Test main domain
curl -I https://lingoshid.com
```

### Step 3: Test SSL Certificates

Visit each URL in browser:
- https://admin.lingoshid.com
- https://server.lingoshid.com
- https://lingoshid.com

Check for:
- ✅ Padlock icon (valid SSL)
- ✅ No certificate warnings
- ✅ HTTPS (not HTTP)

### Step 4: SSL Testing Tools

Use online tools:
- **SSL Labs**: https://www.ssllabs.com/ssltest/analyze.html?d=admin.lingoshid.com
- **Security Headers**: https://securityheaders.com/?q=admin.lingoshid.com

Target: A+ rating

---

## Part 7: Update Backend CORS Configuration

### Update Backend to Accept Multiple Origins

Edit `server/src/main.ts`:

```typescript
// Enable CORS for multiple domains
app.enableCors({
  origin: [
    'https://admin.lingoshid.com',
    'https://lingoshid.com',
    'https://landing.lingoshid.com',
    'https://www.lingoshid.com',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

Or use environment variable (better):

```typescript
app.enableCors({
  origin: process.env.CORS_ORIGINS?.split(',') || [
    'http://localhost:4200',
  ],
  credentials: true,
});
```

Then in `.env`:
```bash
CORS_ORIGINS=https://admin.lingoshid.com,https://lingoshid.com,https://landing.lingoshid.com
```

### Rebuild and Redeploy

```bash
# Rebuild backend
docker compose up -d --build backend

# Check logs
docker compose logs -f backend
```

---

## Part 8: Monitoring & Maintenance

### Check Logs

```bash
# nginx access logs
sudo tail -f /var/log/nginx/admin.lingoshid.com.access.log
sudo tail -f /var/log/nginx/server.lingoshid.com.access.log

# nginx error logs
sudo tail -f /var/log/nginx/error.log

# Docker logs
docker compose logs -f
docker compose logs -f backend
```

### SSL Certificate Renewal

Certificates auto-renew. To manually renew:

```bash
# Renew all certificates
sudo certbot renew

# Reload nginx
sudo systemctl reload nginx
```

### Update Application

```bash
cd /var/www/lingoshid

# Pull latest changes
git pull origin main

# Rebuild and restart
docker compose down
docker compose up -d --build

# Check status
docker compose ps
```

---

## Troubleshooting

### Issue: Certificate Verification Failed

**Solution:**
```bash
# Make sure DNS is propagated
nslookup admin.lingoshid.com

# Check if port 80 is accessible
curl http://admin.lingoshid.com

# Try again
sudo certbot certonly --nginx -d admin.lingoshid.com
```

### Issue: nginx 502 Bad Gateway

**Causes:**
- Docker containers not running
- Wrong port in nginx config
- Docker network issues

**Solution:**
```bash
# Check Docker containers
docker compose ps

# Check nginx error log
sudo tail -f /var/log/nginx/error.log

# Test port connectivity
curl http://localhost:8080  # frontend
curl http://localhost:3000/api  # backend
```

### Issue: CORS Errors

**Solution:**
- Update backend CORS configuration (see Part 7)
- Make sure frontend uses correct API URL
- Check browser console for exact error

### Issue: Cloudflare SSL Errors

**Solution:**
- Ensure SSL mode is "Full (strict)" in Cloudflare
- Verify certificates are installed correctly
- Check certificate matches domain

---

## Security Checklist

- [ ] Strong passwords in `.env`
- [ ] JWT secret is at least 32 characters
- [ ] Firewall configured (only ports 22, 80, 443 open)
- [ ] SSL certificates installed and valid
- [ ] Cloudflare proxy enabled (orange cloud)
- [ ] CORS configured correctly
- [ ] Database only accessible from localhost
- [ ] Docker containers only accessible from localhost
- [ ] nginx security headers enabled
- [ ] Auto-renewal for SSL certificates working

---

## Quick Reference

### Important Files
- nginx config: `/etc/nginx/sites-available/lingoshid.com`
- SSL certificates: `/etc/letsencrypt/live/*/`
- Docker compose: `docker-compose.yml`
- Environment: `.env`

### Important Commands
```bash
# Restart nginx
sudo systemctl restart nginx

# Check nginx config
sudo nginx -t

# Renew SSL
sudo certbot renew

# View Docker logs
docker compose logs -f

# Restart containers
docker compose restart
```

---

**🎉 Congratulations! Your domain is now set up with SSL and subdomains!**

Access your platform at:
- **Admin Panel**: https://admin.lingoshid.com
- **API Server**: https://server.lingoshid.com/api
- **Main Site**: https://lingoshid.com
