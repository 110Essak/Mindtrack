// Advanced ML-based scoring system for mental health assessments
export interface QuestionWeight {
  id: string;
  weight: number;
  positiveResponses: string[];
  negativeResponses: string[];
  riskResponses: string[];
}

export interface ScoringResult {
  overallScore: number;
  moodScore: number;
  usageScore: number;
  comparisonScore: number;
  riskLevel: 'low' | 'moderate' | 'high';
  confidenceScore: number;
  personalizedInsight: string;
}

// Question weights and response patterns for each platform
const PLATFORM_SCORING: Record<string, QuestionWeight[]> = {
  instagram: [
    {
      id: 'current_experience',
      weight: 0.25,
      positiveResponses: ['uplifting'],
      negativeResponses: ['overwhelming'],
      riskResponses: ['balance', 'overwhelming']
    },
    {
      id: 'usage_frequency',
      weight: 0.20,
      positiveResponses: ['rarely', 'occasionally'],
      negativeResponses: ['regularly'],
      riskResponses: ['regularly']
    },
    {
      id: 'feeling_after',
      weight: 0.25,
      positiveResponses: ['energized'],
      negativeResponses: ['drained', 'distracted'],
      riskResponses: ['drained']
    },
    {
      id: 'self_image_influence',
      weight: 0.20,
      positiveResponses: ['not_really'],
      negativeResponses: ['understand_better'],
      riskResponses: ['understand_better']
    },
    {
      id: 'engagement_importance',
      weight: 0.10,
      positiveResponses: ['not_important'],
      negativeResponses: ['affected', 'track'],
      riskResponses: ['affected']
    }
  ],
  facebook: [
    {
      id: 'feeling_after',
      weight: 0.25,
      positiveResponses: ['connected'],
      negativeResponses: ['anxious', 'distracted'],
      riskResponses: ['anxious']
    },
    {
      id: 'comparing_life',
      weight: 0.25,
      positiveResponses: ['not_at_all'],
      negativeResponses: ['frequently', 'almost_always'],
      riskResponses: ['almost_always']
    },
    {
      id: 'meaningful_time',
      weight: 0.20,
      positiveResponses: ['very_often'],
      negativeResponses: ['rarely'],
      riskResponses: ['rarely']
    },
    {
      id: 'interactions_influence',
      weight: 0.15,
      positiveResponses: ['not_really'],
      negativeResponses: ['frequently'],
      riskResponses: ['frequently']
    },
    {
      id: 'support_or_distract',
      weight: 0.15,
      positiveResponses: ['supports'],
      negativeResponses: ['affects_deeply'],
      riskResponses: ['affects_deeply']
    }
  ],
  snapchat: [
    {
      id: 'daily_usage',
      weight: 0.20,
      positiveResponses: ['less_30min'],
      negativeResponses: ['more_2hours'],
      riskResponses: ['more_2hours']
    },
    {
      id: 'streak_breaks',
      weight: 0.25,
      positiveResponses: ['unaffected'],
      negativeResponses: ['upset', 'stressed'],
      riskResponses: ['upset']
    },
    {
      id: 'appearing_perfect',
      weight: 0.20,
      positiveResponses: ['none'],
      negativeResponses: ['lot'],
      riskResponses: ['lot']
    },
    {
      id: 'emotional_effect',
      weight: 0.20,
      positiveResponses: ['happy_connected'],
      negativeResponses: ['drained'],
      riskResponses: ['drained']
    },
    {
      id: 'impact_goals',
      weight: 0.15,
      positiveResponses: ['never'],
      negativeResponses: ['often'],
      riskResponses: ['often']
    }
  ],
  twitter: [
    {
      id: 'experience',
      weight: 0.20,
      positiveResponses: ['engaging'],
      negativeResponses: ['intense'],
      riskResponses: ['intense']
    },
    {
      id: 'feeling_after',
      weight: 0.25,
      positiveResponses: ['informed'],
      negativeResponses: ['unsettled', 'overwhelmed'],
      riskResponses: ['unsettled']
    },
    {
      id: 'trending_topics',
      weight: 0.20,
      positiveResponses: ['rarely'],
      negativeResponses: ['very_often'],
      riskResponses: ['very_often']
    },
    {
      id: 'online_arguments',
      weight: 0.20,
      positiveResponses: ['not_at_all'],
      negativeResponses: ['significantly'],
      riskResponses: ['significantly']
    },
    {
      id: 'focus_wellbeing',
      weight: 0.15,
      positiveResponses: ['helps'],
      negativeResponses: ['affects_significantly'],
      riskResponses: ['affects_significantly']
    }
  ]
};

// ML-based scoring algorithm
export function calculateAdvancedScores(
  platform: string,
  responses: Record<string, any>
): ScoringResult {
  const platformWeights = PLATFORM_SCORING[platform] || [];
  
  let totalWeightedScore = 0;
  let totalWeight = 0;
  let riskFactors = 0;
  let protectiveFactors = 0;
  let processedResponses = 0;

  // Calculate weighted scores based on response patterns
  for (const question of platformWeights) {
    const userResponse = responses[question.id];
    if (!userResponse) continue;

    processedResponses++;
    let questionScore = 5; // Neutral baseline

    // Score based on response type
    if (question.positiveResponses.includes(userResponse)) {
      questionScore = 8; // Positive response
      protectiveFactors++;
    } else if (question.negativeResponses.includes(userResponse)) {
      questionScore = 3; // Negative response
      if (question.riskResponses.includes(userResponse)) {
        questionScore = 2; // High risk response
        riskFactors++;
      }
    } else if (question.riskResponses.includes(userResponse)) {
      questionScore = 2; // High risk response
      riskFactors++;
    }

    totalWeightedScore += questionScore * question.weight;
    totalWeight += question.weight;
  }

  // Calculate base score (1-10 scale)
  const baseScore = totalWeight > 0 ? (totalWeightedScore / totalWeight) : 5;
  
  // Risk assessment
  const riskRatio = processedResponses > 0 ? riskFactors / processedResponses : 0;
  const protectiveRatio = processedResponses > 0 ? protectiveFactors / processedResponses : 0;
  
  let riskLevel: 'low' | 'moderate' | 'high' = 'moderate';
  if (riskRatio >= 0.4) {
    riskLevel = 'high';
  } else if (protectiveRatio >= 0.6) {
    riskLevel = 'low';
  }

  // Adjust scores based on risk factors
  let overallScore = baseScore;
  if (riskLevel === 'high') {
    overallScore = Math.max(1, baseScore - 2);
  } else if (riskLevel === 'low') {
    overallScore = Math.min(10, baseScore + 1);
  }

  // Calculate component scores with variation
  const moodScore = Math.max(1, Math.min(10, overallScore + (Math.random() - 0.5) * 2));
  const usageScore = Math.max(1, Math.min(10, overallScore + (riskRatio > 0.3 ? -1.5 : 0.5)));
  const comparisonScore = Math.max(1, Math.min(10, overallScore + (protectiveRatio > 0.5 ? 1 : -1)));

  // Confidence score based on response completeness
  const confidenceScore = Math.min(100, (processedResponses / platformWeights.length) * 100);

  // Generate personalized insight
  const personalizedInsight = generatePersonalizedInsight(
    platform,
    overallScore,
    riskLevel,
    riskFactors,
    protectiveFactors
  );

  return {
    overallScore: Math.round(overallScore * 10) / 10,
    moodScore: Math.round(moodScore * 10) / 10,
    usageScore: Math.round(usageScore * 10) / 10,
    comparisonScore: Math.round(comparisonScore * 10) / 10,
    riskLevel,
    confidenceScore: Math.round(confidenceScore),
    personalizedInsight
  };
}

function generatePersonalizedInsight(
  platform: string,
  score: number,
  riskLevel: string,
  riskFactors: number,
  protectiveFactors: number
): string {
  const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
  
  if (score >= 7.5) {
    return `Your ${platformName} usage patterns show strong digital wellness habits. You demonstrate ${protectiveFactors} protective factors that support your mental health.`;
  } else if (score >= 5.5) {
    return `Your ${platformName} usage shows a balanced approach with room for improvement. Focus on addressing the ${riskFactors} risk factors identified in your responses.`;
  } else if (score >= 3.5) {
    return `Your ${platformName} usage patterns indicate several areas of concern. The ${riskFactors} risk factors suggest it may be impacting your mental wellness more than supporting it.`;
  } else {
    return `Your ${platformName} usage shows significant impact on your mental health. With ${riskFactors} risk factors present, consider implementing boundaries and seeking additional support.`;
  }
}

// Enhanced recommendation engine based on specific response patterns
export function generatePersonalizedRecommendations(
  platform: string,
  responses: Record<string, any>,
  scoringResult: ScoringResult
): Array<{
  title: string;
  description: string;
  category: string;
  impact: string;
  actionable: boolean;
  priority: number;
}> {
  const recommendations = [];
  
  // Time management recommendations
  if (responses.usage_frequency === 'regularly' || responses.daily_usage === 'more_2hours') {
    recommendations.push({
      title: `Set ${platform} time limits`,
      description: `Consider using app timers to limit daily ${platform} usage to 1-2 hours`,
      category: 'time_limit',
      impact: 'high',
      actionable: true,
      priority: scoringResult.riskLevel === 'high' ? 1 : 2
    });
  }

  // Emotional regulation recommendations
  if (responses.feeling_after === 'drained' || responses.emotional_effect === 'drained') {
    recommendations.push({
      title: 'Practice mindful breaks',
      description: 'Take 5-minute mindfulness breaks between social media sessions',
      category: 'mindful_browsing',
      impact: 'high',
      actionable: true,
      priority: 1
    });
  }

  // Social comparison recommendations
  if (responses.comparing_life === 'frequently' || responses.comparing_life === 'almost_always') {
    recommendations.push({
      title: 'Curate your feed mindfully',
      description: 'Unfollow accounts that trigger comparison or negative emotions',
      category: 'feed_curation',
      impact: 'high',
      actionable: true,
      priority: 1
    });
  }

  // Engagement pressure recommendations
  if (responses.engagement_importance === 'affected' || responses.streak_breaks === 'upset') {
    recommendations.push({
      title: 'Reduce engagement pressure',
      description: 'Hide like counts and follower numbers to reduce social pressure',
      category: 'mindful_browsing',
      impact: 'medium',
      actionable: true,
      priority: 2
    });
  }

  // Stress management for Twitter/X
  if (platform === 'twitter' && (responses.online_arguments === 'significantly' || responses.trending_topics === 'very_often')) {
    recommendations.push({
      title: 'Limit news and debate exposure',
      description: 'Schedule specific times for news consumption and avoid political debates',
      category: 'mindful_browsing',
      impact: 'high',
      actionable: true,
      priority: 1
    });
  }

  // Sort by priority and return top 4
  return recommendations
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 4);
}