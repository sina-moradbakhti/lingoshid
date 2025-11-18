#!/bin/bash

echo "🧹 Cleaning All Old Activities"
echo "===================================================="
echo ""

# Get teacher token
echo "📝 Logging in as teacher..."
TEACHER_TOKEN=$(curl -s -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@demo.com","password":"demo123"}' | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")

echo "✅ Teacher authenticated"
echo ""

# Get all custom practices
echo "📋 Fetching all custom practices..."
EXISTING=$(curl -s -X GET "http://localhost:3000/api/teachers/custom-practices" \
  -H "Authorization: Bearer $TEACHER_TOKEN")

# Extract IDs and titles to delete
echo "$EXISTING" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if isinstance(data, list):
        print(f'Found {len(data)} custom practices to review')
        # Keep only the new professional activities
        keep_titles = [
            'Basic Greetings & Politeness',
            'Simple Everyday Sentences',
            'Classroom Objects',
            'Present Simple Tense Quiz',
            'Common Action Verbs',
            'Singular & Plural Forms'
        ]
        for item in data:
            if 'activity' in item:
                title = item['activity'].get('title', '')
                activity_id = item['activity'].get('id', '')
                if title not in keep_titles:
                    print(f'{activity_id}|{title}')
except Exception as e:
    print(f'Error: {e}', file=sys.stderr)
" > /tmp/activities_to_delete.txt

# Delete activities
echo ""
echo "🗑️  Removing old activities..."
while IFS='|' read -r activity_id title; do
    if [ ! -z "$activity_id" ]; then
        echo "  Deleting: $title"
        curl -s -X DELETE "http://localhost:3000/api/teachers/custom-practices/$activity_id" \
          -H "Authorization: Bearer $TEACHER_TOKEN" > /dev/null
        echo "  ✓ Deleted"
    fi
done < /tmp/activities_to_delete.txt

rm /tmp/activities_to_delete.txt

echo ""
echo "===================================================="
echo "✅ Cleanup Complete!"
echo ""
echo "📊 Kept 6 professional activities only:"
echo "   1. Basic Greetings & Politeness"
echo "   2. Simple Everyday Sentences"
echo "   3. Classroom Objects"
echo "   4. Present Simple Tense Quiz"
echo "   5. Common Action Verbs"
echo "   6. Singular & Plural Forms"
echo "===================================================="
