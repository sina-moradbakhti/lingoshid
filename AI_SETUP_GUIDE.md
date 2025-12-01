# 🤖 AI Feature Setup Guide

## Quick Start

### Step 1: Get Your Claude API Key

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign in with your Claude Pro account
3. Navigate to "API Keys"
4. Click "Create Key"
5. Copy your API key (starts with `sk-ant-...`)

### Step 2: Add API Key to Environment

**Local Development:**
```bash
cd server
nano .env
```

Add your API key:
```
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

**Production Server:**
```bash
# SSH into your server
ssh root@your-server

cd ~/lingoshid/server

# Edit .env file
nano .env

# Add the API key
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here

# Restart containers
docker-compose restart backend
```

### Step 3: Test AI Integration

```bash
# Build the backend
npm run build

# Start the server
npm run start:dev

# Check AI health
curl http://localhost:3000/api/ai/health
```

You should see:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "claude": true
  }
}
```

## API Endpoints

### 1. Start AI Conversation
```http
POST /api/ai/conversation/start
Authorization: Bearer <jwt_token>

{
  "activityId": "uuid",
  "scenario": "making_friends",
  "difficultyLevel": "beginner"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "uuid",
    "firstMessage": "Hi Alex! 👋 My name is Alex! What's your name?"
  }
}
```

### 2. Send Message
```http
POST /api/ai/conversation/message
Authorization: Bearer <jwt_token>

{
  "sessionId": "uuid",
  "message": "My name is Sara!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "aiResponse": "Nice to meet you, Sara! Do you like to play games?",
    "turnCount": 2,
    "shouldEnd": false
  }
}
```

### 3. End Conversation & Get Evaluation
```http
POST /api/ai/conversation/:sessionId/end
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "evaluation": {
      "grammarScore": 85,
      "vocabularyScore": 80,
      "coherenceScore": 90,
      "fluencyScore": 75,
      "overallScore": 82,
      "strengths": [
        "Great use of simple present tense!",
        "You stayed on topic nicely"
      ],
      "improvements": [
        "Try using more descriptive words",
        "Practice past tense forms"
      ],
      "suggestions": [
        "Read English storybooks",
        "Practice with family"
      ],
      "conversationQuality": "good"
    },
    "pointsEarned": 41
  }
}
```

## Available Scenarios

- `making_friends` - Practice introductions
- `at_school` - Talk about school
- `my_hobbies` - Discuss hobbies
- `my_family` - Talk about family
- `favorite_things` - Share favorites
- `weekend_fun` - Weekend activities

## Difficulty Levels

### Beginner (Grades 4-5)
- Simple vocabulary (top 500 words)
- Present tense focus
- 8 turns max
- Yes/no questions

### Intermediate (Grades 5-6)
- Common vocabulary (top 1500 words)
- Past and future tense
- 12 turns max
- Open-ended questions

### Advanced (Grade 6+)
- Broader vocabulary
- Complex tenses & conditionals
- 16 turns max
- Thought-provoking questions

## Cost Monitoring

**Claude 3.5 Haiku Pricing:**
- Input: $0.25 per 1M tokens
- Output: $1.25 per 1M tokens

**Typical Conversation:**
- Input tokens: ~500
- Output tokens: ~300
- **Cost per conversation: ~$0.0005 (half a cent!)**

**Monthly estimates:**
- 100 students, 10 conversations each = 1000 conversations
- **Total cost: ~$0.50/month**

Very affordable! 🎉

## Troubleshooting

### Error: "ANTHROPIC_API_KEY not found"
- Check `.env` file has the key
- Restart server after adding key
- Make sure there are no spaces around the `=`

### Error: "Invalid API key"
- Verify key starts with `sk-ant-`
- Check key hasn't expired in Anthropic console
- Try generating a new key

### AI responses are slow
- This is normal! Claude takes 1-3 seconds
- Consider upgrading to Claude 3 Opus for faster responses
- Or use Haiku model (already default, fastest option)

### Health check fails
- Check internet connection
- Verify API key is correct
- Check Anthropic API status: https://status.anthropic.com/

## Next Steps

1. ✅ Set up API key
2. ✅ Test with demo student
3. 🔄 Add AI conversation activities to seeder
4. 🔄 Create frontend conversation component
5. 🔄 Deploy to production

## Security Notes

⚠️ **Important:**
- Never commit API keys to git
- `.env` is in `.gitignore` - keep it that way
- Rotate API keys regularly
- Monitor usage in Anthropic console
- Set spending limits in Anthropic console

## Support

If you encounter issues:
1. Check logs: `docker logs lingoshid-api`
2. Test health endpoint: `/api/ai/health`
3. Verify API key in Anthropic console
4. Check this guide's troubleshooting section
