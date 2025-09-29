# 🎮 Lingoshid - Gamified EFL Learning Platform

A comprehensive gamified English as Foreign Language (EFL) learning platform designed specifically for Iranian primary school students (ages 9-12). This platform focuses on developing speaking skills through engaging, game-based activities that reduce anxiety and increase motivation.

## 📋 Project Overview

Lingoshid is based on academic research investigating the impact of gamified EFL learning platforms on Iranian primary school students' speaking development. The platform incorporates game design elements such as points, badges, leaderboards, and progress tracking to enhance speaking skills including fluency, pronunciation, and confidence.

### Key Features

- **🎯 Gamified Learning**: Points, badges, levels, and leaderboards
- **🗣️ Speaking-Focused Activities**: Pronunciation challenges, virtual conversations, picture descriptions
- **👥 Multi-Role Support**: Students, Parents, Teachers, and Admins
- **📊 Progress Tracking**: Detailed analytics and progress reports
- **🏆 Achievement System**: Badges and achievements to motivate learners
- **📱 Responsive Design**: Works on desktop and mobile devices

## 🏗️ Architecture

### Backend (NestJS)
- **Framework**: NestJS with TypeScript
- **Database**: MySQL with TypeORM
- **Authentication**: JWT-based authentication
- **API**: RESTful API with role-based access control

### Frontend (Angular)
- **Framework**: Angular 20+ with TypeScript
- **Styling**: SCSS with responsive design
- **State Management**: RxJS and Angular services
- **UI Components**: Custom components with gamified design

## 🚀 Getting Started

### Prerequisites

- Node.js (v20 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd lingoshid
   ```

2. **Setup Backend**
   ```bash
   cd server
   npm install
   
   # Create MySQL database
   mysql -u root -p
   CREATE DATABASE lingoshid;
   
   # Copy environment file and configure
   cp .env.example .env
   # Edit .env with your database credentials
   
   # Start the server
   npm run start:dev
   ```

3. **Setup Frontend**
   ```bash
   cd ../webapp
   npm install
   
   # Start the development server
   npm start
   ```

4. **Access the Application**
   - Frontend: http://localhost:4200
   - Backend API: http://localhost:3000/api

### Demo Accounts

The application includes demo accounts for testing:

- **Student**: `student@demo.com` / `demo123`
- **Parent**: `parent@demo.com` / `demo123`
- **Teacher**: `teacher@demo.com` / `demo123`

## 📚 User Roles & Features

### 👨‍🎓 Students
- **Dashboard**: Level progress, points, streaks, and badges
- **Activities**: Speaking challenges, pronunciation practice, virtual conversations
- **Progress Tracking**: Skill development in fluency, pronunciation, and confidence
- **Leaderboard**: Class rankings and achievements
- **Badges**: Unlock achievements for various milestones

### 👨‍👩‍👧‍👦 Parents
- **Children Overview**: Monitor multiple children's progress
- **Progress Reports**: Weekly and monthly progress summaries
- **Activity History**: View completed activities and scores
- **Communication**: Receive notifications about child's achievements

### 👩��🏫 Teachers
- **Class Management**: Manage multiple classes and students
- **Student Analytics**: Detailed progress reports for each student
- **Activity Assignment**: Assign specific activities to students
- **Performance Tracking**: Monitor class-wide performance metrics

### 🔧 Admins
- **User Management**: Create and manage all user types
- **Content Management**: Add and modify activities
- **System Analytics**: Platform-wide usage statistics
- **Configuration**: System settings and parameters

## 🎮 Gamification Elements

### Points System
- **Speaking Practice**: 10 points per minute of active speaking
- **Pronunciation Accuracy**: 5-25 points based on assessment
- **Daily Login**: 5 points
- **Activity Completion**: 10-50 points based on difficulty

### Badge System
- **First Steps**: Complete first speaking activity
- **Brave Speaker**: Speak for 5 minutes total
- **Pronunciation Pro**: Achieve 80% pronunciation accuracy
- **Conversation Master**: Complete 10 dialogue activities
- **Story Teller**: Record and share one story
- **Daily Learner**: Login for 7 consecutive days

### Level Progression
- **Beginner Explorer** (Levels 1-5)
- **Confident Communicator** (Levels 6-10)
- **Fluent Speaker** (Levels 11-15)
- **Master Storyteller** (Levels 16-20)

## 🎯 Activity Types

### 1. Pronunciation Challenges
Students record themselves pronouncing target sounds, words, and phrases with immediate feedback using speech recognition technology.

### 2. Virtual Conversations
Interactive dialogues with AI characters in various scenarios (shopping, school, family) to practice functional English.

### 3. Picture Description Games
Students describe images and earn points for vocabulary use, sentence structure, and creativity.

### 4. Role-Play Adventures
Students assume different characters and navigate English-speaking scenarios.

### 5. Story Creation Challenges
Students create and record original stories using provided vocabulary and grammar structures.

### 6. Singing and Chanting
Interactive songs and chants help students practice rhythm, intonation, and pronunciation.

## 📊 Assessment & Progress Tracking

### Speaking Assessment Rubric (5-point scale)

**Fluency Assessment**
- Speech flow and natural rhythm
- Rate of speech appropriate for age group
- Self-corrections and hesitations
- Connected discourse with transitions

**Pronunciation Assessment**
- Phoneme production accuracy
- Word stress and sentence intonation
- Articulation clarity
- Rhythm and connected speech patterns

**Speaking Confidence Assessment**
- Willingness to initiate conversation
- Volume and voice projection
- Eye contact and body language
- Risk-taking in communication

## 🛠️ Development

### Backend Development
```bash
cd server
npm run start:dev    # Development mode with hot reload
npm run build        # Build for production
npm run test         # Run tests
```

### Frontend Development
```bash
cd webapp
npm start            # Development server
npm run build        # Build for production
npm run test         # Run unit tests
npm run e2e          # Run end-to-end tests
```

### Database Management
```bash
# Generate migration
npm run migration:generate -- -n MigrationName

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert
```

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_NAME=lingoshid
JWT_SECRET=your_jwt_secret
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:4200
```

**Frontend (environment.ts)**
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

## 📈 Research Background

This platform is designed based on academic research investigating:

- **Digital Game-Based Learning (DGBL)** effectiveness in EFL contexts
- **Gamification elements** impact on speaking skill development
- **Anxiety reduction** through game-based learning environments
- **Motivation enhancement** in young EFL learners
- **Cultural appropriateness** for Iranian educational contexts

### Research Questions Addressed

1. Speaking fluency development through gamified platforms
2. Pronunciation accuracy improvement via game-based activities
3. Speaking confidence enhancement in young learners
4. Student perceptions of gamified vs. traditional instruction

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Research Supervisor**: Nasibeh Bagherpor, Ph.D.
- **Researcher**: Sheida Abhari
- **Development**: Qodo AI Assistant

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Refer to the documentation

---

**🎮 Happy Learning with Lingoshid!** 

*Transforming English language learning through gamification for young minds.*