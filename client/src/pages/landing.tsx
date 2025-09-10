import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Shield, Target, TrendingUp } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">MindTrack</span>
            </div>
            <Button onClick={handleLogin} className="bg-blue-600 hover:bg-blue-700">
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-slate-900 mb-6">
            Take Control of Your
            <br />
            <span className="text-blue-600">Social Media Wellness</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
            Understand how social media affects your mental health with personalized assessments, 
            AI-powered insights, and actionable recommendations for healthier digital habits.
          </p>
          <Button
            onClick={handleLogin}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4"
          >
            Get Started - It's Free
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Smart Assessments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 text-center">
                Platform-specific questionnaires for Instagram, Facebook, Snapchat, and Twitter/X
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-lg">Personalized Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 text-center">
                AI-powered analysis provides tailored recommendations for your digital wellness
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Progress Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 text-center">
                Monitor your mental health journey with clear metrics and goal tracking
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-orange-600" />
              </div>
              <CardTitle className="text-lg">Safe & Private</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 text-center">
                Your mental health data is protected with enterprise-grade security
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Platform Support */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">
            Comprehensive Platform Support
          </h2>
          <div className="flex justify-center items-center space-x-12 opacity-60">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <span className="text-white font-bold text-sm">IG</span>
              </div>
              <span className="text-slate-600 font-medium">Instagram</span>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <span className="text-white font-bold text-sm">FB</span>
              </div>
              <span className="text-slate-600 font-medium">Facebook</span>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <span className="text-white font-bold text-sm">SC</span>
              </div>
              <span className="text-slate-600 font-medium">Snapchat</span>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-2">
                <span className="text-white font-bold text-sm">X</span>
              </div>
              <span className="text-slate-600 font-medium">Twitter/X</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}