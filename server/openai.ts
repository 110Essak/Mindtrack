import OpenAI from "openai";
import { calculateAdvancedScores, generatePersonalizedRecommendations } from "./scoring";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface AssessmentAnalysis {
  overallScore: number;
  moodScore: number;
  usageScore: number;
  comparisonScore: number;
  keyInsight: string;
  recommendations: RecommendationItem[];
  riskLevel: 'low' | 'moderate' | 'high';
  confidenceScore?: number;
}

export interface RecommendationItem {
  title: string;
  description: string;
  category: 'time_limit' | 'mindful_browsing' | 'feed_curation' | 'gratitude' | 'skill_building';
  impact: 'low' | 'medium' | 'high';
  actionable: boolean;
}

export async function analyzeAssessmentResponses(
  platform: string,
  responses: Record<string, any>
): Promise<AssessmentAnalysis> {
  // Always use our advanced ML-based scoring system first
  const mlScoring = calculateAdvancedScores(platform, responses);
  const mlRecommendations = generatePersonalizedRecommendations(platform, responses, mlScoring);
  
  try {
    // Enhance with AI-generated insights if available
    const prompt = `
      You are a mental health expert analyzing social media usage patterns. 
      I have already calculated precise scores using advanced algorithms:
      
      Platform: ${platform}
      Overall Score: ${mlScoring.overallScore}/10
      Risk Level: ${mlScoring.riskLevel}
      Assessment responses: ${JSON.stringify(responses)}
      
      Based on these specific scores and responses, provide a single, personalized key insight (2-3 sentences) 
      that explains the main finding about their ${platform} usage patterns and mental health impact.
      
      Focus on:
      - Specific patterns in their responses
      - How ${platform} uniquely affects them
      - The most important area for improvement
      
      Return JSON with only: { "keyInsight": "your insight here" }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a licensed mental health professional specializing in digital wellness and social media impact analysis. Provide concise, personalized insights."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      overallScore: mlScoring.overallScore,
      moodScore: mlScoring.moodScore,
      usageScore: mlScoring.usageScore,
      comparisonScore: mlScoring.comparisonScore,
      keyInsight: result.keyInsight || mlScoring.personalizedInsight,
      recommendations: mlRecommendations.map(rec => ({
        title: rec.title,
        description: rec.description,
        category: rec.category as any,
        impact: rec.impact as any,
        actionable: rec.actionable
      })),
      riskLevel: mlScoring.riskLevel,
      confidenceScore: mlScoring.confidenceScore
    };
  } catch (error) {
    console.error("Error enhancing with AI insights:", error);
    
    // Use ML scoring with fallback insight
    return {
      overallScore: mlScoring.overallScore,
      moodScore: mlScoring.moodScore,
      usageScore: mlScoring.usageScore,
      comparisonScore: mlScoring.comparisonScore,
      keyInsight: mlScoring.personalizedInsight,
      recommendations: mlRecommendations.map(rec => ({
        title: rec.title,
        description: rec.description,
        category: rec.category as any,
        impact: rec.impact as any,
        actionable: rec.actionable
      })),
      riskLevel: mlScoring.riskLevel,
      confidenceScore: mlScoring.confidenceScore
    };
  }
}

// Fallback analysis when OpenAI is unavailable
function generateFallbackAnalysis(platform: string, responses: Record<string, any>): AssessmentAnalysis {
  // Calculate basic scores based on response patterns
  const responseValues = Object.values(responses).filter(Boolean);
  const riskIndicators = responseValues.filter((response: any) => 
    typeof response === 'string' && (
      response.includes('overwhelming') || 
      response.includes('drained') || 
      response.includes('anxious') || 
      response.includes('affected') ||
      response.includes('significantly') ||
      response.includes('deeply')
    )
  ).length;

  const positiveIndicators = responseValues.filter((response: any) => 
    typeof response === 'string' && (
      response.includes('positive') || 
      response.includes('energized') || 
      response.includes('supports') || 
      response.includes('connected') ||
      response.includes('helpful') ||
      response.includes('inspiring')
    )
  ).length;

  const totalResponses = responseValues.length;
  const riskRatio = riskIndicators / Math.max(totalResponses, 1);
  const positiveRatio = positiveIndicators / Math.max(totalResponses, 1);

  let riskLevel: 'low' | 'moderate' | 'high' = 'moderate';
  let overallScore = 6;
  
  if (riskRatio > 0.4) {
    riskLevel = 'high';
    overallScore = 4;
  } else if (positiveRatio > 0.4) {
    riskLevel = 'low';
    overallScore = 8;
  }

  const defaultRecommendations: RecommendationItem[] = [
    {
      title: `Set ${platform} time limits`,
      description: `Consider using app timers to limit daily ${platform} usage`,
      category: 'time_limit',
      impact: 'high',
      actionable: true
    },
    {
      title: 'Practice mindful browsing',
      description: 'Take breaks between scrolling sessions to check in with yourself',
      category: 'mindful_browsing',
      impact: 'medium',
      actionable: true
    },
    {
      title: 'Curate your feed',
      description: 'Unfollow accounts that make you feel negative emotions',
      category: 'feed_curation',
      impact: 'high',
      actionable: true
    }
  ];

  return {
    overallScore,
    moodScore: Math.max(3, overallScore - 1),
    usageScore: Math.max(3, overallScore - 2),
    comparisonScore: riskLevel === 'high' ? 4 : 6,
    keyInsight: `Your ${platform} usage shows ${riskLevel} risk patterns. Focus on ${riskLevel === 'high' ? 'reducing time and managing triggers' : 'maintaining healthy boundaries'}.`,
    recommendations: defaultRecommendations,
    riskLevel
  };
}

export async function generateChatbotResponse(
  userMessage: string,
  chatHistory: Array<{ message: string; isBot: boolean }> = []
): Promise<string> {
  try {
    const recentHistory = chatHistory.slice(-10).map(msg => ({
      role: msg.isBot ? "assistant" as const : "user" as const,
      content: msg.message
    }));

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are MindTrack AI, a compassionate mental health companion specializing in social media wellness. 
          
          Guidelines:
          - Provide supportive, empathetic responses
          - Focus on digital wellness and healthy social media habits
          - Offer practical, actionable advice
          - Be encouraging and non-judgmental
          - Keep responses concise (50-150 words)
          - If someone is in crisis, recommend professional help
          - Use warm, friendly language
          - Reference MindTrack features when appropriate (assessments, insights, progress tracking)`
        },
        ...recentHistory,
        {
          role: "user",
          content: userMessage
        }
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    return response.choices[0].message.content || "I'm here to help with your digital wellness journey. How can I support you today?";
  } catch (error) {
    console.error("Error generating chatbot response:", error);
    return "I'm experiencing some technical difficulties right now. Please try again in a moment, or consider reaching out to a mental health professional if you need immediate support.";
  }
}

export async function generatePersonalizedInsights(
  userProgress: Array<{ date: Date; overallWellness: number; screenTime: number; moodScore: number }>,
  recentAssessments: Array<{ platform: string; overallScore: number; createdAt: Date }>
): Promise<{ insight: string; trend: 'improving' | 'stable' | 'declining' }> {
  try {
    const prompt = `
      Analyze this user's mental health and social media usage trends to provide a personalized insight.
      
      Progress data: ${JSON.stringify(userProgress)}
      Recent assessments: ${JSON.stringify(recentAssessments)}
      
      Provide analysis in JSON format:
      - insight: string (2-3 sentences about their progress and patterns)
      - trend: "improving", "stable", or "declining"
      
      Focus on positive reinforcement and actionable observations.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.4,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      insight: result.insight || "Your digital wellness journey is unique. Keep focusing on the strategies that work best for you.",
      trend: result.trend || 'stable'
    };
  } catch (error) {
    console.error("Error generating insights:", error);
    return {
      insight: "Continue monitoring your digital wellness patterns. Small, consistent changes can lead to meaningful improvements.",
      trend: 'stable'
    };
  }
}
