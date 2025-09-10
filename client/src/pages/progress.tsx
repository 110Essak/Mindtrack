import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/Navigation";
import FloatingChatbot from "@/components/FloatingChatbot";
import ProgressChart from "@/components/ProgressChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Link } from "wouter";

export default function Progress() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  const { data: progressData, isLoading: isProgressLoading, error: progressError } = useQuery({
    queryKey: ["/api/progress"],
    enabled: isAuthenticated,
  });

  const { data: assessments } = useQuery({
    queryKey: ["/api/assessments"],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (progressError && isUnauthorizedError(progressError as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [progressError, toast]);

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

  if (isLoading || isProgressLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-teal-500 rounded-lg animate-pulse mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your progress data...</p>
        </div>
      </div>
    );
  }

  const progress = Array.isArray(progressData) ? progressData : [];
  const platformAssessments = Array.isArray(assessments) ? assessments : [];

  // Group assessments by platform
  const assessmentsByPlatform = platformAssessments.reduce((acc: any, assessment: any) => {
    if (!acc[assessment.platform]) {
      acc[assessment.platform] = [];
    }
    acc[assessment.platform].push(assessment);
    return acc;
  }, {});

  // Calculate trend
  const getTrend = (data: any[]) => {
    if (data.length < 2) return 'stable';
    const recent = data.slice(0, 3);
    const older = data.slice(-3);
    const recentAvg = recent.reduce((sum, item) => sum + parseFloat(item.overallWellness || 0), 0) / recent.length;
    const olderAvg = older.reduce((sum, item) => sum + parseFloat(item.overallWellness || 0), 0) / older.length;
    
    if (recentAvg > olderAvg + 0.5) return 'improving';
    if (recentAvg < olderAvg - 0.5) return 'declining';
    return 'stable';
  };

  const trend = getTrend(progress);

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
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Progress Tracking</h1>
            <p className="text-xl text-slate-600">Monitor your mental wellness journey over time</p>
          </motion.div>

          {progress.length === 0 ? (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">No Progress Data Yet</h2>
              <p className="text-slate-600 mb-8 max-w-md mx-auto">
                Complete assessments and track your daily wellness to see your progress over time.
              </p>
              <Link href="/assessment">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Take Your First Assessment
                </Button>
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-8">
              {/* Progress Overview */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="grid md:grid-cols-3 gap-6 mb-8"
              >
                {/* Current Wellness Score */}
                <Card className="shadow-lg border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">Current Wellness</h3>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        trend === 'improving' ? 'bg-green-100' :
                        trend === 'declining' ? 'bg-red-100' :
                        'bg-blue-100'
                      }`}>
                        <svg className={`w-4 h-4 ${
                          trend === 'improving' ? 'text-green-600' :
                          trend === 'declining' ? 'text-red-600' :
                          'text-blue-600'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {trend === 'improving' ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          ) : trend === 'declining' ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                          )}
                        </svg>
                      </div>
                    </div>
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold text-slate-900">
                        {progress[0]?.overallWellness || '0'}
                      </span>
                      <span className="text-lg text-slate-500">/10</span>
                      <span className={`ml-2 text-sm font-medium ${
                        trend === 'improving' ? 'text-green-600' :
                        trend === 'declining' ? 'text-red-600' :
                        'text-blue-600'
                      }`}>
                        {trend === 'improving' ? '↗ Improving' :
                         trend === 'declining' ? '↘ Needs attention' :
                         '→ Stable'}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Total Assessments */}
                <Card className="shadow-lg border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">Total Assessments</h3>
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold text-slate-900">{platformAssessments.length}</span>
                      <span className="ml-2 text-sm text-purple-600 font-medium">Completed</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Progress Days */}
                <Card className="shadow-lg border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">Tracking Days</h3>
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold text-slate-900">{progress.length}</span>
                      <span className="ml-2 text-sm text-orange-600 font-medium">Days tracked</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Main Progress Chart */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <ProgressChart
                  data={progress.map((item: any) => ({
                    date: item.date,
                    overallWellness: parseFloat(item.overallWellness) || 0,
                    moodScore: parseFloat(item.moodScore) || 0,
                    usageScore: parseFloat(item.usageScore) || 0
                  }))}
                />
              </motion.div>

              {/* Platform-Specific Progress */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <h3 className="text-2xl font-semibold text-slate-900 mb-6">Platform Assessment History</h3>
                <div className="grid lg:grid-cols-2 gap-8">
                  {Object.entries(assessmentsByPlatform).map(([platform, assessments]: [string, any]) => (
                    <Card key={platform} className="shadow-lg border-0">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            platform === 'instagram' ? 'bg-gradient-to-r from-pink-500 to-purple-600' :
                            platform === 'facebook' ? 'bg-blue-600' :
                            platform === 'snapchat' ? 'bg-yellow-400' :
                            'bg-sky-500'
                          }`}>
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                              {platform === 'instagram' && (
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                              )}
                              {platform === 'facebook' && (
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                              )}
                            </svg>
                          </div>
                          <span className="capitalize">{platform}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {assessments.slice(0, 5).map((assessment: any, index: number) => (
                            <div key={assessment.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                              <div>
                                <div className="text-sm font-medium text-slate-900">
                                  Overall Score: {assessment.overallScore}/10
                                </div>
                                <div className="text-xs text-slate-500">
                                  {new Date(assessment.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className={`text-xs font-medium ${
                                  parseFloat(assessment.overallScore) >= 8 ? 'text-green-600' :
                                  parseFloat(assessment.overallScore) >= 6 ? 'text-yellow-600' :
                                  'text-red-600'
                                }`}>
                                  {parseFloat(assessment.overallScore) >= 8 ? 'Excellent' :
                                   parseFloat(assessment.overallScore) >= 6 ? 'Good' :
                                   'Needs Attention'}
                                </div>
                              </div>
                            </div>
                          ))}
                          {assessments.length === 0 && (
                            <div className="text-center py-4 text-slate-500">
                              <p className="text-sm">No assessments for {platform} yet</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>

              {/* Insights Summary */}
              {progress.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-teal-50">
                    <CardContent className="p-8">
                      <div className="text-center">
                        <h3 className="text-xl font-semibold text-slate-900 mb-4">
                          Your Progress Journey
                        </h3>
                        <p className="text-slate-600 max-w-2xl mx-auto mb-6">
                          {trend === 'improving' 
                            ? "Great work! Your wellness scores show consistent improvement. Keep following your personalized recommendations."
                            : trend === 'declining'
                            ? "Your recent scores suggest some areas need attention. Consider reviewing your insights and adjusting your social media habits."
                            : "You're maintaining stable wellness levels. Continue with your current strategies and consider new challenges to improve further."
                          }
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                          <Link href="/insights">
                            <Button className="bg-blue-600 hover:bg-blue-700">
                              View Latest Insights
                            </Button>
                          </Link>
                          <Link href="/assessment">
                            <Button variant="outline">
                              Take New Assessment
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </section>

      <FloatingChatbot />
    </div>
  );
}
