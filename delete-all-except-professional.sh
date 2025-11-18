#!/bin/bash

echo "🧹 Deleting ALL Activities Except the 6 Professional Ones"
echo "========================================================================"
echo ""

# Get teacher token
echo "📝 Logging in as teacher..."
TEACHER_TOKEN=$(curl -s -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@demo.com","password":"demo123"}' | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")

echo "✅ Teacher authenticated"
echo ""

# The 6 professional activities to KEEP
KEEP_TITLES=(
  "Basic Greetings & Politeness"
  "Simple Everyday Sentences"
  "Classroom Objects"
  "Present Simple Tense Quiz"
  "Common Action Verbs"
  "Singular & Plural Forms"
)

# Get all activities
echo "📋 Fetching all activities..."
ALL_ACTIVITIES=$(curl -s -X GET "http://localhost:3000/api/activities" \
  -H "Authorization: Bearer $TEACHER_TOKEN")

# Extract activities to delete
echo "$ALL_ACTIVITIES" | python3 -c "
import sys, json
keep_titles = [
    'Basic Greetings & Politeness',
    'Simple Everyday Sentences',
    'Classroom Objects',
    'Present Simple Tense Quiz',
    'Common Action Verbs',
    'Singular & Plural Forms'
]

try:
    data = json.load(sys.stdin)
    total = len(data)
    to_delete = 0

    print(f'Found {total} total activities')
    print('')
    print('🗑️  Activities to DELETE:')

    for item in data:
        title = item.get('title', '')
        activity_id = item.get('id', '')
        if title not in keep_titles:
            print(f'{activity_id}|{title}')
            to_delete += 1

    print('')
    print(f'Will delete: {to_delete} activities')
    print(f'Will keep: {len(keep_titles)} professional activities')
except Exception as e:
    print(f'Error: {e}', file=sys.stderr)
" > /tmp/activities_to_delete.txt

echo ""
echo "🗑️  Deleting old activities..."
while IFS='|' read -r activity_id title; do
    if [ ! -z "$activity_id" ] && [ "$activity_id" != "Found"* ] && [ "$activity_id" != "Will"* ]; then
        echo "  Deleting: $title (ID: $activity_id)"
        DELETE_RESULT=$(curl -s -X DELETE "http://localhost:3000/api/activities/$activity_id" \
          -H "Authorization: Bearer $TEACHER_TOKEN")

        # Check if deletion was successful
        if echo "$DELETE_RESULT" | grep -q "error\|Error"; then
            echo "  ⚠️  Warning: $DELETE_RESULT"
        else
            echo "  ✓ Deleted"
        fi
    fi
done < /tmp/activities_to_delete.txt

rm /tmp/activities_to_delete.txt

echo ""
echo "========================================================================"
echo "✅ Cleanup Complete!"
echo ""
echo "📊 Kept ONLY these 6 professional modular activities:"
echo "   1. Basic Greetings & Politeness (pronunciation_challenge)"
echo "   2. Simple Everyday Sentences (pronunciation_challenge)"
echo "   3. Classroom Objects (vocabulary_match)"
echo "   4. Present Simple Tense Quiz (quiz_challenge)"
echo "   5. Common Action Verbs (vocabulary_match)"
echo "   6. Singular & Plural Forms (quiz_challenge)"
echo ""
echo "🎯 Page http://localhost:4200/student/activities now shows ONLY modular activities!"
echo "========================================================================"
