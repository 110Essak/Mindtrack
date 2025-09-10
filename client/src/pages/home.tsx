import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/Navigation";
import FloatingChatbot from "@/components/FloatingChatbot";
import WellnessMetric from "@/components/WellnessMetric";
import ProgressChart from "@/components/ProgressChart";
import PlatformCard from "@/components/PlatformCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Link } from "wouter";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  const { data: dashboardData, isLoading: isDashboardLoading, error: dashboardError } = useQuery({
    queryKey: ["/api/dashboard"],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (dashboardError && isUnauthorizedError(dashboardError as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [dashboardError, toast]);

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

  if (isLoading || isDashboardLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-teal-500 rounded-lg animate-pulse mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your wellness dashboard...</p>
        </div>
      </div>
    );
  }

  const latestProgress = (dashboardData as any)?.latestProgress;
  const platformAssessments = (dashboardData as any)?.platformAssessments || {};
  const progressHistory = (dashboardData as any)?.progressHistory || [];
  const activeGoals = (dashboardData as any)?.activeGoals || [];
  const completedGoalsCount = (dashboardData as any)?.completedGoalsCount || 0;
  const totalGoals = (dashboardData as any)?.totalGoals || 5;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      {/* Welcome Section */}
      <section className="py-12 bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-3xl font-bold text-slate-900 mb-4">
              Welcome back to your wellness journey
            </h1>
            <p className="text-xl text-slate-600 mb-8">
              Track your progress and get personalized insights for healthier social media habits
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/assessment">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Take New Assessment
                </Button>
              </Link>
              <Link href="/insights">
                <Button variant="outline" size="lg">
                  View Insights
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Dashboard Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Wellness Dashboard</h2>
            <p className="text-slate-600">Track your mental health journey with personalized insights</p>
          </div>

          {/* Wellness Metrics Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <WellnessMetric
              title="Overall Wellness"
              value={latestProgress?.overallWellness ? parseFloat(latestProgress.overallWellness) : 8.2}
              maxValue={10}
              color="bg-green-100"
              icon={<span className="text-green-600">📈</span>}
              trend="up"
            />
            <WellnessMetric
              title="Daily Screen Time"
              value={latestProgress?.screenTime ? parseFloat(latestProgress.screenTime) : 3.2}
              maxValue={8}
              color="bg-blue-100"
              icon={<span className="text-blue-600">⏰</span>}
              trend="stable"
            />
            <WellnessMetric
              title="Mood Impact"
              value={latestProgress?.moodScore ? parseFloat(latestProgress.moodScore) : 7.8}
              maxValue={10}
              color="bg-yellow-100"
              icon={<span className="text-yellow-600">😊</span>}
              trend="stable"
            />
            <WellnessMetric
              title="Goals Progress"
              value={completedGoalsCount}
              maxValue={Math.max(totalGoals, 1)}
              color="bg-purple-100"
              icon={<span className="text-purple-600">🎯</span>}
              trend="up"
            />
          </div>

          {/* Progress Charts and Platform Usage */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            <ProgressChart 
              data={progressHistory.map((item: any) => ({
                date: item.date,
                overallWellness: parseFloat(item.overallWellness) || 0,
                moodScore: parseFloat(item.moodScore) || 0,
                usageScore: parseFloat(item.usageScore) || 0
              }))} 
            />
            
            {/* Platform Usage Breakdown */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Platform Usage This Week</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(platformAssessments).map(([platform, assessment]: [string, any]) => (
                    <div key={platform} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          platform === 'instagram' ? 'bg-pink-500' :
                          platform === 'facebook' ? 'bg-blue-600' :
                          platform === 'twitter' ? 'bg-sky-500' :
                          'bg-yellow-400'
                        }`}></div>
                        <span className="font-medium text-slate-700 capitalize">{platform}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-slate-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              platform === 'instagram' ? 'bg-pink-500' :
                              platform === 'facebook' ? 'bg-blue-600' :
                              platform === 'twitter' ? 'bg-sky-500' :
                              'bg-yellow-400'
                            }`}
                            style={{ width: `${Math.min((parseFloat(assessment?.overallScore || 0) / 10) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-slate-600 w-12 text-right">
                          {assessment?.overallScore || 'N/A'}
                        </span>
                      </div>
                    </div>
                  ))}
                  {Object.keys(platformAssessments).length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      <p>No assessments completed yet.</p>
                      <Link href="/assessment">
                        <Button className="mt-4">Take Your First Assessment</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Platform Cards */}
          <div className="mb-12">
            <h3 className="text-xl font-semibold text-slate-900 mb-6">Platform Assessments</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <PlatformCard
                platform="instagram"
                assessment={platformAssessments.instagram || null}
              />
              <PlatformCard
                platform="facebook"
                assessment={platformAssessments.facebook || null}
              />
              <PlatformCard
                platform="snapchat"
                assessment={platformAssessments.snapchat || null}
              />
              <PlatformCard
                platform="twitter"
                assessment={platformAssessments.twitter || null}
              />
            </div>
          </div>

          {/* Active Goals */}
          {activeGoals.length > 0 && (
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Your Active Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeGoals.slice(0, 3).map((goal: any) => (
                    <div key={goal.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-slate-900">{goal.title}</h4>
                        <p className="text-sm text-slate-600">{goal.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-slate-900">
                          {goal.currentValue || 0}/{goal.targetValue || 1}
                        </div>
                        <div className="w-16 bg-slate-200 rounded-full h-1 mt-1">
                          <div 
                            className="bg-blue-500 h-1 rounded-full"
                            style={{ 
                              width: `${Math.min(
                                ((parseFloat(goal.currentValue) || 0) / (parseFloat(goal.targetValue) || 1)) * 100, 
                                100
                              )}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <FloatingChatbot />
    </div>
  );
}
