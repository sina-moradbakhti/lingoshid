#!/bin/bash

# Get teacher token
TEACHER_TOKEN=$(curl -s -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@demo.com","password":"demo123"}' | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")

echo "Teacher token obtained"
echo "Creating Quiz Challenge..."

# Create Quiz Challenge Activity
curl -X POST "http://localhost:3000/api/teachers/custom-practices" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -d '{
    "title": "TEST: English Grammar Quiz",
    "description": "Test your English grammar knowledge with this interactive quiz",
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
          "question": "What is the plural of child?",
          "options": ["childs", "children", "childes", "child"],
          "correctAnswer": 1,
          "category": "Grammar",
          "explanation": "The irregular plural of child is children."
        },
        {
          "question": "Which word is a noun?",
          "options": ["run", "quickly", "happiness", "beautiful"],
          "correctAnswer": 2,
          "category": "Parts of Speech",
          "explanation": "Happiness is a noun representing a state of being."
        },
        {
          "question": "Choose the correct sentence:",
          "options": [
            "She go to school everyday",
            "She goes to school everyday",
            "She going to school everyday",
            "She gone to school everyday"
          ],
          "correctAnswer": 1,
          "category": "Verb Tenses",
          "explanation": "Use goes with she/he/it in present simple."
        }
      ]
    }
  }'

echo ""
echo "Creating Vocabulary Match..."

# Create Vocabulary Match Activity
curl -X POST "http://localhost:3000/api/teachers/custom-practices" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -d '{
    "title": "TEST: Match Animals with Pictures",
    "description": "Match the animal names with their pictures",
    "type": "vocabulary_match",
    "difficulty": "beginner",
    "skillArea": "vocabulary",
    "pointsReward": 20,
    "minLevel": 1,
    "maxLevel": null,
    "assignedStudents": [],
    "content": {
      "instruction": "Match each word with the correct picture",
      "vocabulary": [
        {
          "word": "Cat",
          "imageUrl": "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300",
          "translation": "گربه"
        },
        {
          "word": "Dog",
          "imageUrl": "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=300",
          "translation": "سگ"
        },
        {
          "word": "Bird",
          "imageUrl": "https://images.unsplash.com/photo-1444464666168-49d633b86797?w=300",
          "translation": "پرنده"
        },
        {
          "word": "Fish",
          "imageUrl": "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=300",
          "translation": "ماهی"
        }
      ]
    }
  }'

echo ""
echo "All test activities created!"
