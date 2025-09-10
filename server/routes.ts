import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { generateChatbotResponse } from "./chatbot";
import { analyzeAssessmentResponses, generatePersonalizedInsights } from "./openai";
import { insertAssessmentSchema, insertChatMessageSchema, insertUserGoalSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Assessment routes
  app.post('/api/assessments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const assessmentData = insertAssessmentSchema.parse({
        ...req.body,
        userId
      });

      // Analyze responses with AI
      const analysis = await analyzeAssessmentResponses(
        assessmentData.platform,
        assessmentData.responses as Record<string, any>
      );

      // Create assessment with AI-generated scores
      const assessment = await storage.createAssessment({
        ...assessmentData,
        overallScore: analysis.overallScore.toString(),
        moodScore: analysis.moodScore.toString(),
        usageScore: analysis.usageScore.toString(),
        comparisonScore: analysis.comparisonScore.toString(),
      });

      // Create insights
      const insight = await storage.createInsight({
        userId,
        assessmentId: assessment.id,
        keyInsight: analysis.keyInsight,
        recommendations: analysis.recommendations as any,
        riskLevel: analysis.riskLevel,
      });

      // Generate goals based on recommendations
      for (const rec of analysis.recommendations.slice(0, 3)) {
        await storage.createUserGoal({
          userId,
          title: rec.title,
          description: rec.description,
          category: rec.category,
          targetValue: rec.category === 'time_limit' ? '30' : '1', // 30 minutes or 1 completion
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        });
      }

      res.json({ assessment, insight });
    } catch (error) {
      console.error("Error creating assessment:", error);
      res.status(500).json({ message: "Failed to create assessment" });
    }
  });

  app.get('/api/assessments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const assessments = await storage.getUserAssessments(userId);
      res.json(assessments);
    } catch (error) {
      console.error("Error fetching assessments:", error);
      res.status(500).json({ message: "Failed to fetch assessments" });
    }
  });

  app.get('/api/assessments/latest/:platform?', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const platform = req.params.platform;
      const assessment = await storage.getLatestAssessment(userId, platform);
      res.json(assessment || null);
    } catch (error) {
      console.error("Error fetching latest assessment:", error);
      res.status(500).json({ message: "Failed to fetch latest assessment" });
    }
  });

  // Insights routes
  app.get('/api/insights', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const insights = await storage.getUserInsights(userId);
      res.json(insights);
    } catch (error) {
      console.error("Error fetching insights:", error);
      res.status(500).json({ message: "Failed to fetch insights" });
    }
  });

  app.get('/api/insights/latest', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const insight = await storage.getLatestInsight(userId);
      res.json(insight || null);
    } catch (error) {
      console.error("Error fetching latest insight:", error);
      res.status(500).json({ message: "Failed to fetch latest insight" });
    }
  });

  // Progress routes
  app.get('/api/progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const days = parseInt(req.query.days as string) || 7;
      const progress = await storage.getUserProgress(userId, days);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching progress:", error);
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  app.post('/api/progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { overallWellness, screenTime, moodScore, platformUsage } = req.body;
      
      const completedGoals = await storage.getCompletedGoalsCount(userId);
      
      const progressEntry = await storage.createProgressEntry({
        userId,
        date: new Date(),
        overallWellness: overallWellness.toString(),
        screenTime: screenTime.toString(),
        moodScore: moodScore.toString(),
        platformUsage,
        goalsCompleted: completedGoals,
        totalGoals: 5,
      });

      res.json(progressEntry);
    } catch (error) {
      console.error("Error creating progress entry:", error);
      res.status(500).json({ message: "Failed to create progress entry" });
    }
  });

  // Dashboard data route
  app.get('/api/dashboard', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Get latest progress
      const latestProgress = await storage.getLatestProgress(userId);
      
      // Get recent assessments
      const assessments = await storage.getUserAssessments(userId);
      const platformAssessments = assessments.reduce((acc, assessment) => {
        if (!acc[assessment.platform] || (assessment.createdAt && new Date(assessment.createdAt) > new Date(acc[assessment.platform].createdAt))) {
          acc[assessment.platform] = assessment;
        }
        return acc;
      }, {} as Record<string, any>);

      // Get progress trend (last 7 days)
      const progressHistory = await storage.getUserProgress(userId, 7);
      
      // Get active goals
      const goals = await storage.getUserGoals(userId);
      const activeGoals = goals.filter(goal => !goal.isCompleted).slice(0, 5);
      const completedGoalsCount = goals.filter(goal => goal.isCompleted).length;

      res.json({
        latestProgress,
        platformAssessments,
        progressHistory,
        activeGoals,
        completedGoalsCount,
        totalGoals: activeGoals.length + completedGoalsCount
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Chat routes
  app.get('/api/chat/history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 20;
      const history = await storage.getUserChatHistory(userId, limit);
      res.json(history.reverse()); // Return in chronological order
    } catch (error) {
      console.error("Error fetching chat history:", error);
      res.status(500).json({ message: "Failed to fetch chat history" });
    }
  });

  app.post('/api/chat', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { message } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ message: "Message is required" });
      }

      // Save user message
      const userMessage = await storage.createChatMessage({
        userId,
        message: message.trim(),
        isBot: false,
      });

      // Get recent chat history for context
      const chatHistory = await storage.getUserChatHistory(userId, 10);
      
      // Generate AI response
      const botResponse = await generateChatbotResponse(message, chatHistory);

      // Save bot response
      const botMessage = await storage.createChatMessage({
        userId,
        message: botResponse,
        isBot: true,
      });

      res.json({ response: botResponse });
    } catch (error) {
      console.error("Error processing chat message:", error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  // Goals routes
  app.get('/api/goals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const goals = await storage.getUserGoals(userId);
      res.json(goals);
    } catch (error) {
      console.error("Error fetching goals:", error);
      res.status(500).json({ message: "Failed to fetch goals" });
    }
  });

  app.post('/api/goals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const goalData = insertUserGoalSchema.parse({
        ...req.body,
        userId
      });

      const goal = await storage.createUserGoal(goalData);
      res.json(goal);
    } catch (error) {
      console.error("Error creating goal:", error);
      res.status(500).json({ message: "Failed to create goal" });
    }
  });

  app.patch('/api/goals/:goalId', isAuthenticated, async (req: any, res) => {
    try {
      const { goalId } = req.params;
      const { currentValue, completed } = req.body;

      const goal = await storage.updateGoalProgress(goalId, currentValue, completed);
      res.json(goal);
    } catch (error) {
      console.error("Error updating goal:", error);
      res.status(500).json({ message: "Failed to update goal" });
    }
  });

  // Generate personalized insights
  app.post('/api/insights/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const progressHistory = await storage.getUserProgress(userId, 30);
      const recentAssessments = await storage.getUserAssessments(userId);
      
      const personalizedInsight = await generatePersonalizedInsights(
        progressHistory.map(p => ({
          date: p.date ? new Date(p.date) : new Date(),
          overallWellness: parseFloat(p.overallWellness || '0'),
          screenTime: parseFloat(p.screenTime || '0'),
          moodScore: parseFloat(p.moodScore || '0'),
        })),
        recentAssessments.slice(0, 5).map(a => ({
          platform: a.platform,
          overallScore: parseFloat(a.overallScore || '0'),
          createdAt: a.createdAt ? new Date(a.createdAt) : new Date(),
        }))
      );

      res.json(personalizedInsight);
    } catch (error) {
      console.error("Error generating personalized insights:", error);
      res.status(500).json({ message: "Failed to generate insights" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
