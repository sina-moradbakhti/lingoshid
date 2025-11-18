#!/bin/bash

echo "🎓 Setting up Professional Activities for Presentation"
echo "===================================================="
echo ""

# Get teacher token
echo "📝 Logging in as teacher..."
TEACHER_TOKEN=$(curl -s -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@demo.com","password":"demo123"}' | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")

if [ -z "$TEACHER_TOKEN" ]; then
  echo "❌ Failed to get teacher token"
  exit 1
fi

echo "✅ Teacher authenticated"
echo ""

# Step 1: Get list of existing custom practices
echo "📋 Fetching existing activities..."
EXISTING=$(curl -s -X GET "http://localhost:3000/api/teachers/custom-practices" \
  -H "Authorization: Bearer $TEACHER_TOKEN")

echo "$EXISTING" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if isinstance(data, list):
        print(f'Found {len(data)} existing custom practices')
        for item in data:
            if 'activity' in item:
                print(f\"  - {item['activity'].get('title', 'Unknown')} (ID: {item['activity'].get('id', 'Unknown')})\")
except:
    print('No existing practices or error fetching')
"

echo ""

# Step 2: Delete TEST activities
echo "🗑️  Removing TEST activities..."
echo "$EXISTING" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if isinstance(data, list):
        for item in data:
            if 'activity' in item and item['activity'].get('title', '').startswith('TEST:'):
                print(item['activity']['id'])
except:
    pass
" | while read -r activity_id; do
    if [ ! -z "$activity_id" ]; then
        echo "  Deleting $activity_id..."
        curl -s -X DELETE "http://localhost:3000/api/teachers/custom-practices/$activity_id" \
          -H "Authorization: Bearer $TEACHER_TOKEN" > /dev/null
        echo "  ✓ Deleted"
    fi
done

echo ""
echo "✅ Old activities removed"
echo ""

# Step 3: Create new professional activities
echo "🎯 Creating Professional Activities..."
echo ""

# Activity 1: Basic Greetings (Pronunciation)
echo "1️⃣  Creating: Basic Greetings & Politeness"
curl -s -X POST "http://localhost:3000/api/teachers/custom-practices" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -d '{
    "title": "Basic Greetings & Politeness",
    "description": "Learn to pronounce common greetings and polite expressions clearly",
    "type": "pronunciation_challenge",
    "difficulty": "beginner",
    "skillArea": "pronunciation",
    "pointsReward": 20,
    "minLevel": 1,
    "maxLevel": null,
    "assignedStudents": [],
    "content": {
      "instruction": "Listen carefully and repeat each word. Try to match the pronunciation!",
      "words": [
        {"word": "Hello", "phonetic": "/həˈloʊ/", "audioUrl": ""},
        {"word": "Thank you", "phonetic": "/θæŋk juː/", "audioUrl": ""},
        {"word": "Please", "phonetic": "/pliːz/", "audioUrl": ""},
        {"word": "Goodbye", "phonetic": "/ɡʊdˈbaɪ/", "audioUrl": ""},
        {"word": "Excuse me", "phonetic": "/ɪkˈskjuːz miː/", "audioUrl": ""}
      ]
    }
  }' | python3 -c "import sys, json; d=json.load(sys.stdin); print(f\"   ✅ Created: {d['activity']['title']} (ID: {d['activity']['id']})\")"

echo ""

# Activity 2: Simple Sentences (Pronunciation)
echo "2️⃣  Creating: Simple Everyday Sentences"
curl -s -X POST "http://localhost:3000/api/teachers/custom-practices" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -d '{
    "title": "Simple Everyday Sentences",
    "description": "Practice pronouncing complete sentences used in daily life",
    "type": "pronunciation_challenge",
    "difficulty": "intermediate",
    "skillArea": "fluency",
    "pointsReward": 30,
    "minLevel": 1,
    "maxLevel": null,
    "assignedStudents": [],
    "content": {
      "instruction": "Read each sentence aloud clearly. Take your time!",
      "words": [
        {"word": "Good morning, how are you?", "phonetic": "/ɡʊd ˈmɔːnɪŋ, haʊ ɑːr juː/", "audioUrl": ""},
        {"word": "I am fine, thank you.", "phonetic": "/aɪ æm faɪn, θæŋk juː/", "audioUrl": ""},
        {"word": "Nice to meet you.", "phonetic": "/naɪs tə miːt juː/", "audioUrl": ""},
        {"word": "Where is the classroom?", "phonetic": "/weər ɪz ðə ˈklæsruːm/", "audioUrl": ""},
        {"word": "Can you help me, please?", "phonetic": "/kæn juː help miː pliːz/", "audioUrl": ""}
      ]
    }
  }' | python3 -c "import sys, json; d=json.load(sys.stdin); print(f\"   ✅ Created: {d['activity']['title']} (ID: {d['activity']['id']})\")"

echo ""

# Activity 3: Classroom Objects (Vocabulary Match)
echo "3️⃣  Creating: Classroom Objects"
curl -s -X POST "http://localhost:3000/api/teachers/custom-practices" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -d '{
    "title": "Classroom Objects",
    "description": "Match classroom items with their pictures",
    "type": "vocabulary_match",
    "difficulty": "beginner",
    "skillArea": "vocabulary",
    "pointsReward": 25,
    "minLevel": 1,
    "maxLevel": null,
    "assignedStudents": [],
    "content": {
      "instruction": "Match each word with the correct picture!",
      "vocabulary": [
        {"word": "Book", "imageUrl": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300", "translation": "کتاب"},
        {"word": "Pencil", "imageUrl": "https://images.unsplash.com/photo-1589932767257-42a5a2bdee7e?w=300", "translation": "مداد"},
        {"word": "Desk", "imageUrl": "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=300", "translation": "میز"},
        {"word": "Chair", "imageUrl": "https://images.unsplash.com/photo-1503602642458-232111445657?w=300", "translation": "صندلی"},
        {"word": "Backpack", "imageUrl": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300", "translation": "کوله پشتی"},
        {"word": "Notebook", "imageUrl": "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=300", "translation": "دفترچه"}
      ]
    }
  }' | python3 -c "import sys, json; d=json.load(sys.stdin); print(f\"   ✅ Created: {d['activity']['title']} (ID: {d['activity']['id']})\")"

echo ""

# Activity 4: Present Simple Tense (Grammar Quiz)
echo "4️⃣  Creating: Present Simple Tense Quiz"
curl -s -X POST "http://localhost:3000/api/teachers/custom-practices" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -d '{
    "title": "Present Simple Tense Quiz",
    "description": "Test your understanding of present simple tense",
    "type": "quiz_challenge",
    "difficulty": "intermediate",
    "skillArea": "vocabulary",
    "pointsReward": 30,
    "minLevel": 1,
    "maxLevel": null,
    "assignedStudents": [],
    "content": {
      "instruction": "Choose the correct answer for each question",
      "questions": [
        {
          "question": "She _____ to school every day.",
          "options": ["go", "goes", "going", "went"],
          "correctAnswer": 1,
          "category": "Present Simple",
          "explanation": "We use goes (not go) with she/he/it in present simple."
        },
        {
          "question": "They _____ English every morning.",
          "options": ["studies", "study", "studying", "studied"],
          "correctAnswer": 1,
          "category": "Present Simple",
          "explanation": "We use study (not studies) with they/we/you in present simple."
        },
        {
          "question": "I _____ breakfast at 7 AM.",
          "options": ["eats", "eating", "eat", "ate"],
          "correctAnswer": 2,
          "category": "Present Simple",
          "explanation": "We use eat (not eats) with I/you/we/they in present simple."
        },
        {
          "question": "My teacher _____ very nice.",
          "options": ["am", "are", "is", "be"],
          "correctAnswer": 2,
          "category": "Verb to Be",
          "explanation": "We use is with he/she/it (my teacher = he/she)."
        },
        {
          "question": "_____ you like ice cream?",
          "options": ["Does", "Do", "Are", "Is"],
          "correctAnswer": 1,
          "category": "Questions",
          "explanation": "We use Do (not Does) to make questions with I/you/we/they."
        }
      ]
    }
  }' | python3 -c "import sys, json; d=json.load(sys.stdin); print(f\"   ✅ Created: {d['activity']['title']} (ID: {d['activity']['id']})\")"

echo ""

# Activity 5: Common Verbs (Vocabulary Match)
echo "5️⃣  Creating: Common Action Verbs"
curl -s -X POST "http://localhost:3000/api/teachers/custom-practices" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -d '{
    "title": "Common Action Verbs",
    "description": "Learn action verbs by matching pictures",
    "type": "vocabulary_match",
    "difficulty": "beginner",
    "skillArea": "vocabulary",
    "pointsReward": 25,
    "minLevel": 1,
    "maxLevel": null,
    "assignedStudents": [],
    "content": {
      "instruction": "Match each verb with the correct action picture!",
      "vocabulary": [
        {"word": "Read", "imageUrl": "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300", "translation": "خواندن"},
        {"word": "Write", "imageUrl": "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=300", "translation": "نوشتن"},
        {"word": "Listen", "imageUrl": "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=300", "translation": "گوش دادن"},
        {"word": "Speak", "imageUrl": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300", "translation": "صحبت کردن"},
        {"word": "Play", "imageUrl": "https://images.unsplash.com/photo-1611432579699-484f7990b127?w=300", "translation": "بازی کردن"},
        {"word": "Run", "imageUrl": "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=300", "translation": "دویدن"}
      ]
    }
  }' | python3 -c "import sys, json; d=json.load(sys.stdin); print(f\"   ✅ Created: {d['activity']['title']} (ID: {d['activity']['id']})\")"

echo ""

# Activity 6: Singular vs Plural (Grammar Quiz)
echo "6️⃣  Creating: Singular & Plural Forms"
curl -s -X POST "http://localhost:3000/api/teachers/custom-practices" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -d '{
    "title": "Singular & Plural Forms",
    "description": "Master singular and plural noun forms",
    "type": "quiz_challenge",
    "difficulty": "beginner",
    "skillArea": "vocabulary",
    "pointsReward": 25,
    "minLevel": 1,
    "maxLevel": null,
    "assignedStudents": [],
    "content": {
      "instruction": "Choose the correct plural form!",
      "questions": [
        {
          "question": "What is the plural of book?",
          "options": ["book", "books", "bookes", "bookies"],
          "correctAnswer": 1,
          "category": "Regular Plurals",
          "explanation": "We add -s to make most nouns plural."
        },
        {
          "question": "What is the plural of child?",
          "options": ["childs", "childes", "children", "childrens"],
          "correctAnswer": 2,
          "category": "Irregular Plurals",
          "explanation": "Child has an irregular plural: children."
        },
        {
          "question": "What is the plural of box?",
          "options": ["boxs", "boxes", "boxies", "boxen"],
          "correctAnswer": 1,
          "category": "Plurals with -es",
          "explanation": "We add -es to words ending in x, s, sh, ch."
        },
        {
          "question": "What is the plural of man?",
          "options": ["mans", "men", "mens", "manes"],
          "correctAnswer": 1,
          "category": "Irregular Plurals",
          "explanation": "Man has an irregular plural: men."
        },
        {
          "question": "What is the plural of pencil?",
          "options": ["pencil", "penciles", "pencils", "pencilen"],
          "correctAnswer": 2,
          "category": "Regular Plurals",
          "explanation": "We add -s to make pencil plural: pencils."
        }
      ]
    }
  }' | python3 -c "import sys, json; d=json.load(sys.stdin); print(f\"   ✅ Created: {d['activity']['title']} (ID: {d['activity']['id']})\")"

echo ""
echo "===================================================="
echo "✅ Professional Activities Setup Complete!"
echo ""
echo "📊 Created 6 activities:"
echo "   1. Basic Greetings & Politeness (Pronunciation)"
echo "   2. Simple Everyday Sentences (Pronunciation)"
echo "   3. Classroom Objects (Vocabulary Match)"
echo "   4. Present Simple Tense Quiz (Grammar)"
echo "   5. Common Action Verbs (Vocabulary Match)"
echo "   6. Singular & Plural Forms (Grammar)"
echo ""
echo "🎓 Ready for student presentation!"
echo "===================================================="
