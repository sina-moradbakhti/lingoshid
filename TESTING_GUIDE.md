# 🧪 Step-by-Step Testing Guide for Modular Activity System

## Prerequisites
- [ ] Backend server running (`npm run start:dev` in server directory)
- [ ] Frontend running (`npm start` in webapp directory)
- [ ] Database connected
- [ ] At least one student account created

---

## 📋 STEP 1: Create Test Activities in Database

You need to add activities with the new module types to your database.

### Option A: Using Database Seeder (Recommended)

Create a seeder file to add test activities:

**File: `server/src/database/module-activities.seeder.ts`**

```typescript
import { DataSource } from 'typeorm';
import { Activity } from '../entities/activity.entity';
import { ActivityType, DifficultyLevel, SkillArea } from '../enums/activity-type.enum';

export async function seedModuleActivities(dataSource: DataSource) {
  const activityRepository = dataSource.getRepository(Activity);

  const moduleActivities = [
    // 1. Pronunciation Challenge
    {
      title: 'Basic Greetings - Pronunciation',
      description: 'Practice pronouncing common English greetings',
      type: 'pronunciation_challenge', // New module type!
      difficulty: DifficultyLevel.BEGINNER,
      skillArea: SkillArea.PRONUNCIATION,
      pointsReward: 20,
      minLevel: 1,
      content: {
        words: ['Hello', 'Goodbye', 'Thank you', 'Please', 'Excuse me']
      },
      isActive: true,
      order: 100
    },

    // 2. Quiz Challenge
    {
      title: 'English Grammar Quiz',
      description: 'Test your knowledge of English grammar',
      type: 'quiz_challenge', // New module type!
      difficulty: DifficultyLevel.BEGINNER,
      skillArea: SkillArea.VOCABULARY,
      pointsReward: 25,
      minLevel: 1,
      content: {
        questions: [
          {
            question: 'What is the past tense of "go"?',
            options: ['goed', 'went', 'gone', 'going'],
            correctAnswer: 1,
            explanation: 'The past tense of "go" is "went".',
            category: 'Grammar'
          },
          {
            question: 'Which word is a noun?',
            options: ['run', 'happy', 'cat', 'quickly'],
            correctAnswer: 2,
            explanation: 'A noun is a person, place, or thing. "Cat" is a thing.',
            category: 'Parts of Speech'
          },
          {
            question: 'Choose the correct sentence:',
            options: [
              'She go to school',
              'She goes to school',
              'She going to school',
              'She gone to school'
            ],
            correctAnswer: 1,
            explanation: 'We use "goes" with "she/he/it" in present simple.',
            category: 'Grammar'
          }
        ],
        passingScore: 70,
        showExplanations: true
      },
      isActive: true,
      order: 101
    },

    // 3. Vocabulary Match
    {
      title: 'Animals Vocabulary Match',
      description: 'Match animal words with their pictures',
      type: 'vocabulary_match', // New module type!
      difficulty: DifficultyLevel.BEGINNER,
      skillArea: SkillArea.VOCABULARY,
      pointsReward: 30,
      minLevel: 1,
      content: {
        vocabulary: [
          {
            word: 'Cat',
            imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop',
            translation: 'گربه',
            category: 'Animals'
          },
          {
            word: 'Dog',
            imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=300&fit=crop',
            translation: 'سگ',
            category: 'Animals'
          },
          {
            word: 'Bird',
            imageUrl: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400&h=300&fit=crop',
            translation: 'پرنده',
            category: 'Animals'
          },
          {
            word: 'Fish',
            imageUrl: 'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=400&h=300&fit=crop',
            translation: 'ماهی',
            category: 'Animals'
          }
        ],
        itemsPerRound: 4,
        showTranslations: false
      },
      isActive: true,
      order: 102
    }
  ];

  for (const activityData of moduleActivities) {
    const existing = await activityRepository.findOne({
      where: { title: activityData.title }
    });

    if (!existing) {
      const activity = activityRepository.create(activityData);
      await activityRepository.save(activity);
      console.log(`✅ Created module activity: ${activityData.title}`);
    } else {
      console.log(`⏭️  Skipped (already exists): ${activityData.title}`);
    }
  }

  console.log('✅ Module activities seeding complete!');
}
```

**Run the seeder:**

```bash
cd server
npm run seed  # or however you run your seeders
```

### Option B: Manual SQL Insert (Quick Test)

If you prefer SQL directly:

```sql
-- 1. Pronunciation Challenge
INSERT INTO activities (
  id, title, description, type, difficulty, "skillArea", "pointsReward",
  "minLevel", content, "isActive", "order", "createdAt", "updatedAt"
)
VALUES (
  uuid_generate_v4(),
  'Basic Greetings - Pronunciation',
  'Practice pronouncing common English greetings',
  'pronunciation_challenge',
  'beginner',
  'pronunciation',
  20,
  1,
  '{"words": ["Hello", "Goodbye", "Thank you", "Please", "Excuse me"]}',
  true,
  100,
  NOW(),
  NOW()
);

-- 2. Quiz Challenge
INSERT INTO activities (
  id, title, description, type, difficulty, "skillArea", "pointsReward",
  "minLevel", content, "isActive", "order", "createdAt", "updatedAt"
)
VALUES (
  uuid_generate_v4(),
  'English Grammar Quiz',
  'Test your knowledge of English grammar',
  'quiz_challenge',
  'beginner',
  'vocabulary',
  25,
  1,
  '{"questions": [{"question": "What is the past tense of go?", "options": ["goed", "went", "gone", "going"], "correctAnswer": 1, "explanation": "The past tense of go is went.", "category": "Grammar"}], "passingScore": 70, "showExplanations": true}',
  true,
  101,
  NOW(),
  NOW()
);

-- 3. Vocabulary Match
INSERT INTO activities (
  id, title, description, type, difficulty, "skillArea", "pointsReward",
  "minLevel", content, "isActive", "order", "createdAt", "updatedAt"
)
VALUES (
  uuid_generate_v4(),
  'Animals Vocabulary Match',
  'Match animal words with their pictures',
  'vocabulary_match',
  'beginner',
  'vocabulary',
  30,
  1,
  '{"vocabulary": [{"word": "Cat", "imageUrl": "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop"}, {"word": "Dog", "imageUrl": "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=300&fit=crop"}], "itemsPerRound": 2}',
  true,
  102,
  NOW(),
  NOW()
);
```

---

## 📋 STEP 2: Verify Activities in Database

Check that activities were created:

```sql
SELECT id, title, type, "pointsReward", content
FROM activities
WHERE type IN ('pronunciation_challenge', 'quiz_challenge', 'vocabulary_match');
```

**Expected Output:**
- At least 3 activities with the new types
- Each has content in JSON format

---

## 📋 STEP 3: Access Student Dashboard

1. **Open browser:** `http://localhost:4200`

2. **Login as student:**
   - Email: `student@demo.com` (or your student account)
   - Password: your password

3. **You should see:** Student Dashboard

---

## 📋 STEP 4: Navigate to Activities List

**From Student Dashboard:**

1. Click **"Activities"** button or menu
2. **Expected URL:** `http://localhost:4200/student/activities`

3. **You should see:**
   - List of all activities
   - INCLUDING your new module-based activities:
     - ✅ "Basic Greetings - Pronunciation"
     - ✅ "English Grammar Quiz"
     - ✅ "Animals Vocabulary Match"

---

## 📋 STEP 5: Test NEW Modular Activity (Not Old System)

### Important: How to Access the NEW System

There are TWO ways to run activities now:

**OLD System (Hardcoded):**
```
/student/activities/{id}/start
```

**NEW System (Modular) - USE THIS:**
```
/student/module-activities/{id}/start
```

### Manual URL Edit Method

1. **Click on one of the new activities** (e.g., "Basic Greetings - Pronunciation")
2. **Note the activity ID in the URL**
3. **Manually change the URL** from:
   ```
   http://localhost:4200/student/activities/ACTIVITY_ID/start
   ```
   to:
   ```
   http://localhost:4200/student/module-activities/ACTIVITY_ID/start
   ```

4. **Press Enter**

---

## 📋 STEP 6: Test Pronunciation Module

### Expected Behavior:

**1. Loading Screen:**
- You'll see: "Loading Activity..."
- Spinner animation

**2. Module Loads:**
- Large word displayed (e.g., "Hello")
- Phonetic transcription (if available)
- "🔊 Listen" button
- "🎤 Start Recording" button
- Progress bar showing "Stage 1/5"

**3. Browser Console (Open DevTools - F12):**
```
✅ Module loaded successfully: pronunciation_challenge
```

**4. Test Interactions:**

a) **Click "🔊 Listen"**
   - Browser speaks the word using TTS
   - Button changes to "⏸️ Stop"

b) **Click "🎤 Start Recording"**
   - Browser asks for microphone permission (allow it)
   - Button changes to "⏹️ Stop Recording (0s)"
   - Timer counts up
   - Recording indicator pulses

c) **Say the word out loud** (e.g., "Hello")

d) **Wait for feedback:**
   - Shows score circle (e.g., 85%)
   - Shows "Great pronunciation!" or similar
   - Shows what you said vs. target word
   - Shows "Next Word →" button

e) **Click "Next Word"**
   - Moves to stage 2
   - Progress bar updates (2/5)
   - New word appears

f) **Complete all 5 words**

**5. Completion Modal:**
- 🎉 Confetti animation!
- Large score circle (your percentage)
- Points earned display
- Time spent
- Feedback and suggestions
- "Try Again" and "More Activities" buttons

---

## 📋 STEP 7: Test Quiz Module

### Navigate to Quiz:

**URL:**
```
http://localhost:4200/student/module-activities/{QUIZ_ACTIVITY_ID}/start
```

### Expected Behavior:

**1. Quiz Interface Loads:**
- Question text displayed
- 4 options (A, B, C, D) as buttons
- Category badge (e.g., "Grammar")
- Progress: "Question 1/3"
- Statistics: Correct: 0, Incorrect: 0, Score: 0%

**2. Answer a Question:**

a) **Click an option** (e.g., option B)
   - Button highlights with blue border
   - "Submit Answer" button becomes active

b) **Click "Submit Answer"**
   - Correct answer turns GREEN with ✓
   - Wrong answer (if you selected) turns RED with ✗
   - Explanation appears (if wrong)
   - Statistics update
   - "Next Question →" button appears

c) **Click "Next Question"**
   - Moves to question 2
   - Stats persist across questions

**3. Complete All Questions:**
- Final score calculates
- Completion modal shows:
  - Percentage score
  - Points earned
  - Total questions vs. correct
  - Pass/Fail status
  - Suggestions for improvement

---

## 📋 STEP 8: Test Vocabulary Match Module

### Navigate to Vocabulary Match:

**URL:**
```
http://localhost:4200/student/module-activities/{VOCAB_ACTIVITY_ID}/start
```

### Expected Behavior:

**1. Matching Interface Loads:**
- Left column: Words (Cat, Dog, Bird, Fish)
- Right column: Images (shuffled)
- Center: Connection indicator
- Progress: "Round 1/1"
- Stats: Matched 0/4, Accuracy 100%, Errors: 0

**2. Make a Match:**

a) **Click a word** (e.g., "Cat")
   - Word button highlights with blue border
   - Hint appears: "Now select the matching picture →"

b) **Click the matching image**
   - If CORRECT:
     - ✅ Full-screen green overlay
     - "Perfect Match!" message
     - Shows word ↔ image
     - Both disappear after animation
     - Stats update: Matched 1/4

   - If INCORRECT:
     - ✗ Full-screen red overlay
     - "Try Again!" message
     - Selections reset
     - Errors increment

c) **Continue matching all pairs**

**3. Round Complete:**
- Completion modal shows:
  - Score based on accuracy
  - Total attempts
  - Errors made
  - Points earned
  - Feedback

---

## 📋 STEP 9: Check Data Persistence

### Test Points & Progress:

**After completing an activity:**

1. **Go back to Dashboard:**
   ```
   http://localhost:4200/student/dashboard
   ```

2. **Check if points increased:**
   - Look at total points display
   - Should show points earned from module

3. **Check Recent Activities:**
   - Should show your completed module activity
   - With score and points

4. **Check Leaderboard:**
   ```
   http://localhost:4200/student/leaderboard
   ```
   - Your points should be updated

---

## 📋 STEP 10: Test Error Handling

### Test Unregistered Module Type:

1. **Create an activity with unknown type:**
   ```sql
   INSERT INTO activities (
     id, title, description, type, difficulty, "skillArea",
     "pointsReward", "minLevel", content, "isActive", "order"
   )
   VALUES (
     uuid_generate_v4(),
     'Test Unknown Type',
     'This will show error',
     'unknown_module_type',
     'beginner',
     'vocabulary',
     10,
     1,
     '{}',
     true,
     999
   );
   ```

2. **Try to access it:**
   ```
   http://localhost:4200/student/module-activities/{ID}/start
   ```

3. **Expected Error Message:**
   ```
   ⚠️ Activity type "unknown_module_type" is not yet available
   in the modular system. This activity will use the old system instead.
   ```

4. **Has "Back to Activities" button**

---

## 📋 STEP 11: Compare Old vs New System

### Test Same Activity on Both Systems:

**1. New System (Modular):**
```
/student/module-activities/{pronunciation_activity_id}/start
```
- Should load pronunciation module
- Modern UI
- Modular behavior

**2. Old System (Hardcoded):**
```
/student/activities/{same_pronunciation_activity_id}/start
```
- Might not work (old system expects old content structure)
- OR shows old interface

**Result:** Both coexist peacefully!

---

## 🐛 Troubleshooting

### Problem: Activities Don't Show Up

**Solution:**
```sql
-- Check activities exist
SELECT * FROM activities WHERE type LIKE '%challenge%';

-- Make sure isActive = true
UPDATE activities SET "isActive" = true
WHERE type IN ('pronunciation_challenge', 'quiz_challenge', 'vocabulary_match');
```

### Problem: Module Doesn't Load

**Check browser console (F12):**

**If you see:**
```
❌ Module type "xyz" not found in registry
```

**Solution:** Module not registered. Check `app.ts` initialization.

**If you see:**
```
✅ Module loaded successfully
```

**But nothing displays:** Check component template/styles.

### Problem: Microphone Not Working

**Solutions:**
1. Use Chrome or Edge (best speech recognition support)
2. Check browser permissions (allow microphone)
3. Use HTTPS or localhost (required for mic access)

### Problem: Images Not Loading

**Solution:**
- Check image URLs are valid
- Try with Unsplash URLs (they work well)
- Check CORS settings

---

## ✅ Success Checklist

After testing, you should have:

- [ ] Created 3 test activities with new module types
- [ ] Accessed activities from student dashboard
- [ ] Tested pronunciation module (spoke into mic, got feedback)
- [ ] Tested quiz module (answered questions, saw results)
- [ ] Tested vocabulary match (matched words with images)
- [ ] Saw completion modal with confetti
- [ ] Verified points were awarded
- [ ] Checked console logs show module registration
- [ ] Tested error handling with unknown type
- [ ] Confirmed old system still works independently

---

## 📸 Expected Screenshots

### When Testing Pronunciation:
![Pronunciation Module]
- Large word display
- Listen and Record buttons
- Progress indicator
- Feedback card with score

### When Testing Quiz:
![Quiz Module]
- Question with A/B/C/D options
- Correct answer highlighted green
- Statistics at top
- Next question button

### When Testing Vocab Match:
![Vocab Match Module]
- Words on left, images on right
- Connection indicator in middle
- Match feedback overlay
- Progress stats

### Completion Modal (All Modules):
![Completion]
- Confetti animation
- Large score circle
- Points breakdown
- Feedback and buttons

---

## 🎯 Next Steps After Testing

If everything works:

1. **Create more activities** with module types
2. **Assign to students** for real use
3. **Collect feedback** on UI/UX
4. **Add more modules** (follow the guide)
5. **Migrate old activities** to modular system (optional)

If something doesn't work:

1. **Check browser console** for errors
2. **Check backend logs** for API errors
3. **Verify database** has correct data structure
4. **Test with simple data first** (minimal content)

---

## 📞 Quick Reference

**New Module Routes:**
```
/student/module-activities/{id}/start
```

**Old System Routes (Still Work):**
```
/student/activities/{id}/start
```

**Module Types:**
- `pronunciation_challenge`
- `quiz_challenge`
- `vocabulary_match`

**To Add More:**
- See `ACTIVITY_MODULE_GUIDE.md`

---

**Happy Testing! 🎉**

If you encounter any issues, check the browser console (F12) first - it will show helpful error messages!
