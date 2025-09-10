import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/Navigation";
import FloatingChatbot from "@/components/FloatingChatbot";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Link } from "wouter";

export default function Insights() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  const { data: insights, isLoading: isInsightsLoading, error: insightsError } = useQuery({
    queryKey: ["/api/insights"],
    enabled: isAuthenticated,
  });

  const { data: latestInsight } = useQuery({
    queryKey: ["/api/insights/latest"],
    enabled: isAuthenticated,
  });

  const { data: goals } = useQuery({
    queryKey: ["/api/goals"],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (insightsError && isUnauthorizedError(insightsError as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [insightsError, toast]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading || isInsightsLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-teal-500 rounded-lg animate-pulse mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your insights...</p>
        </div>
      </div>
    );
  }

  const allGoals = Array.isArray(goals) ? goals : [];
  const activeGoals = allGoals.filter((goal: any) => !goal.isCompleted);
  const completedGoals = allGoals.filter((goal: any) => goal.isCompleted);
  const allInsights = Array.isArray(insights) ? insights : [];

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'time_limit':
        return (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'mindful_browsing':
        return (
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        );
      case 'feed_curation':
        return (
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'gratitude':
        return (
          <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Your Personalized Insights</h1>
            <p className="text-xl text-slate-600">AI-powered recommendations based on your assessment results</p>
          </motion.div>

          {allInsights.length === 0 ? (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">No Insights Yet</h2>
              <p className="text-slate-600 mb-8 max-w-md mx-auto">
                Take your first assessment to receive personalized insights and recommendations for healthier social media habits.
              </p>
              <Link href="/assessment">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Take Assessment
                </Button>
              </Link>
            </motion.div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Insights Panel */}
              <div className="lg:col-span-2 space-y-8">
                {/* Latest Key Insight */}
                {latestInsight && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Card className="shadow-lg border-0">
                      <CardContent className="p-8">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                              <h3 className="text-xl font-semibold text-slate-900">Latest Key Insight</h3>
                              <Badge className={getRiskLevelColor((latestInsight as any)?.riskLevel)}>
                                {(latestInsight as any)?.riskLevel} risk
                              </Badge>
                            </div>
                            <p className="text-slate-600 leading-relaxed">
                              {(latestInsight as any)?.keyInsight}
                            </p>
                            <p className="text-sm text-slate-500 mt-2">
                              {new Date((latestInsight as any)?.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Recommendations Grid */}
                {(latestInsight as any)?.recommendations && Array.isArray((latestInsight as any)?.recommendations) && (latestInsight as any).recommendations.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <h3 className="text-xl font-semibold text-slate-900 mb-6">Recommended Actions</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      {(latestInsight as any).recommendations.map((rec: any, index: number) => (
                        <Card key={index} className="shadow-md border-0 hover:shadow-lg transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-start space-x-3 mb-4">
                              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                                {getCategoryIcon(rec.category)}
                              </div>
                              <div className="flex-1">
                                <h4 className="text-lg font-semibold text-slate-900 mb-1">{rec.title}</h4>
                                <Badge variant="outline" className="text-xs">
                                  {rec.impact} impact
                                </Badge>
                              </div>
                            </div>
                            <p className="text-slate-600 text-sm mb-4">{rec.description}</p>
                            <div className="flex items-center justify-between">
                              <span className={`text-xs font-medium ${
                                rec.impact === 'high' ? 'text-green-600' :
                                rec.impact === 'medium' ? 'text-blue-600' :
                                'text-purple-600'
                              }`}>
                                {rec.category.replace('_', ' ')}
                              </span>
                              <Button variant="outline" size="sm">
                                {rec.actionable ? 'Start' : 'Learn More'}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* All Insights History */}
                {allInsights.length > 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    <h3 className="text-xl font-semibold text-slate-900 mb-6">Insights History</h3>
                    <div className="space-y-4">
                      {allInsights.slice(1).map((insight: any) => (
                        <Card key={insight.id} className="shadow-sm border border-slate-200">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-2">
                              <Badge className={getRiskLevelColor(insight.riskLevel)}>
                                {insight.riskLevel} risk
                              </Badge>
                              <span className="text-sm text-slate-500">
                                {new Date(insight.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-slate-700">{insight.keyInsight}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-8">
                {/* Weekly Challenge Card */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <Card className="bg-gradient-to-br from-blue-500 to-teal-500 border-0 text-white">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-3">This Week's Challenge</h3>
                      <p className="text-blue-100 text-sm mb-4">
                        Take a 24-hour break from your most-used social platform and notice how you feel.
                      </p>
                      <Button className="bg-white/20 hover:bg-white/30 text-white border-0">
                        Accept Challenge
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Progress Summary */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <Card className="shadow-lg border-0">
                    <CardHeader>
                      <CardTitle>Your Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Goals Completed</span>
                          <span className="text-sm font-semibold text-slate-900">
                            {completedGoals.length}/{allGoals.length || 0}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${allGoals.length ? (completedGoals.length / allGoals.length) * 100 : 0}%` 
                            }}
                          ></div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">
                            {allInsights.length > 0 ? 
                              `Started ${Math.ceil((Date.now() - new Date(allInsights[allInsights.length - 1].createdAt).getTime()) / (1000 * 60 * 60 * 24))} days ago` :
                              'No assessments yet'
                            }
                          </span>
                          <span className="text-blue-600 font-medium">
                            {completedGoals.length > 0 ? 'Keep going!' : 'Get started!'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Support Resources */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <Card className="shadow-lg border-0">
                    <CardHeader>
                      <CardTitle>Additional Support</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <button className="flex items-center w-full p-3 hover:bg-slate-50 rounded-lg transition-colors text-left">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">Chat with AI Support</p>
                            <p className="text-xs text-slate-500">24/7 available</p>
                          </div>
                        </button>
                        <Link href="/progress">
                          <button className="flex items-center w-full p-3 hover:bg-slate-50 rounded-lg transition-colors text-left">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900">Progress Tracking</p>
                              <p className="text-xs text-slate-500">View detailed charts</p>
                            </div>
                          </button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          )}
        </div>
      </section>

      <FloatingChatbot />
    </div>
  );
}
