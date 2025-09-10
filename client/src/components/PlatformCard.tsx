import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "wouter";

interface PlatformCardProps {
  platform: string;
  assessment: {
    id: string;
    overallScore: string;
    createdAt: string;
    riskLevel?: string;
  } | null;
  onRetake?: () => void;
}

export default function PlatformCard({ platform, assessment, onRetake }: PlatformCardProps) {
  const platformConfig = {
    instagram: {
      name: 'Instagram',
      color: 'from-pink-500 to-purple-600',
      icon: 'IG'
    },
    facebook: {
      name: 'Facebook',
      color: 'from-blue-600 to-blue-700',
      icon: 'FB'
    },
    snapchat: {
      name: 'Snapchat',
      color: 'from-yellow-400 to-yellow-500',
      icon: 'SC'
    },
    twitter: {
      name: 'Twitter/X',
      color: 'from-slate-600 to-slate-700',
      icon: 'X'
    }
  };

  const config = platformConfig[platform as keyof typeof platformConfig];
  if (!config) return null;

  const score = assessment ? parseFloat(assessment.overallScore) : 0;
  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-green-600';
    if (score >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 bg-gradient-to-r ${config.color} rounded-lg flex items-center justify-center`}>
                <span className="text-white font-bold text-sm">{config.icon}</span>
              </div>
              <CardTitle className="text-lg">{config.name}</CardTitle>
            </div>
            {assessment?.riskLevel && (
              <Badge className={getRiskLevelColor(assessment.riskLevel)}>
                {assessment.riskLevel}
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {assessment ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Wellness Score</span>
                <span className={`text-xl font-bold ${getScoreColor(score)}`}>
                  {score.toFixed(1)}/10
                </span>
              </div>
              
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-teal-500"
                  style={{ width: `${(score / 10) * 100}%` }}
                />
              </div>
              
              <p className="text-xs text-slate-500">
                Last assessment: {new Date(assessment.createdAt).toLocaleDateString()}
              </p>
              
              <div className="flex space-x-2">
                <Link href={`/assessment/${platform}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    Retake
                  </Button>
                </Link>
                <Link href="/insights" className="flex-1">
                  <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                    View Insights
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Complete your {config.name} assessment to get personalized insights
              </p>
              <Link href={`/assessment/${platform}`}>
                <Button className={`w-full bg-gradient-to-r ${config.color} hover:opacity-90`}>
                  Start Assessment
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}