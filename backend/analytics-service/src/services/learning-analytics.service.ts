import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { 
  LearningAnalytics, 
  AnalyticsMetrics, 
  AnalyticsTrends, 
  LearningRecommendation,
  EmotionData,
  LearningSession,
  EmotionType 
} from '@ai-professor/shared';
import * as ss from 'simple-statistics';

export interface LearningPattern {
  userId: string;
  patterns: {
    preferredStudyTime: string; // e.g., "morning", "afternoon", "evening"
    averageSessionDuration: number; // in minutes
    learningVelocity: number; // concepts per hour
    retentionRate: number; // 0-1
    difficultyPreference: 'easy' | 'medium' | 'hard';
    subjectAffinity: { [subject: string]: number }; // 0-1 scores
    emotionalStability: number; // variance in emotions, 0-1
    engagementTrend: 'increasing' | 'decreasing' | 'stable';
  };
  lastUpdated: Date;
}

export interface PerformancePrediction {
  userId: string;
  predictions: {
    nextSessionPerformance: number; // 0-1
    conceptMasteryTime: number; // minutes to master next concept
    riskOfDropout: number; // 0-1
    optimalBreakTime: number; // minutes
    recommendedDifficulty: 'beginner' | 'intermediate' | 'advanced';
  };
  confidence: number; // 0-1
  generatedAt: Date;
}

export interface LearningInsight {
  type: 'strength' | 'weakness' | 'opportunity' | 'trend';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  actionable: boolean;
  recommendations: string[];
  dataPoints: number;
  confidence: number;
}

@Injectable()
export class LearningAnalyticsService {
  private readonly logger = new Logger(LearningAnalyticsService.name);

  constructor(private readonly configService: ConfigService) {}

  async generateLearningAnalytics(
    userId: string,
    timeframe: 'day' | 'week' | 'month' | 'year' = 'week',
  ): Promise<LearningAnalytics> {
    this.logger.log(`📊 Generating learning analytics for user ${userId} (${timeframe})`);

    try {
      // Get user's learning data
      const sessions = await this.getUserSessions(userId, timeframe);
      const emotions = await this.getUserEmotions(userId, timeframe);
      const assessments = await this.getUserAssessments(userId, timeframe);

      // Calculate metrics
      const metrics = this.calculateMetrics(sessions, emotions, assessments);
      
      // Calculate trends
      const trends = this.calculateTrends(sessions, emotions, timeframe);
      
      // Generate recommendations
      const recommendations = await this.generateRecommendations(userId, metrics, trends);

      const analytics: LearningAnalytics = {
        userId,
        timeframe,
        metrics,
        trends,
        recommendations,
        lastUpdated: new Date(),
      };

      this.logger.log(`✅ Generated analytics for user ${userId}: ${metrics.sessionsCompleted} sessions, ${metrics.conceptsMastered} concepts mastered`);
      return analytics;

    } catch (error) {
      this.logger.error(`❌ Failed to generate analytics for user ${userId}:`, error);
      throw new Error('Failed to generate learning analytics');
    }
  }

  async identifyLearningPatterns(userId: string): Promise<LearningPattern> {
    this.logger.log(`🔍 Identifying learning patterns for user ${userId}`);

    try {
      const sessions = await this.getUserSessions(userId, 'month');
      const emotions = await this.getUserEmotions(userId, 'month');

      // Analyze study time preferences
      const studyTimes = sessions.map(s => new Date(s.startedAt).getHours());
      const preferredStudyTime = this.identifyPreferredTime(studyTimes);

      // Calculate average session duration
      const durations = sessions
        .filter(s => s.duration)
        .map(s => s.duration! / 60); // convert to minutes
      const averageSessionDuration = durations.length > 0 ? ss.mean(durations) : 0;

      // Calculate learning velocity
      const totalConcepts = sessions.reduce((sum, s) => 
        sum + (s.analytics?.conceptsLearned?.length || 0), 0);
      const totalHours = sessions.reduce((sum, s) => 
        sum + ((s.duration || 0) / 3600), 0);
      const learningVelocity = totalHours > 0 ? totalConcepts / totalHours : 0;

      // Calculate retention rate (simplified)
      const retentionRate = this.calculateRetentionRate(sessions);

      // Analyze difficulty preference
      const difficultyPreference = this.analyzeDifficultyPreference(sessions);

      // Calculate subject affinity
      const subjectAffinity = this.calculateSubjectAffinity(sessions);

      // Analyze emotional stability
      const emotionalStability = this.calculateEmotionalStability(emotions);

      // Determine engagement trend
      const engagementTrend = this.calculateEngagementTrend(sessions);

      const patterns: LearningPattern = {
        userId,
        patterns: {
          preferredStudyTime,
          averageSessionDuration,
          learningVelocity,
          retentionRate,
          difficultyPreference,
          subjectAffinity,
          emotionalStability,
          engagementTrend,
        },
        lastUpdated: new Date(),
      };

      this.logger.log(`✅ Identified learning patterns for user ${userId}`);
      return patterns;

    } catch (error) {
      this.logger.error(`❌ Failed to identify learning patterns for user ${userId}:`, error);
      throw new Error('Failed to identify learning patterns');
    }
  }

  async predictPerformance(userId: string): Promise<PerformancePrediction> {
    this.logger.log(`🔮 Predicting performance for user ${userId}`);

    try {
      const patterns = await this.identifyLearningPatterns(userId);
      const recentSessions = await this.getUserSessions(userId, 'week');
      const recentEmotions = await this.getUserEmotions(userId, 'week');

      // Predict next session performance based on trends
      const recentPerformances = recentSessions.map(s => s.analytics?.engagementScore || 0.5);
      const nextSessionPerformance = this.predictNextValue(recentPerformances);

      // Estimate concept mastery time
      const conceptMasteryTime = this.estimateConceptMasteryTime(patterns);

      // Calculate dropout risk
      const riskOfDropout = this.calculateDropoutRisk(patterns, recentSessions, recentEmotions);

      // Recommend optimal break time
      const optimalBreakTime = this.calculateOptimalBreakTime(patterns);

      // Recommend difficulty level
      const recommendedDifficulty = this.recommendDifficulty(patterns, recentSessions);

      // Calculate prediction confidence
      const confidence = this.calculatePredictionConfidence(recentSessions.length, patterns);

      const prediction: PerformancePrediction = {
        userId,
        predictions: {
          nextSessionPerformance,
          conceptMasteryTime,
          riskOfDropout,
          optimalBreakTime,
          recommendedDifficulty,
        },
        confidence,
        generatedAt: new Date(),
      };

      this.logger.log(`✅ Generated performance prediction for user ${userId} (confidence: ${(confidence * 100).toFixed(1)}%)`);
      return prediction;

    } catch (error) {
      this.logger.error(`❌ Failed to predict performance for user ${userId}:`, error);
      throw new Error('Failed to predict performance');
    }
  }

  async generateLearningInsights(userId: string): Promise<LearningInsight[]> {
    this.logger.log(`💡 Generating learning insights for user ${userId}`);

    try {
      const analytics = await this.generateLearningAnalytics(userId, 'month');
      const patterns = await this.identifyLearningPatterns(userId);
      const insights: LearningInsight[] = [];

      // Strength insights
      if (analytics.metrics.averageEngagement > 0.8) {
        insights.push({
          type: 'strength',
          title: 'High Engagement Level',
          description: 'You consistently maintain high engagement during learning sessions.',
          impact: 'high',
          actionable: true,
          recommendations: [
            'Continue with your current learning approach',
            'Consider taking on more challenging material',
            'Share your engagement strategies with peers'
          ],
          dataPoints: analytics.trends.engagementBySubject.length,
          confidence: 0.9,
        });
      }

      // Weakness insights
      if (analytics.metrics.averageEngagement < 0.4) {
        insights.push({
          type: 'weakness',
          title: 'Low Engagement Pattern',
          description: 'Your engagement levels have been consistently low across sessions.',
          impact: 'high',
          actionable: true,
          recommendations: [
            'Try shorter, more focused study sessions',
            'Experiment with different learning modalities',
            'Take regular breaks to maintain focus',
            'Consider studying during your peak energy hours'
          ],
          dataPoints: analytics.trends.engagementBySubject.length,
          confidence: 0.85,
        });
      }

      // Opportunity insights
      const strongSubjects = Object.entries(patterns.patterns.subjectAffinity)
        .filter(([, score]) => score > 0.7)
        .map(([subject]) => subject);

      if (strongSubjects.length > 0) {
        insights.push({
          type: 'opportunity',
          title: 'Subject Mastery Opportunity',
          description: `You show strong aptitude in ${strongSubjects.join(', ')}. Consider advanced topics.`,
          impact: 'medium',
          actionable: true,
          recommendations: [
            `Explore advanced concepts in ${strongSubjects[0]}`,
            'Consider mentoring others in your strong subjects',
            'Look for real-world applications of your knowledge'
          ],
          dataPoints: strongSubjects.length,
          confidence: 0.8,
        });
      }

      // Trend insights
      if (patterns.patterns.engagementTrend === 'increasing') {
        insights.push({
          type: 'trend',
          title: 'Improving Learning Trajectory',
          description: 'Your engagement and performance have been steadily improving.',
          impact: 'high',
          actionable: true,
          recommendations: [
            'Maintain your current learning routine',
            'Gradually increase session complexity',
            'Set more ambitious learning goals'
          ],
          dataPoints: analytics.trends.performanceOverTime.length,
          confidence: 0.75,
        });
      }

      // Emotional stability insights
      if (patterns.patterns.emotionalStability < 0.3) {
        insights.push({
          type: 'weakness',
          title: 'Emotional Variability',
          description: 'Your emotions during learning sessions vary significantly.',
          impact: 'medium',
          actionable: true,
          recommendations: [
            'Practice mindfulness before study sessions',
            'Identify and avoid emotional triggers',
            'Consider stress management techniques',
            'Take breaks when feeling overwhelmed'
          ],
          dataPoints: analytics.trends.emotionTrends.length,
          confidence: 0.7,
        });
      }

      // Learning velocity insights
      if (patterns.patterns.learningVelocity > 2.0) {
        insights.push({
          type: 'strength',
          title: 'Fast Learner',
          description: 'You master concepts quickly compared to average learners.',
          impact: 'high',
          actionable: true,
          recommendations: [
            'Challenge yourself with advanced material',
            'Consider accelerated learning paths',
            'Help slower learners to reinforce your knowledge'
          ],
          dataPoints: analytics.metrics.conceptsMastered,
          confidence: 0.85,
        });
      }

      this.logger.log(`✅ Generated ${insights.length} learning insights for user ${userId}`);
      return insights;

    } catch (error) {
      this.logger.error(`❌ Failed to generate learning insights for user ${userId}:`, error);
      throw new Error('Failed to generate learning insights');
    }
  }

  private calculateMetrics(
    sessions: LearningSession[],
    emotions: EmotionData[],
    assessments: any[],
  ): AnalyticsMetrics {
    const totalStudyTime = sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60; // minutes
    const sessionsCompleted = sessions.length;
    
    const engagementScores = sessions
      .map(s => s.analytics?.engagementScore)
      .filter(score => score !== undefined) as number[];
    const averageEngagement = engagementScores.length > 0 ? ss.mean(engagementScores) : 0;

    const conceptsMastered = sessions.reduce((sum, s) => 
      sum + (s.analytics?.conceptsLearned?.length || 0), 0);

    // Extract skills and areas from session metadata
    const allSkills = sessions.flatMap(s => s.metadata?.tags || []);
    const skillCounts = allSkills.reduce((acc, skill) => {
      acc[skill] = (acc[skill] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const skillsImproved = Object.keys(skillCounts).filter(skill => skillCounts[skill] >= 3);
    
    // Identify weak and strong areas based on engagement and performance
    const subjectPerformance = this.calculateSubjectPerformance(sessions);
    const weakAreas = Object.entries(subjectPerformance)
      .filter(([, score]) => score < 0.6)
      .map(([subject]) => subject);
    const strongAreas = Object.entries(subjectPerformance)
      .filter(([, score]) => score > 0.8)
      .map(([subject]) => subject);

    // Calculate progress percentage (simplified)
    const progressPercentage = Math.min(100, (conceptsMastered / 50) * 100); // Assuming 50 concepts for 100%

    return {
      totalStudyTime,
      sessionsCompleted,
      averageEngagement,
      conceptsMastered,
      skillsImproved,
      weakAreas,
      strongAreas,
      progressPercentage,
    };
  }

  private calculateTrends(
    sessions: LearningSession[],
    emotions: EmotionData[],
    timeframe: string,
  ): AnalyticsTrends {
    // Group sessions by day
    const sessionsByDay = this.groupSessionsByDay(sessions);
    const studyTimeByDay = sessionsByDay.map(({ date, sessions: daySessions }) => ({
      date,
      value: daySessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60, // minutes
    }));

    // Calculate engagement by subject
    const subjectEngagement = this.calculateSubjectEngagement(sessions);
    const engagementBySubject = Object.entries(subjectEngagement).map(([subject, value]) => ({
      subject,
      value,
    }));

    // Calculate performance over time
    const performanceOverTime = sessionsByDay.map(({ date, sessions: daySessions }) => {
      const avgScore = daySessions.length > 0 
        ? ss.mean(daySessions.map(s => s.analytics?.engagementScore || 0.5))
        : 0.5;
      return {
        date,
        score: avgScore,
        subject: 'Overall',
      };
    });

    // Calculate emotion trends
    const emotionsByDay = this.groupEmotionsByDay(emotions);
    const emotionTrends = emotionsByDay.map(({ date, emotions: dayEmotions }) => {
      const emotionCounts = this.countEmotionsByType(dayEmotions);
      return {
        date,
        emotions: emotionCounts,
      };
    });

    return {
      studyTimeByDay,
      engagementBySubject,
      performanceOverTime,
      emotionTrends,
    };
  }

  private async generateRecommendations(
    userId: string,
    metrics: AnalyticsMetrics,
    trends: AnalyticsTrends,
  ): Promise<LearningRecommendation[]> {
    const recommendations: LearningRecommendation[] = [];

    // Study time recommendations
    if (metrics.totalStudyTime < 60) { // Less than 1 hour per week
      recommendations.push({
        type: 'skill',
        title: 'Increase Study Time',
        description: 'Consider dedicating more time to learning to see better progress.',
        priority: 'high',
        estimatedTime: 30,
        reasoning: 'Low total study time detected',
      });
    }

    // Engagement recommendations
    if (metrics.averageEngagement < 0.5) {
      recommendations.push({
        type: 'break',
        title: 'Take a Learning Break',
        description: 'Your engagement seems low. A short break might help refresh your focus.',
        priority: 'medium',
        estimatedTime: 15,
        reasoning: 'Low engagement levels detected',
      });
    }

    // Subject-specific recommendations
    if (metrics.weakAreas.length > 0) {
      recommendations.push({
        type: 'review',
        title: `Review ${metrics.weakAreas[0]}`,
        description: `Focus on strengthening your understanding of ${metrics.weakAreas[0]}.`,
        priority: 'high',
        estimatedTime: 45,
        reasoning: 'Weak performance area identified',
      });
    }

    // Progress-based recommendations
    if (metrics.progressPercentage > 80) {
      recommendations.push({
        type: 'course',
        title: 'Advanced Topics',
        description: 'You\'re making excellent progress! Consider exploring advanced topics.',
        priority: 'medium',
        estimatedTime: 60,
        reasoning: 'High progress percentage achieved',
      });
    }

    return recommendations;
  }

  // Helper methods
  private async getUserSessions(userId: string, timeframe: string): Promise<LearningSession[]> {
    // This would query the database for user sessions
    // For now, return mock data
    return [];
  }

  private async getUserEmotions(userId: string, timeframe: string): Promise<EmotionData[]> {
    // This would query the database for user emotions
    // For now, return mock data
    return [];
  }

  private async getUserAssessments(userId: string, timeframe: string): Promise<any[]> {
    // This would query the database for user assessments
    // For now, return mock data
    return [];
  }

  private identifyPreferredTime(studyTimes: number[]): string {
    if (studyTimes.length === 0) return 'any';
    
    const morningCount = studyTimes.filter(h => h >= 6 && h < 12).length;
    const afternoonCount = studyTimes.filter(h => h >= 12 && h < 18).length;
    const eveningCount = studyTimes.filter(h => h >= 18 || h < 6).length;
    
    if (morningCount >= afternoonCount && morningCount >= eveningCount) return 'morning';
    if (afternoonCount >= eveningCount) return 'afternoon';
    return 'evening';
  }

  private calculateRetentionRate(sessions: LearningSession[]): number {
    // Simplified retention calculation
    const totalConcepts = sessions.reduce((sum, s) => 
      sum + (s.analytics?.conceptsLearned?.length || 0), 0);
    const retainedConcepts = Math.floor(totalConcepts * 0.8); // Assume 80% retention
    return totalConcepts > 0 ? retainedConcepts / totalConcepts : 0;
  }

  private analyzeDifficultyPreference(sessions: LearningSession[]): 'easy' | 'medium' | 'hard' {
    const difficulties = sessions.map(s => s.metadata?.difficulty).filter(Boolean);
    if (difficulties.length === 0) return 'medium';
    
    const counts = difficulties.reduce((acc, diff) => {
      acc[diff] = (acc[diff] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const preferred = Object.entries(counts).sort(([,a], [,b]) => b - a)[0][0];
    return preferred as 'easy' | 'medium' | 'hard';
  }

  private calculateSubjectAffinity(sessions: LearningSession[]): { [subject: string]: number } {
    const subjectPerformance = this.calculateSubjectPerformance(sessions);
    return subjectPerformance;
  }

  private calculateSubjectPerformance(sessions: LearningSession[]): { [subject: string]: number } {
    const subjectData: { [subject: string]: number[] } = {};
    
    sessions.forEach(session => {
      const subject = session.metadata?.subject || 'General';
      const engagement = session.analytics?.engagementScore || 0.5;
      
      if (!subjectData[subject]) {
        subjectData[subject] = [];
      }
      subjectData[subject].push(engagement);
    });
    
    const subjectPerformance: { [subject: string]: number } = {};
    Object.entries(subjectData).forEach(([subject, scores]) => {
      subjectPerformance[subject] = scores.length > 0 ? ss.mean(scores) : 0.5;
    });
    
    return subjectPerformance;
  }

  private calculateEmotionalStability(emotions: EmotionData[]): number {
    if (emotions.length < 2) return 0.5;
    
    const confidenceValues = emotions.map(e => e.confidence);
    const variance = ss.variance(confidenceValues);
    
    // Convert variance to stability score (lower variance = higher stability)
    return Math.max(0, 1 - variance);
  }

  private calculateEngagementTrend(sessions: LearningSession[]): 'increasing' | 'decreasing' | 'stable' {
    if (sessions.length < 3) return 'stable';
    
    const engagementScores = sessions
      .map(s => s.analytics?.engagementScore || 0.5)
      .slice(-10); // Last 10 sessions
    
    if (engagementScores.length < 3) return 'stable';
    
    // Simple linear regression to determine trend
    const trend = ss.linearRegressionLine(ss.linearRegression(
      engagementScores.map((score, index) => [index, score])
    ));
    
    const slope = trend(engagementScores.length - 1) - trend(0);
    
    if (slope > 0.1) return 'increasing';
    if (slope < -0.1) return 'decreasing';
    return 'stable';
  }

  private predictNextValue(values: number[]): number {
    if (values.length === 0) return 0.5;
    if (values.length === 1) return values[0];
    
    // Simple moving average prediction
    const recentValues = values.slice(-3);
    return ss.mean(recentValues);
  }

  private estimateConceptMasteryTime(patterns: LearningPattern): number {
    const baseTime = 30; // 30 minutes base time
    const velocityFactor = patterns.patterns.learningVelocity > 0 
      ? 1 / patterns.patterns.learningVelocity 
      : 1;
    
    return Math.max(15, baseTime * velocityFactor);
  }

  private calculateDropoutRisk(
    patterns: LearningPattern,
    recentSessions: LearningSession[],
    recentEmotions: EmotionData[],
  ): number {
    let risk = 0;
    
    // Low engagement increases risk
    if (patterns.patterns.engagementTrend === 'decreasing') risk += 0.3;
    
    // Emotional instability increases risk
    if (patterns.patterns.emotionalStability < 0.4) risk += 0.2;
    
    // Infrequent sessions increase risk
    if (recentSessions.length < 3) risk += 0.3;
    
    // Negative emotions increase risk
    const negativeEmotions = recentEmotions.filter(e => 
      [EmotionType.FRUSTRATED, EmotionType.BORED].includes(e.emotion)
    );
    if (negativeEmotions.length > recentEmotions.length * 0.5) risk += 0.2;
    
    return Math.min(1, risk);
  }

  private calculateOptimalBreakTime(patterns: LearningPattern): number {
    const baseBreakTime = 15; // 15 minutes
    const sessionDuration = patterns.patterns.averageSessionDuration;
    
    // Longer sessions need longer breaks
    if (sessionDuration > 90) return 20;
    if (sessionDuration > 60) return 15;
    return 10;
  }

  private recommendDifficulty(
    patterns: LearningPattern,
    recentSessions: LearningSession[],
  ): 'beginner' | 'intermediate' | 'advanced' {
    const currentPreference = patterns.patterns.difficultyPreference;
    const engagementTrend = patterns.patterns.engagementTrend;
    const learningVelocity = patterns.patterns.learningVelocity;
    
    // If doing well, suggest harder content
    if (engagementTrend === 'increasing' && learningVelocity > 1.5) {
      if (currentPreference === 'easy') return 'intermediate';
      if (currentPreference === 'medium') return 'advanced';
    }
    
    // If struggling, suggest easier content
    if (engagementTrend === 'decreasing' && learningVelocity < 0.5) {
      if (currentPreference === 'hard') return 'intermediate';
      if (currentPreference === 'medium') return 'beginner';
    }
    
    return currentPreference as 'beginner' | 'intermediate' | 'advanced';
  }

  private calculatePredictionConfidence(sessionCount: number, patterns: LearningPattern): number {
    let confidence = 0.5; // Base confidence
    
    // More sessions = higher confidence
    confidence += Math.min(0.3, sessionCount * 0.02);
    
    // Stable patterns = higher confidence
    if (patterns.patterns.emotionalStability > 0.7) confidence += 0.1;
    if (patterns.patterns.engagementTrend === 'stable') confidence += 0.1;
    
    return Math.min(1, confidence);
  }

  private groupSessionsByDay(sessions: LearningSession[]): Array<{ date: Date; sessions: LearningSession[] }> {
    const grouped = sessions.reduce((acc, session) => {
      const date = new Date(session.startedAt).toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(session);
      return acc;
    }, {} as Record<string, LearningSession[]>);
    
    return Object.entries(grouped).map(([dateStr, sessions]) => ({
      date: new Date(dateStr),
      sessions,
    }));
  }

  private calculateSubjectEngagement(sessions: LearningSession[]): { [subject: string]: number } {
    return this.calculateSubjectPerformance(sessions);
  }

  private groupEmotionsByDay(emotions: EmotionData[]): Array<{ date: Date; emotions: EmotionData[] }> {
    const grouped = emotions.reduce((acc, emotion) => {
      const date = new Date(emotion.timestamp).toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(emotion);
      return acc;
    }, {} as Record<string, EmotionData[]>);
    
    return Object.entries(grouped).map(([dateStr, emotions]) => ({
      date: new Date(dateStr),
      emotions,
    }));
  }

  private countEmotionsByType(emotions: EmotionData[]): Record<EmotionType, number> {
    const counts = {
      [EmotionType.NEUTRAL]: 0,
      [EmotionType.HAPPY]: 0,
      [EmotionType.CONFUSED]: 0,
      [EmotionType.FRUSTRATED]: 0,
      [EmotionType.ENGAGED]: 0,
      [EmotionType.BORED]: 0,
      [EmotionType.EXCITED]: 0,
    };

    emotions.forEach(emotion => {
      counts[emotion.emotion]++;
    });

    return counts;
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Check if analytics calculations are working
      const testMetrics = this.calculateMetrics([], [], []);
      return testMetrics !== null;
    } catch (error) {
      this.logger.error('Analytics service health check failed:', error);
      return false;
    }
  }
}
