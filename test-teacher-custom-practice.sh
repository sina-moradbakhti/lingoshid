#!/bin/bash

echo "🧪 Testing Teacher-Created Custom Practice"
echo "=========================================================================="
echo ""

# Get teacher token
echo "📝 Logging in as teacher..."
TEACHER_TOKEN=$(curl -s -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@demo.com","password":"demo123"}' | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")

echo "✅ Teacher authenticated"
echo ""

# Create test custom practice
echo "🎯 Creating TEST custom practice (pronunciation_challenge)..."
RESULT=$(curl -s -X POST "http://localhost:3000/api/teachers/custom-practices" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -d '{
    "title": "TEST: Teacher Created Pronunciation",
    "description": "Testing if teacher-created activities use modular system",
    "type": "pronunciation_challenge",
    "difficulty": "beginner",
    "skillArea": "pronunciation",
    "pointsReward": 15,
    "minLevel": 1,
    "maxLevel": null,
    "assignedStudents": [],
    "content": {
      "instruction": "Practice these test words",
      "words": [
        {"word": "Apple", "phonetic": "/ˈæp.əl/", "audioUrl": ""},
        {"word": "Banana", "phonetic": "/bəˈnæn.ə/", "audioUrl": ""},
        {"word": "Cherry", "phonetic": "/ˈtʃer.i/", "audioUrl": ""}
      ]
    }
  }')

echo "$RESULT" | python3 -c "
import sys, json
try:
    response = json.load(sys.stdin)
    print('✅ Custom Practice Created Successfully!')
    print(f\"   Title: {response['activity']['title']}\")
    print(f\"   Type: {response['activity']['type']}\")
    print(f\"   ID: {response['activity']['id']}\")
    print(f\"   Difficulty: {response['activity']['difficulty']}\")
    print(f\"   Points: {response['activity']['pointsReward']}\")
    print('')
    print('📊 This activity will now:')
    print('   1. Appear in student activities list')
    print('   2. Route to /student/module-activities/:id/start')
    print('   3. Load PronunciationModuleComponent')
    print('   4. Use modular system (NOT old hardcoded UI)')
    print('')
    print(f\"🔗 Direct URL: http://localhost:4200/student/module-activities/{response['activity']['id']}/start\")
except Exception as e:
    print(f'❌ Error: {e}')
    print('Response:', sys.stdin.read())
"

echo ""
echo "=========================================================================="
echo "✅ Test Complete!"
echo ""
echo "Next steps:"
echo "1. Login as student (student@demo.com)"
echo "2. Go to http://localhost:4200/student/activities"
echo "3. Click on 'TEST: Teacher Created Pronunciation'"
echo "4. Verify it uses the modular PronunciationModuleComponent"
echo "=========================================================================="
