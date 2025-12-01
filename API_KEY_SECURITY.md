# 🔐 API Key Security & Custom Module Guide

## 🚨 IMPORTANT: API Key Security

### DO NOT Commit API Keys to Git!

Your API keys are **secrets** and should **NEVER** be committed to the repository.

### ✅ Proper Setup

**1. For Local Development:**
```bash
cd server
cp .env .env.local
nano .env.local
```

Add your API key to `.env.local`:
```
ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here
```

**Why `.env.local`?**
- ✅ Listed in `.gitignore` - won't be committed
- ✅ Takes precedence over `.env`
- ✅ Keeps secrets separate from config

**2. For Production Server:**
```bash
# SSH into server
ssh root@your-server

cd ~/lingoshid/server

# Create .env.local
nano .env.local

# Add:
ANTHROPIC_API_KEY=sk-ant-api03-your-production-key

# Restart
docker-compose restart backend
```

### 🔍 Verify It's Secure

```bash
# Check .gitignore includes .env.local
cat .gitignore | grep env.local

# Should show:
# .env.local
# .env.*.local

# Verify .env has NO key
cat .env | grep ANTHROPIC_API_KEY

# Should show:
# ANTHROPIC_API_KEY=
# (empty value)
```

---

## 🎨 Custom AI Modules (For Other Developers)

### Overview

Lingoshid supports **custom AI practice modules** where developers can:
- Use their own AI provider (OpenAI, Gemini, etc.)
- Use their own API keys
- Create unique conversation experiences

### Two Ways to Use AI

#### Option 1: Use Built-in Claude (Default)
**When to use:** Creating standard conversation activities

Built-in activities automatically use the system's Claude API key (from `.env.local`).

```typescript
// Activity content - no API key needed
{
  "type": "ai_conversation",
  "content": {
    "scenario": "making_friends",
    "difficultyLevel": "beginner"
  }
}
```

**Cost:** Shared across all default activities (~$5/month for 1000 students)

---

#### Option 2: Custom API Key (Advanced)
**When to use:** Creating custom modules with your own AI provider

You can provide your own API key in the activity content:

```typescript
// Custom activity with own API key
{
  "type": "ai_conversation",
  "content": {
    "scenario": "science_tutor",
    "difficultyLevel": "advanced",
    "aiConfig": {
      "apiKey": "sk-ant-api03-YOUR-CUSTOM-KEY",  // Your key
      "model": "claude-3-5-sonnet-20241022",     // Optional: specific model
      "temperature": 0.9,                         // Optional: creativity
      "maxTokens": 500                            // Optional: response length
    }
  }
}
```

### How It Works

```
Activity Request
    ↓
AI Service checks activity.content.aiConfig.apiKey
    ↓
If custom key exists → Use custom key
If no custom key → Use system default (.env.local)
    ↓
Claude Provider creates client with selected key
    ↓
API call made with appropriate credentials
```

### Creating a Custom AI Module

**Step 1: Design Your Activity**
```json
{
  "title": "Science Tutor - Physics",
  "type": "ai_conversation",
  "difficulty": "advanced",
  "skillArea": "fluency",
  "content": {
    "scenario": "physics_homework_help",
    "difficultyLevel": "advanced",
    "customInstructions": "Act as a physics tutor for grade 6 students",
    "aiConfig": {
      "apiKey": "your-key-here",
      "model": "claude-3-opus-20240229",  // More powerful model
      "temperature": 0.5,                  // More focused
      "maxTokens": 600                     // Longer explanations
    }
  }
}
```

**Step 2: Add to Database**
```typescript
// In your custom seeder or admin panel
await activityRepository.save({
  title: 'Science Tutor - Physics',
  type: ActivityType.AI_CONVERSATION,
  // ... rest of activity data
});
```

**Step 3: Test**
- Students use it like any other activity
- Costs charged to YOUR API key
- Complete control over AI behavior

### Security Best Practices for Custom Modules

⚠️ **WARNING:** Storing API keys in database has security implications!

**Recommendations:**

1. **Use Environment Variables for Production**
   ```typescript
   // Better: Reference env var in content
   {
     "aiConfig": {
       "apiKeyEnvVar": "MY_CUSTOM_CLAUDE_KEY"  // Looks up process.env.MY_CUSTOM_CLAUDE_KEY
     }
   }
   ```

2. **Implement Key Rotation**
   - Rotate API keys monthly
   - Store hashed/encrypted in DB
   - Use secret management service (AWS Secrets Manager, etc.)

3. **Rate Limiting**
   - Limit API calls per student per day
   - Monitor usage to prevent abuse
   - Set spending limits in AI provider console

4. **Audit Logging**
   - Log all AI API calls
   - Track which activities use which keys
   - Monitor costs per activity

### Cost Management

**Built-in Activities (Your System Key):**
- You control total budget
- Shared cost across all students
- Predictable pricing

**Custom Activities (Developer's Key):**
- Developer pays for their module
- Independent billing
- Can monetize if desired

**Example:**
```
System Activities: 10,000 conversations/month = $5
Custom Module (Developer A): 1,000 conversations = $0.50
Custom Module (Developer B): 500 conversations = $0.25

Total System Cost: $5
Developer A Cost: $0.50 (optional to pass to users)
Developer B Cost: $0.25 (optional to pass to users)
```

---

## 🛡️ Security Checklist

Before deploying:
- [ ] `.env.local` created with API key
- [ ] `.env` has empty `ANTHROPIC_API_KEY=`
- [ ] `.env.local` in `.gitignore`
- [ ] Verified key not in git history
- [ ] Set spending limits in Anthropic console
- [ ] Custom modules use their own keys
- [ ] Production server has `.env.local`
- [ ] Team knows NOT to commit secrets

---

## 📊 Monitoring API Usage

### Anthropic Console
1. Visit https://console.anthropic.com/
2. Go to "Usage" tab
3. Monitor:
   - Daily API calls
   - Token usage
   - Cost breakdown
   - Rate limit hits

### Application Logs
```bash
# Check AI service logs
docker logs lingoshid-api | grep "Claude"

# Monitor cost estimates
grep "usage" logs/ai-service.log
```

### Set Spending Limits
```
Anthropic Console → Settings → Billing → Set Monthly Limit
Recommended: $50/month for 1000 students
```

---

## 🆘 Troubleshooting

### "ANTHROPIC_API_KEY not found"
**Cause:** `.env.local` doesn't exist or isn't loaded

**Fix:**
```bash
# Create .env.local
cp .env .env.local
nano .env.local
# Add your key

# Restart server
docker-compose restart backend
```

### "Invalid API key"
**Cause:** Key is incorrect or expired

**Fix:**
1. Go to https://console.anthropic.com/
2. Generate new API key
3. Update `.env.local`
4. Restart server

### Custom module not using custom key
**Cause:** `aiConfig.apiKey` not in activity content

**Fix:**
```typescript
// Ensure activity has aiConfig
activity.content = {
  ...activity.content,
  aiConfig: {
    apiKey: 'your-custom-key'
  }
};
```

---

## 📚 Additional Resources

- **Anthropic API Docs:** https://docs.anthropic.com/
- **Claude Pricing:** https://www.anthropic.com/pricing
- **Best Practices:** https://docs.anthropic.com/claude/docs/best-practices
- **Rate Limits:** https://docs.anthropic.com/claude/reference/rate-limits

---

## 🎓 Summary

**For System Admins:**
- Keep API key in `.env.local` (never commit!)
- Monitor usage in Anthropic console
- Set spending limits

**For Module Developers:**
- Option 1: Use system key (free, but shared)
- Option 2: Use your own key (full control, you pay)
- Store keys securely (env vars > database)
- Monitor your own costs

**For Students:**
- Just use the activities!
- No API keys needed
- Everything works automatically

---

**Built with Security First** 🔒
**Date:** December 1, 2025
