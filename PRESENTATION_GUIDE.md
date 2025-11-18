# 🎓 Student Presentation Guide - LingoShid Activities

**Date:** November 17, 2025
**Prepared For:** Student Demonstration & Teacher Dashboard Testing

---

## 📋 Overview

This guide contains everything you need for your student presentation and to test the teacher dashboard with real student activity data.

---

## 🎯 Available Activities (6 Professional Activities)

### 1. **Basic Greetings & Politeness** ✨
**Type:** Pronunciation Challenge
**Difficulty:** Beginner
**Points:** 20
**Duration:** ~5 minutes

**What Students Learn:**
- Proper pronunciation of common greetings
- Polite expressions used in daily life
- Phonetic transcription understanding

**Content:**
1. Hello - `/həˈloʊ/`
2. Thank you - `/θæŋk juː/`
3. Please - `/pliːz/`
4. Goodbye - `/ɡʊdˈbaɪ/`
5. Excuse me - `/ɪkˈskjuːz miː/`

**How It Works:**
- Student clicks "Listen" to hear TTS pronunciation
- Student clicks "Record" to practice saying the word
- Speech recognition evaluates pronunciation
- Instant feedback provided
- Progress through all 5 words

---

### 2. **Simple Everyday Sentences** 🗣️
**Type:** Pronunciation Challenge
**Difficulty:** Intermediate
**Points:** 30
**Duration:** ~7 minutes

**What Students Learn:**
- Fluent sentence pronunciation
- Sentence structure awareness
- Conversational English

**Content:**
1. "Good morning, how are you?"
2. "I am fine, thank you."
3. "Nice to meet you."
4. "Where is the classroom?"
5. "Can you help me, please?"

**How It Works:**
- Read complete sentences aloud
- More complex than single words
- Focus on fluency and natural rhythm
- Encourages full sentence practice

---

### 3. **Classroom Objects** 📚
**Type:** Vocabulary Match
**Difficulty:** Beginner
**Points:** 25
**Duration:** ~5 minutes

**What Students Learn:**
- Classroom vocabulary
- Word-image association
- Farsi-English translation

**Content:**
1. Book (کتاب) - with real image
2. Pencil (مداد) - with real image
3. Desk (میز) - with real image
4. Chair (صندلی) - with real image
5. Backpack (کوله پشتی) - with real image
6. Notebook (دفترچه) - with real image

**How It Works:**
- Two columns: words and images
- Tap word, then tap matching image
- Visual feedback (correct/incorrect)
- Immediate reinforcement learning

---

### 4. **Present Simple Tense Quiz** 📝
**Type:** Grammar Quiz
**Difficulty:** Intermediate
**Points:** 30
**Duration:** ~6 minutes

**What Students Learn:**
- Present simple verb conjugation
- Subject-verb agreement
- Question formation

**Content:**
1. She _____ to school every day. (goes)
2. They _____ English every morning. (study)
3. I _____ breakfast at 7 AM. (eat)
4. My teacher _____ very nice. (is)
5. _____ you like ice cream? (Do)

**How It Works:**
- Multiple choice format (A, B, C, D)
- Instant feedback after selection
- Detailed explanations for wrong answers
- Category badges (Present Simple, Verb to Be, Questions)
- Real-time statistics display

---

### 5. **Common Action Verbs** 🏃
**Type:** Vocabulary Match
**Difficulty:** Beginner
**Points:** 25
**Duration:** ~5 minutes

**What Students Learn:**
- Essential action verbs
- Visual action recognition
- Verb-action association

**Content:**
1. Read (خواندن) - person reading
2. Write (نوشتن) - hand writing
3. Listen (گوش دادن) - person with headphones
4. Speak (صحبت کردن) - person speaking
5. Play (بازی کردن) - children playing
6. Run (دویدن) - person running

**How It Works:**
- Match verb words with action images
- Real photos from Unsplash
- Immediate visual feedback
- Builds verb vocabulary

---

### 6. **Singular & Plural Forms** 🔢
**Type:** Grammar Quiz
**Difficulty:** Beginner
**Points:** 25
**Duration:** ~5 minutes

**What Students Learn:**
- Regular plural formation (add -s)
- Irregular plurals (child→children)
- Special rules (-es for words ending in x, s, sh, ch)

**Content:**
1. book → books (regular)
2. child → children (irregular)
3. box → boxes (special -es rule)
4. man → men (irregular)
5. pencil → pencils (regular)

**How It Works:**
- Multiple choice questions
- Clear explanations for each rule
- Pattern recognition development
- Foundation for grammar mastery

---

## 🎬 Presentation Flow (Recommended)

### Part 1: Introduction (2 minutes)
```
"Today we're going to practice English using our new interactive platform!
You'll be able to:
- Practice pronunciation with instant feedback
- Match words with pictures
- Test your grammar knowledge
- Earn points for each activity!"
```

### Part 2: Demonstration (5 minutes)
**Show one activity live:**
1. Open browser: `http://localhost:4200`
2. Login as student
3. Navigate to Activities page
4. Click "Basic Greetings & Politeness"
5. Demonstrate:
   - Listening to pronunciation
   - Recording voice
   - Seeing feedback
   - Completing activity
   - Viewing completion modal with points

### Part 3: Student Practice (20-30 minutes)
**Let students try:**
1. Each student chooses 2-3 activities
2. Work at their own pace
3. You monitor progress from Teacher Dashboard

### Part 4: Review Results (5 minutes)
**Show Teacher Dashboard:**
1. Open: `http://localhost:4200/teacher`
2. Login as teacher
3. Show:
   - Recent activity completions
   - Student scores
   - Points earned
   - Time spent on activities

---

## 👨‍🏫 Teacher Dashboard Features

### What You Can See:

#### 1. **Student List**
```
/teacher/students
```
- All registered students
- Current levels and points
- Recent activity

#### 2. **Analytics Dashboard**
```
/teacher/analytics
```
- Overall class performance
- Activity completion rates
- Average scores
- Time spent per activity

#### 3. **Custom Practices**
```
/teacher/custom-practice
```
- View created activities
- Create new activities
- Assign to specific students or all
- Delete activities

#### 4. **Student Progress (Individual)**
```
/teacher/student-progress/:id
```
- Detailed student performance
- Activity history
- Score trends
- Strengths and weaknesses

---

## 🧪 Testing Checklist for Presentation

### Before Presentation:
- [ ] Server running (`npm run start:dev` in server folder)
- [ ] Frontend running (should be on port 4200)
- [ ] All 6 activities visible in student activities page
- [ ] Teacher dashboard accessible
- [ ] Test one complete activity to verify it works

### During Presentation:
- [ ] Students can login successfully
- [ ] Activities load and display correctly
- [ ] Pronunciation works (microphone access)
- [ ] Vocabulary matching is intuitive
- [ ] Quiz questions display properly
- [ ] Completion modals show with confetti
- [ ] Points are awarded

### After Presentation:
- [ ] Check teacher dashboard for new completions
- [ ] Verify student points increased
- [ ] Review activity data in analytics
- [ ] Check if any students need help

---

## 📊 Expected Student Data Flow

### When Student Completes Activity:

**1. Activity Selection**
```
Student clicks: "Basic Greetings & Politeness"
   ↓
Session starts in database
   ↓
Module loads (PronunciationModuleComponent)
```

**2. Activity Progress**
```
Student practices 5 words
   ↓
Module tracks: attempts, scores, time
   ↓
All data kept in memory
```

**3. Activity Completion**
```
Student finishes all 5 words
   ↓
Module calculates: final score, bonus points
   ↓
Data sent to backend
   ↓
Database updated:
   - activity_completions (new record)
   - activity_sessions (status: completed)
   - students (points += earned points)
```

**4. Teacher Dashboard**
```
Refresh teacher dashboard
   ↓
See new completion
   ↓
View student's score, time, points earned
```

---

## 🎯 Activity Completion Data

### What Gets Saved (Example):

**Activity:** Present Simple Tense Quiz
**Student:** Alex Johnson
**Score:** 100% (5/5 correct)
**Time:** 3 minutes 45 seconds
**Points Earned:** 35 (30 base + 5 bonus)

**Stored in Database:**
```json
{
  "student_id": "ac1cee04-6302-43ca-8ac1-204f932a5f56",
  "activity_id": "be85d39c-b7a8-40aa-af55-493e6823b54f",
  "score": 100,
  "points_earned": 35,
  "time_spent": 225,
  "is_completed": true,
  "submission_data": {
    "stage_1": {"question": "She ___ to school every day", "answer": 1, "correct": true},
    "stage_2": {"question": "They ___ English every morning", "answer": 1, "correct": true},
    "stage_3": {"question": "I ___ breakfast at 7 AM", "answer": 2, "correct": true},
    "stage_4": {"question": "My teacher ___ very nice", "answer": 2, "correct": true},
    "stage_5": {"question": "___ you like ice cream?", "answer": 1, "correct": true}
  },
  "feedback": {
    "message": "Perfect! You answered all questions correctly!",
    "encouragement": "Your grammar knowledge is excellent!",
    "strengths": ["Perfect score on all questions"]
  },
  "completed_at": "2025-11-17T17:00:00.000Z"
}
```

---

## 🔍 Monitoring During Presentation

### Teacher View (Live):

**Option 1: Analytics Dashboard**
```
http://localhost:4200/teacher/analytics
```
- Refresh periodically
- See new completions appear
- View real-time statistics

**Option 2: Students List**
```
http://localhost:4200/teacher/students
```
- See each student's latest activity
- Check point totals increasing
- Monitor who's active

**Option 3: Database (Advanced)**
```sql
-- Recent completions (last 10 minutes)
SELECT
  s.first_name,
  s.last_name,
  a.title,
  ac.score,
  ac.points_earned,
  ac.completed_at
FROM activity_completions ac
JOIN students s ON ac.student_id = s.id
JOIN activities a ON ac.activity_id = a.id
WHERE ac.completed_at > NOW() - INTERVAL 10 MINUTE
ORDER BY ac.completed_at DESC;
```

---

## 💡 Presentation Tips

### For Students:
1. **Start with easier activities**
   - Basic Greetings & Politeness
   - Classroom Objects
   - Singular & Plural Forms

2. **Progress to intermediate**
   - Simple Everyday Sentences
   - Present Simple Tense Quiz
   - Common Action Verbs

3. **Encourage exploration**
   - "Try different types of activities!"
   - "See which one you like best!"
   - "Earn points and level up!"

### For Teachers:
1. **Monitor progress**
   - Keep teacher dashboard open
   - Check for students who might need help
   - Celebrate high scores publicly

2. **Provide guidance**
   - Help with technical issues (microphone, etc.)
   - Explain instructions if needed
   - Encourage persistence

3. **Review afterward**
   - Discuss what students learned
   - Show analytics to the class
   - Set goals for next session

---

## 🚀 Quick Start Commands

### Start Backend:
```bash
cd /Users/sina/Documents/platforms/lingoshid/server
npm run start:dev
```

### Frontend Already Running On:
```
http://localhost:4200
```

### Student Login:
```
Email: student@demo.com
Password: demo123
```

### Teacher Login:
```
Email: teacher@demo.com
Password: demo123
```

---

## 📈 Success Metrics

### Good Presentation Indicators:
- [ ] All students successfully complete at least 1 activity
- [ ] Average score above 70%
- [ ] No technical issues with microphone/images
- [ ] Students engaged and enjoying activities
- [ ] Teacher can view all completions in dashboard
- [ ] Points are being awarded correctly

### If Issues Occur:
1. **Microphone not working**
   - Check browser permissions
   - Use Chrome/Edge (better speech recognition)
   - Try vocabulary/quiz activities instead

2. **Images not loading**
   - Check internet connection
   - Images from Unsplash may need connectivity
   - Should still show placeholders

3. **Activity not saving**
   - Check console for errors
   - Verify backend is running
   - Check database connection

---

## 🎊 After Presentation

### Review with Students:
1. "How many points did you earn?"
2. "Which activity was your favorite?"
3. "What did you learn today?"
4. "Do you want to try more activities at home?"

### Review with Teachers:
1. Show completion data
2. Discuss student performance
3. Plan future activities
4. Consider creating custom activities for specific needs

---

## 📝 Activity URLs (For Quick Access)

### Direct Links:

**Basic Greetings:**
```
http://localhost:4200/student/activities/11e68255-23bf-4fae-af83-b3b40df1e543/start
```

**Simple Sentences:**
```
http://localhost:4200/student/activities/93927f72-0e43-4054-975d-a2bcdd20056d/start
```

**Classroom Objects:**
```
http://localhost:4200/student/activities/0a1020c1-7b4b-42fa-8c82-1fb5ab65eb5d/start
```

**Present Simple Quiz:**
```
http://localhost:4200/student/activities/be85d39c-b7a8-40aa-af55-493e6823b54f/start
```

**Action Verbs:**
```
http://localhost:4200/student/activities/d3427524-1cc7-4371-b2b5-6120835517eb/start
```

**Singular & Plural:**
```
http://localhost:4200/student/activities/ad420b2f-672b-486e-86f1-c06e3a8e2165/start
```

---

## ✅ Final Checklist

Before starting presentation:
- [ ] Backend server running
- [ ] Frontend accessible
- [ ] Test one activity yourself
- [ ] Teacher dashboard loads
- [ ] Student login works
- [ ] All 6 activities visible
- [ ] Microphone permissions granted
- [ ] Internet connection stable
- [ ] Projector/screen working
- [ ] This guide printed/accessible

---

## 🎉 You're Ready!

**Activities:** ✅ Created
**Backend:** ✅ Integrated
**Database:** ✅ Storing results
**Teacher Dashboard:** ✅ Showing data
**Presentation Guide:** ✅ Complete

**Go make an amazing presentation!** 🚀

---

*Guide prepared: November 17, 2025*
*Platform: LingoShid EFL Learning*
*Status: ✅ READY FOR PRESENTATION*
