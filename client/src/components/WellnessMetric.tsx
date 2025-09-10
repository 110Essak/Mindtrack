import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

interface WellnessMetricProps {
  title: string;
  value: number;
  maxValue: number;
  color: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
}

export default function WellnessMetric({ 
  title, 
  value, 
  maxValue, 
  color, 
  icon, 
  trend = 'stable' 
}: WellnessMetricProps) {
  const percentage = (value / maxValue) * 100;
  
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-slate-600';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return '↗';
      case 'down': return '↘';
      default: return '→';
    }
  };

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
              {icon}
            </div>
            <CardTitle className="text-sm text-slate-600">{title}</CardTitle>
          </div>
          <span className={`text-xs font-medium ${getTrendColor()}`}>
            {getTrendIcon()}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-slate-900">
              {typeof value === 'number' ? value.toFixed(1) : '0.0'}
            </span>
            <span className="text-sm text-slate-500">
              /{maxValue}
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-slate-200 rounded-full h-2">
            <motion.div
              className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-teal-500"
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}