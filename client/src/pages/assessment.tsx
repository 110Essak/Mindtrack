import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Navigation from "@/components/Navigation";
import AssessmentForm from "@/components/AssessmentForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export default function Assessment() {
  const { platform } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [selectedPlatform, setSelectedPlatform] = useState<string>(platform || '');

  const platforms = [
    { 
      id: 'instagram', 
      name: 'Instagram', 
      color: 'from-pink-500 to-purple-600',
      icon: 'IG',
      description: '9 questions about your Instagram experience'
    },
    { 
      id: 'facebook', 
      name: 'Facebook', 
      color: 'from-blue-600 to-blue-700',
      icon: 'FB',
      description: '10 questions about your Facebook usage patterns'
    },
    { 
      id: 'snapchat', 
      name: 'Snapchat', 
      color: 'from-yellow-400 to-yellow-500',
      icon: 'SC',
      description: '10 questions about your Snapchat habits and feelings'
    },
    { 
      id: 'twitter', 
      name: 'Twitter/X', 
      color: 'from-slate-600 to-slate-700',
      icon: 'X',
      description: '10 questions about your Twitter/X experience'
    },
  ];

  const createAssessment = useMutation({
    mutationFn: async (data: { platform: string; responses: Record<string, any> }) => {
      const response = await apiRequest("POST", "/api/assessments", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/assessments"] });
      toast({
        title: "Assessment Complete!",
        description: "Your insights are ready. Redirecting to results...",
      });
      setTimeout(() => {
        setLocation("/insights");
      }, 1500);
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to submit assessment. Please try again.",
        variant: "destructive",
      });
    },
  });

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

  const handleAssessmentSubmit = (responses: Record<string, any>) => {
    if (!selectedPlatform) return;
    
    createAssessment.mutate({
      platform: selectedPlatform,
      responses,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!selectedPlatform ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-slate-900 mb-4">
                Mental Health Assessment
              </h1>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Choose a social media platform to begin your personalized mental wellness assessment.
                Each assessment takes about 5-7 minutes to complete.
              </p>
            </div>

            {/* Platform Selection */}
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {platforms.map((platformItem, index) => (
                <motion.div
                  key={platformItem.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card 
                    className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border-0 shadow-md"
                    onClick={() => setSelectedPlatform(platformItem.id)}
                  >
                    <CardHeader className="text-center pb-4">
                      <div className={`w-16 h-16 bg-gradient-to-r ${platformItem.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                        <span className="text-white font-bold text-lg">{platformItem.icon}</span>
                      </div>
                      <CardTitle className="text-2xl text-slate-900">{platformItem.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-slate-600 mb-4">{platformItem.description}</p>
                      <Button 
                        className={`bg-gradient-to-r ${platformItem.color} hover:opacity-90 text-white border-0`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPlatform(platformItem.id);
                        }}
                      >
                        Start Assessment
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Back Button */}
            <div className="mb-6">
              <Button
                variant="ghost"
                onClick={() => setSelectedPlatform('')}
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Choose Different Platform</span>
              </Button>
            </div>

            {/* Assessment Form */}
            <AssessmentForm
              platform={selectedPlatform}
              onSubmit={handleAssessmentSubmit}
              isSubmitting={createAssessment.isPending}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}