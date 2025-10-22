# Production Quick Start Guide

Fast-track guide to deploy Lingoshid Platform with SSL and subdomains.

## 🎯 Goal

Deploy your platform at:
- **https://admin.lingoshid.com** - Admin Panel
- **https://server.lingoshid.com** - API Server
- **https://lingoshid.com** - Landing Page

## ⚡ Quick Setup (30 Minutes)

### Phase 1: Cloudflare (5 minutes)

1. **Add domain to Cloudflare**: https://dash.cloudflare.com/
2. **Add DNS A records** (all pointing to your server IP):
   ```
   @        →  YOUR_SERVER_IP
   www      →  YOUR_SERVER_IP
   admin    →  YOUR_SERVER_IP
   server   →  YOUR_SERVER_IP
   ```
3. **Update nameservers** at your domain registrar with Cloudflare's nameservers
4. **Set SSL mode** to "Full (strict)" in Cloudflare → SSL/TLS tab

### Phase 2: Server Setup (10 minutes)

```bash
# Install nginx and certbot
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Configure firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# Log out and back in for docker group
```

### Phase 3: SSL Certificates (5 minutes)

Wait for DNS to propagate (check with `nslookup admin.lingoshid.com`), then:

```bash
# Get SSL certificates
sudo certbot certonly --nginx -d admin.lingoshid.com
sudo certbot certonly --nginx -d server.lingoshid.com
sudo certbot certonly --nginx -d lingoshid.com -d www.lingoshid.com

# Verify
sudo certbot certificates
```

### Phase 4: nginx Configuration (2 minutes)

```bash
# Upload nginx config
sudo nano /etc/nginx/sites-available/lingoshid.com
# Paste contents from nginx-reverse-proxy.conf

# Enable site
sudo ln -s /etc/nginx/sites-available/lingoshid.com /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

### Phase 5: Deploy Application (8 minutes)

```bash
# Clone repository
cd /var/www
sudo git clone https://github.com/yourusername/lingoshid.git
cd lingoshid
sudo chown -R $USER:$USER /var/www/lingoshid

# Configure environment
cp .env.example .env
nano .env
# Update: DB_PASSWORD, JWT_SECRET, MYSQL_ROOT_PASSWORD

# Deploy
./deploy.sh
# Choose option 1 (Fresh deployment)
```

---

## 📋 Pre-Deployment Checklist

Before starting, ensure you have:

- [ ] Domain purchased (lingoshid.com)
- [ ] Cloudflare account created
- [ ] VPS/Server with Ubuntu 20.04+ (2GB RAM minimum)
- [ ] Server IP address
- [ ] SSH access to server

---

## 🔑 Critical Configuration

### .env File

Update these values in `.env`:

```bash
# Database
DB_PASSWORD=your_strong_password_here_min_16_chars
MYSQL_ROOT_PASSWORD=your_root_password_here_min_16_chars

# JWT (minimum 32 characters)
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long_random_string

# CORS (important!)
CORS_ORIGINS=https://admin.lingoshid.com,https://lingoshid.com
```

### Cloudflare DNS Records

| Type | Name   | Content        | Proxy |
|------|--------|----------------|-------|
| A    | @      | YOUR_SERVER_IP | ✅ On |
| A    | www    | YOUR_SERVER_IP | ✅ On |
| A    | admin  | YOUR_SERVER_IP | ✅ On |
| A    | server | YOUR_SERVER_IP | ✅ On |

---

## 🧪 Testing

After deployment:

```bash
# Check Docker containers
docker compose ps

# Test endpoints
curl https://admin.lingoshid.com
curl https://server.lingoshid.com/api
curl https://lingoshid.com

# Check SSL
curl -I https://admin.lingoshid.com | grep "HTTP"
# Should show: HTTP/2 200
```

### Browser Tests

1. **Admin Panel**: https://admin.lingoshid.com
   - Should load without SSL warnings
   - Check browser padlock (valid certificate)

2. **API Server**: https://server.lingoshid.com/api
   - Should return API response
   - No CORS errors in console

3. **Main Site**: https://lingoshid.com
   - Should redirect www to non-www
   - Should redirect HTTP to HTTPS

---

## 🔧 Common Commands

### Deployment
```bash
# Deploy/Update
./deploy.sh

# Manual deployment
docker compose up -d --build

# Stop services
docker compose down
```

### Monitoring
```bash
# View all logs
docker compose logs -f

# View specific service
docker compose logs -f backend

# nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/admin.lingoshid.com.access.log
```

### SSL Management
```bash
# Renew certificates
sudo certbot renew

# Test renewal
sudo certbot renew --dry-run

# List certificates
sudo certbot certificates
```

### Updates
```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker compose up -d --build

# Or use deployment script
./deploy.sh
# Choose option 2
```

### Database
```bash
# Backup
docker compose exec database \
  mysqldump -u root -p$DB_PASSWORD lingoshid > backup.sql

# Restore
docker compose exec -T database \
  mysql -u root -p$DB_PASSWORD lingoshid < backup.sql

# Access MySQL
docker compose exec database \
  mysql -u root -p$DB_PASSWORD lingoshid
```

---

## 🚨 Troubleshooting

### Issue: DNS not resolving

```bash
# Check DNS propagation
nslookup admin.lingoshid.com
dig admin.lingoshid.com

# Wait for DNS to propagate (up to 48 hours, usually 1-2 hours)
```

### Issue: Certbot fails

```bash
# Make sure ports are open
sudo ufw status

# Check nginx is running
sudo systemctl status nginx

# Verify DNS is pointing to your server
nslookup admin.lingoshid.com
```

### Issue: 502 Bad Gateway

```bash
# Check Docker containers are running
docker compose ps

# Check nginx error log
sudo tail -f /var/log/nginx/error.log

# Restart containers
docker compose restart
```

### Issue: CORS errors

Update backend CORS in `server/src/main.ts`:

```typescript
app.enableCors({
  origin: [
    'https://admin.lingoshid.com',
    'https://lingoshid.com',
  ],
  credentials: true,
});
```

Then rebuild:
```bash
docker compose up -d --build backend
```

### Issue: Cloudflare SSL errors

1. Ensure SSL mode is "Full (strict)"
2. Verify certificates are installed: `sudo certbot certificates`
3. Check nginx config: `sudo nginx -t`

---

## 📚 Full Documentation

For detailed information:

- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Complete SSL and Cloudflare guide
- **[nginx-reverse-proxy.conf](nginx-reverse-proxy.conf)** - nginx configuration
- **[docker-compose.yml](docker-compose.yml)** - Docker Compose configuration

---

## 🎯 Post-Deployment

After successful deployment:

### 1. Security
- [ ] Strong passwords in `.env`
- [ ] Firewall configured
- [ ] SSL certificates valid
- [ ] Only necessary ports open

### 2. Monitoring
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom)
- [ ] Configure log rotation
- [ ] Set up error alerting

### 3. Backups
- [ ] Schedule daily database backups
- [ ] Test backup restoration
- [ ] Store backups offsite

### 4. Performance
- [ ] Enable Cloudflare caching
- [ ] Configure Cloudflare Page Rules
- [ ] Test SSL rating (SSL Labs)

---

## 📞 Support

If you encounter issues:

1. Check logs: `docker compose logs -f`
2. Review nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify DNS: `nslookup admin.lingoshid.com`
4. Test certificates: `sudo certbot certificates`
5. Check Docker status: `docker compose ps`

---

## 🎉 Success Criteria

Your deployment is successful when:

✅ All Docker containers show "healthy" status
✅ https://admin.lingoshid.com loads without SSL warnings
✅ https://server.lingoshid.com/api returns API response
✅ https://lingoshid.com loads correctly
✅ No CORS errors in browser console
✅ SSL Labs rating is A or A+
✅ All tests pass in browser

---

**Ready to deploy? Start with Phase 1! 🚀**
