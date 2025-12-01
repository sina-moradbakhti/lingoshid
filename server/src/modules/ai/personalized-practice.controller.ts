import { Controller, Get, Post, UseGuards, Req, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StudentAnalyticsService, WeaknessAnalysis } from './student-analytics.service';
import { PersonalizedPracticeGeneratorService, GeneratedPractice } from './personalized-practice-generator.service';
import { StudentsService } from '../students/students.service';

@Controller('ai/personalized')
@UseGuards(AuthGuard('jwt'))
export class PersonalizedPracticeController {
  constructor(
    private studentAnalyticsService: StudentAnalyticsService,
    private personalizedPracticeGenerator: PersonalizedPracticeGeneratorService,
    private studentsService: StudentsService,
  ) {}

  /**
   * Get comprehensive weakness analysis for the authenticated student
   *
   * @returns Detailed analysis of student's weaknesses across all skill areas
   */
  @Get('analysis')
  async getWeaknessAnalysis(@Req() req: any) {
    const studentId = req.user.studentId;

    if (!studentId) {
      throw new Error('Only students can get personalized analysis');
    }

    const analysis = await this.studentAnalyticsService.analyzeStudentWeaknesses(studentId);

    return {
      success: true,
      data: analysis,
      message: 'Student weakness analysis completed successfully',
    };
  }

  /**
   * Generate personalized practice activities based on student weaknesses
   *
   * @returns Array of AI-generated practice activities tailored to the student
   */
  @Post('generate')
  async generatePersonalizedPractices(@Req() req: any) {
    const studentId = req.user.studentId;

    if (!studentId) {
      throw new Error('Only students can generate personalized practices');
    }

    // Get student information
    const student = await this.studentsService.findOne(studentId);
    const studentName = student.user.firstName;
    const grade = student.grade;

    // Analyze weaknesses
    const weaknessAnalysis = await this.studentAnalyticsService.analyzeStudentWeaknesses(studentId);

    // Generate personalized practices
    const practices = await this.personalizedPracticeGenerator.generatePersonalizedPractices(
      studentName,
      grade,
      weaknessAnalysis,
    );

    return {
      success: true,
      data: {
        practices,
        analysis: weaknessAnalysis,
        generatedAt: new Date(),
      },
      message: `Generated ${practices.length} personalized practice activities`,
    };
  }

  /**
   * Get personalized recommendations with analysis
   * Combines analysis and practice generation in one call
   *
   * @returns Complete personalized learning plan with recommendations
   */
  @Get('recommendations')
  async getRecommendations(@Req() req: any) {
    const studentId = req.user.studentId;

    if (!studentId) {
      throw new Error('Only students can get personalized recommendations');
    }

    // Get student information
    const student = await this.studentsService.findOne(studentId);
    const studentName = student.user.firstName;
    const grade = student.grade;

    // Analyze weaknesses
    const analysis = await this.studentAnalyticsService.analyzeStudentWeaknesses(studentId);

    // Generate personalized practices
    const practices = await this.personalizedPracticeGenerator.generatePersonalizedPractices(
      studentName,
      grade,
      analysis,
    );

    // Build comprehensive recommendation object
    const recommendations = {
      studentProfile: {
        name: studentName,
        grade,
        overallLevel: analysis.overallLevel,
      },
      weaknessAnalysis: {
        primaryWeakness: analysis.primaryWeakness,
        secondaryWeakness: analysis.secondaryWeakness,
        focusAreas: analysis.focusAreas,
        grammarIssues: analysis.grammarIssues,
        vocabularyGaps: analysis.vocabularyGaps,
      },
      skillBreakdown: analysis.skillAnalyses.map(skill => ({
        skillArea: skill.skillArea,
        currentScore: skill.currentScore,
        averageScore: skill.averageScore,
        trend: skill.recentTrend,
        weaknessLevel: skill.weaknessLevel,
        recommendations: skill.recommendations,
        activitiesCompleted: skill.activitiesCompleted,
      })),
      suggestedPractices: practices.map(practice => ({
        title: practice.title,
        description: practice.description,
        type: practice.type,
        difficulty: practice.difficulty,
        skillArea: practice.skillArea,
        reasoning: practice.reasoning,
        targetWeaknesses: practice.targetWeaknesses,
        content: practice.content,
      })),
      actionPlan: this.generateActionPlan(analysis, practices),
      generatedAt: new Date(),
    };

    return {
      success: true,
      data: recommendations,
      message: 'Personalized recommendations generated successfully',
    };
  }

  /**
   * Generate a simple action plan for the student
   */
  private generateActionPlan(
    analysis: WeaknessAnalysis,
    practices: GeneratedPractice[],
  ): string[] {
    const plan: string[] = [];

    // Add overall level guidance
    if (analysis.overallLevel === 'beginner') {
      plan.push('Focus on building foundational skills with simple activities');
    } else if (analysis.overallLevel === 'intermediate') {
      plan.push('Challenge yourself with more complex activities to advance');
    } else {
      plan.push('Maintain your excellent level with advanced practice');
    }

    // Add primary weakness recommendation
    if (analysis.primaryWeakness) {
      plan.push(`Priority: Improve ${analysis.primaryWeakness} skills (your biggest area for growth)`);
    }

    // Add practice recommendations
    if (practices.length > 0) {
      plan.push(`Complete the ${practices.length} personalized activities below`);
    }

    // Add specific focus areas
    if (analysis.focusAreas.length > 0) {
      plan.push(`Work on: ${analysis.focusAreas.slice(0, 3).join(', ')}`);
    }

    // Add grammar guidance if needed
    if (analysis.grammarIssues.length > 0) {
      plan.push(`Grammar focus: Practice ${analysis.grammarIssues.join(', ')}`);
    }

    // Add encouragement
    const criticalCount = analysis.skillAnalyses.filter(s => s.weaknessLevel === 'critical').length;
    const strongCount = analysis.skillAnalyses.filter(s => s.weaknessLevel === 'none').length;

    if (strongCount > criticalCount) {
      plan.push('You\'re doing great! Keep up the good work!');
    } else if (criticalCount > 0) {
      plan.push('Don\'t worry! With practice, you\'ll improve quickly!');
    } else {
      plan.push('Excellent progress! Keep challenging yourself!');
    }

    return plan;
  }
}
