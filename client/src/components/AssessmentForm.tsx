import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Question {
  id: string;
  question: string;
  options: {
    value: string;
    label: string;
  }[];
}

interface AssessmentFormProps {
  platform: string;
  onSubmit: (responses: Record<string, any>) => void;
  isSubmitting: boolean;
}

const getQuestionsForPlatform = (platform: string): Question[] => {
  const platformQuestions: Record<string, Question[]> = {
    instagram: [
      {
        id: 'current_experience',
        question: 'How would you describe your current experience with Instagram?',
        options: [
          { value: 'uplifting', label: 'Uplifting and inspiring' },
          { value: 'mixed', label: 'A mix of fun and distraction' },
          { value: 'overwhelming', label: 'Sometimes overwhelming' },
          { value: 'balance', label: 'I\'d like to explore a healthier balance' },
        ]
      },
      {
        id: 'usage_frequency',
        question: 'How often do you use Instagram during your free time?',
        options: [
          { value: 'rarely', label: 'Rarely' },
          { value: 'occasionally', label: 'Occasionally' },
          { value: 'few_times', label: 'A few times a day' },
          { value: 'regularly', label: 'Regularly throughout the day' },
        ]
      },
      {
        id: 'content_type',
        question: 'What type of content do you engage with the most?',
        options: [
          { value: 'educational', label: 'Educational and career-oriented' },
          { value: 'fitness', label: 'Fitness, motivation, or self-growth' },
          { value: 'entertainment', label: 'Entertainment and lifestyle' },
          { value: 'mixed', label: 'Mixed or not sure' },
        ]
      },
      {
        id: 'feeling_after',
        question: 'After using Instagram, how do you typically feel?',
        options: [
          { value: 'energized', label: 'Energized and positive' },
          { value: 'neutral', label: 'Neutral' },
          { value: 'distracted', label: 'Slightly distracted' },
          { value: 'drained', label: 'Emotionally drained or overstimulated' },
        ]
      },
      {
        id: 'self_image_influence',
        question: 'Has Instagram influenced your self-image or emotions?',
        options: [
          { value: 'not_really', label: 'Not really' },
          { value: 'sometimes', label: 'Sometimes I feel inspired, other times unsure' },
          { value: 'reflected', label: 'Yes, I\'ve reflected more on how I view myself' },
          { value: 'understand_better', label: 'Yes, and I\'m looking to understand this better' },
        ]
      },
      {
        id: 'personal_growth',
        question: 'Does Instagram help or hinder your personal growth?',
        options: [
          { value: 'supports', label: 'It supports my goals' },
          { value: 'both', label: 'A bit of both' },
          { value: 'distracts', label: 'It distracts me at times' },
          { value: 'realign', label: 'I\'d like to realign my time better' },
        ]
      },
      {
        id: 'engagement_importance',
        question: 'How important are likes/comments/followers to you?',
        options: [
          { value: 'not_important', label: 'Not important' },
          { value: 'somewhat', label: 'Somewhat noticeable' },
          { value: 'track', label: 'I often track them' },
          { value: 'affected', label: 'I feel affected when engagement changes' },
        ]
      },
      {
        id: 'boundaries',
        question: 'Would you consider taking breaks or setting boundaries with Instagram?',
        options: [
          { value: 'already_take', label: 'I already take breaks regularly' },
          { value: 'considered', label: 'I\'ve considered it but haven\'t started' },
          { value: 'hard_to_step', label: 'It\'s hard to step away' },
          { value: 'help_needed', label: 'I\'d like help creating healthy boundaries' },
        ]
      },
      {
        id: 'support_interest',
        question: 'Would you be interested in resources or support for mindful Instagram use?',
        options: [
          { value: 'yes', label: 'Yes, that would be helpful' },
          { value: 'maybe', label: 'Maybe, if it fits my needs' },
          { value: 'not_now', label: 'Not right now' },
          { value: 'not_sure', label: 'I\'m not sure' },
        ]
      },
    ],
    facebook: [
      {
        id: 'check_frequency',
        question: 'How often do you check Facebook?',
        options: [
          { value: 'occasionally', label: 'Occasionally' },
          { value: 'once_twice', label: 'Once or twice daily' },
          { value: 'several_times', label: 'Several times a day' },
          { value: 'continuously', label: 'Continuously throughout the day' },
        ]
      },
      {
        id: 'main_use',
        question: 'What do you mainly use Facebook for?',
        options: [
          { value: 'staying_touch', label: 'Staying in touch with friends/family' },
          { value: 'sharing_memories', label: 'Sharing memories or thoughts' },
          { value: 'browsing_groups', label: 'Browsing groups or marketplace' },
          { value: 'mix_everything', label: 'A mix of everything' },
        ]
      },
      {
        id: 'feeling_after',
        question: 'How do you usually feel after using Facebook?',
        options: [
          { value: 'connected', label: 'Connected and positive' },
          { value: 'neutral', label: 'Neutral' },
          { value: 'distracted', label: 'Slightly distracted or overwhelmed' },
          { value: 'anxious', label: 'Anxious or left out' },
        ]
      },
      {
        id: 'comparing_life',
        question: 'Do you find yourself comparing your life with others based on posts?',
        options: [
          { value: 'not_at_all', label: 'Not at all' },
          { value: 'occasionally', label: 'Occasionally' },
          { value: 'frequently', label: 'Frequently' },
          { value: 'almost_always', label: 'Almost always' },
        ]
      },
      {
        id: 'meaningful_time',
        question: 'How often do you feel your time on Facebook is meaningful?',
        options: [
          { value: 'very_often', label: 'Very often' },
          { value: 'sometimes', label: 'Sometimes' },
          { value: 'rarely', label: 'Rarely' },
          { value: 'unsure', label: 'Unsure' },
        ]
      },
      {
        id: 'interactions_influence',
        question: 'Do interactions (likes, comments) influence how you feel about yourself or others?',
        options: [
          { value: 'not_really', label: 'Not really' },
          { value: 'occasionally', label: 'Occasionally' },
          { value: 'sometimes', label: 'Yes, sometimes' },
          { value: 'frequently', label: 'Yes, frequently' },
        ]
      },
      {
        id: 'family_posts_trigger',
        question: 'Do family posts or social updates ever trigger emotional reactions?',
        options: [
          { value: 'not_at_all', label: 'Not at all' },
          { value: 'slightly', label: 'Slightly' },
          { value: 'often', label: 'Often' },
          { value: 'strongly', label: 'Strongly' },
        ]
      },
      {
        id: 'support_or_distract',
        question: 'Does Facebook support or distract you from personal goals or mental peace?',
        options: [
          { value: 'supports', label: 'It supports me' },
          { value: 'mix_both', label: 'A mix of both' },
          { value: 'distracts_occasionally', label: 'It distracts me occasionally' },
          { value: 'affects_deeply', label: 'It affects me deeply' },
        ]
      },
      {
        id: 'groups_support',
        question: 'Do you use Facebook groups or communities for emotional support or hobbies?',
        options: [
          { value: 'yes_regularly', label: 'Yes, regularly' },
          { value: 'sometimes', label: 'Sometimes' },
          { value: 'rarely', label: 'Rarely' },
          { value: 'no', label: 'No' },
        ]
      },
      {
        id: 'wellness_tips',
        question: 'Are you open to mental wellness tips tailored to your Facebook use?',
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'maybe', label: 'Maybe' },
          { value: 'not_sure', label: 'Not sure' },
          { value: 'no', label: 'No' },
        ]
      },
    ],
    snapchat: [
      {
        id: 'daily_usage',
        question: 'How often do you use Snapchat daily?',
        options: [
          { value: 'less_30min', label: 'Less than 30 minutes' },
          { value: '30min_1hour', label: '30 minutes to 1 hour' },
          { value: '1_2hours', label: '1–2 hours' },
          { value: 'more_2hours', label: 'More than 2 hours' },
        ]
      },
      {
        id: 'primary_use',
        question: 'What do you primarily use Snapchat for?',
        options: [
          { value: 'staying_connected', label: 'Staying connected with friends' },
          { value: 'sharing_moments', label: 'Sharing personal moments' },
          { value: 'exploring_content', label: 'Exploring content/stories' },
          { value: 'maintaining_streaks', label: 'Maintaining streaks' },
        ]
      },
      {
        id: 'streak_breaks',
        question: 'How do you feel when a streak breaks or snaps go unanswered?',
        options: [
          { value: 'unaffected', label: 'Unaffected' },
          { value: 'slightly_concerned', label: 'Slightly concerned' },
          { value: 'stressed', label: 'Stressed or anxious' },
          { value: 'upset', label: 'Upset or emotional' },
        ]
      },
      {
        id: 'feel_left_out',
        question: 'Do you ever feel left out due to content shared by others?',
        options: [
          { value: 'never', label: 'Never' },
          { value: 'rarely', label: 'Rarely' },
          { value: 'sometimes', label: 'Sometimes' },
          { value: 'often', label: 'Often' },
        ]
      },
      {
        id: 'appearing_perfect',
        question: 'How much effort do you put into appearing fun or perfect on Snapchat?',
        options: [
          { value: 'none', label: 'None — I post casually' },
          { value: 'little', label: 'A little — for fun' },
          { value: 'moderate', label: 'Moderate — I like to be seen a certain way' },
          { value: 'lot', label: 'A lot — I feel pressured to present a certain image' },
        ]
      },
      {
        id: 'feel_understood',
        question: 'Do you feel seen and understood through your Snapchat interactions?',
        options: [
          { value: 'always', label: 'Yes, always' },
          { value: 'mostly', label: 'Mostly' },
          { value: 'sometimes', label: 'Sometimes' },
          { value: 'rarely', label: 'Rarely' },
        ]
      },
      {
        id: 'emotional_effect',
        question: 'How does using Snapchat affect your emotional state overall?',
        options: [
          { value: 'happy_connected', label: 'I feel happy and connected' },
          { value: 'neutral', label: 'Neutral' },
          { value: 'mixed_emotions', label: 'Mixed emotions' },
          { value: 'drained', label: 'Emotionally drained sometimes' },
        ]
      },
      {
        id: 'impact_goals',
        question: 'Has your Snapchat use ever impacted your studies, work, or goals?',
        options: [
          { value: 'never', label: 'Never' },
          { value: 'rarely', label: 'Rarely' },
          { value: 'occasionally', label: 'Occasionally' },
          { value: 'often', label: 'Often' },
        ]
      },
      {
        id: 'real_self',
        question: 'Do you feel comfortable expressing your real self on Snapchat?',
        options: [
          { value: 'always', label: 'Always' },
          { value: 'mostly', label: 'Mostly' },
          { value: 'sometimes', label: 'Sometimes' },
          { value: 'not_really', label: 'Not really' },
        ]
      },
      {
        id: 'balance_tips',
        question: 'Would you like tips to better balance your digital and emotional life?',
        options: [
          { value: 'definitely', label: 'Definitely' },
          { value: 'maybe', label: 'Maybe' },
          { value: 'not_sure', label: 'Not sure' },
          { value: 'no', label: 'No' },
        ]
      },
    ],
    twitter: [
      {
        id: 'experience',
        question: 'How would you describe your experience with Twitter/X?',
        options: [
          { value: 'engaging', label: 'Engaging and informative' },
          { value: 'mixed', label: 'A mix of value and noise' },
          { value: 'intense', label: 'Sometimes intense or draining' },
          { value: 'habit', label: 'I use it mostly out of habit' },
        ]
      },
      {
        id: 'content_interaction',
        question: 'What kind of content do you usually interact with?',
        options: [
          { value: 'news', label: 'News and world events' },
          { value: 'memes', label: 'Memes and humor' },
          { value: 'discussions', label: 'Discussions and debates' },
          { value: 'variety', label: 'A variety / not sure' },
        ]
      },
      {
        id: 'feeling_after',
        question: 'After scrolling through Twitter, how do you typically feel?',
        options: [
          { value: 'informed', label: 'Informed and curious' },
          { value: 'neutral', label: 'Neutral or unaffected' },
          { value: 'overwhelmed', label: 'A bit overwhelmed or reactive' },
          { value: 'unsettled', label: 'Emotionally unsettled' },
        ]
      },
      {
        id: 'trending_topics',
        question: 'How frequently do trending topics affect your emotions or opinions?',
        options: [
          { value: 'rarely', label: 'Rarely' },
          { value: 'sometimes', label: 'Sometimes' },
          { value: 'frequently', label: 'Frequently' },
          { value: 'very_often', label: 'Very often' },
        ]
      },
      {
        id: 'online_arguments',
        question: 'Do online arguments or intense threads impact your mood?',
        options: [
          { value: 'not_at_all', label: 'Not at all' },
          { value: 'occasionally', label: 'Occasionally' },
          { value: 'sometimes_affect', label: 'Yes, they sometimes affect me' },
          { value: 'significantly', label: 'Yes, quite significantly' },
        ]
      },
      {
        id: 'express_emotions',
        question: 'Do you use Twitter to express emotions or vent?',
        options: [
          { value: 'never', label: 'Never' },
          { value: 'rarely', label: 'Rarely' },
          { value: 'sometimes', label: 'Sometimes' },
          { value: 'frequently', label: 'Frequently' },
        ]
      },
      {
        id: 'pressure_respond',
        question: 'Do you feel pressure to respond or stay constantly updated?',
        options: [
          { value: 'no_pressure', label: 'No pressure at all' },
          { value: 'mild_pressure', label: 'Mild pressure' },
          { value: 'quite_often', label: 'Quite often' },
          { value: 'constantly', label: 'Constantly' },
        ]
      },
      {
        id: 'focus_wellbeing',
        question: 'Does Twitter support or hinder your daily focus and well-being?',
        options: [
          { value: 'helps', label: 'It helps me stay sharp and informed' },
          { value: 'neutral', label: 'It\'s neutral' },
          { value: 'bit_distracting', label: 'It\'s a bit distracting' },
          { value: 'affects_significantly', label: 'It affects my focus significantly' },
        ]
      },
      {
        id: 'feel_safe',
        question: 'How safe or respected do you feel on Twitter?',
        options: [
          { value: 'very_safe', label: 'Very safe and respected' },
          { value: 'mostly_okay', label: 'Mostly okay' },
          { value: 'sometimes_judged', label: 'Sometimes judged or misunderstood' },
          { value: 'exposed_negativity', label: 'Often exposed to negativity' },
        ]
      },
      {
        id: 'stress_strategies',
        question: 'Are you open to strategies that help reduce online stress?',
        options: [
          { value: 'definitely', label: 'Definitely' },
          { value: 'maybe', label: 'Maybe' },
          { value: 'thinking_about', label: 'I\'m thinking about it' },
          { value: 'not_now', label: 'Not right now' },
        ]
      },
    ],
  };

  return platformQuestions[platform] || [];
};

export default function AssessmentForm({ platform, onSubmit, isSubmitting }: AssessmentFormProps) {
  const questions = getQuestionsForPlatform(platform);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleAnswer = (value: string) => {
    const newResponses = {
      ...responses,
      [currentQuestion.id]: value
    };
    setResponses(newResponses);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    onSubmit(responses);
  };

  const canSubmit = Object.keys(responses).length === questions.length;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  if (questions.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <p className="text-slate-600">No questions available for this platform.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl font-bold text-slate-900">
            {platform.charAt(0).toUpperCase() + platform.slice(1)} Assessment
          </h2>
          <span className="text-sm text-slate-500">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader className="pb-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CardTitle className="text-xl text-slate-800 leading-relaxed">
                {currentQuestion.question}
              </CardTitle>
            </motion.div>
          </AnimatePresence>
        </CardHeader>

        <CardContent className="space-y-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="space-y-3"
            >
              {currentQuestion.options.map((option, index) => {
                const isSelected = responses[currentQuestion.id] === option.value;
                return (
                  <motion.button
                    key={option.value}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    onClick={() => handleAnswer(option.value)}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                        : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-25 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                        isSelected ? 'border-blue-500 bg-blue-500' : 'border-slate-300'
                      }`}>
                        {isSelected && (
                          <div className="w-full h-full rounded-full bg-white scale-50"></div>
                        )}
                      </div>
                      <span className="font-medium">{option.label}</span>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-6 mt-6 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>

            {isLastQuestion && canSubmit ? (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8"
              >
                {isSubmitting ? 'Analyzing...' : 'Complete Assessment'}
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                disabled={!responses[currentQuestion.id] || currentQuestionIndex >= questions.length - 1}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}