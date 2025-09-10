import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export async function generateChatbotResponse(
  userMessage: string,
  chatHistory: Array<{ message: string; isBot: boolean; timestamp: Date }>
): Promise<string> {
  try {
    // Prepare context from chat history
    const contextMessages = chatHistory.slice(-6).map(msg => ({
      role: (msg.isBot ? 'assistant' : 'user') as 'assistant' | 'user',
      content: msg.message
    }));

    const systemPrompt = `You are MindTrack AI, a compassionate mental health companion specializing in digital wellness and social media impact. Your role is to:

1. Provide supportive, evidence-based guidance on digital wellness
2. Help users understand their relationship with social media
3. Offer practical strategies for healthier technology use
4. Encourage self-reflection and mindful usage patterns
5. Provide emotional support without giving medical advice

Guidelines:
- Be warm, empathetic, and non-judgmental
- Focus on practical, actionable advice
- Ask thoughtful follow-up questions
- Acknowledge users' feelings and experiences
- Suggest healthy coping strategies
- Remind users to seek professional help for serious concerns
- Keep responses concise but meaningful (2-4 sentences typically)

Remember: You're a supportive companion, not a replacement for professional mental health care.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        ...contextMessages,
        { role: "user", content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    return response.choices[0].message.content || "I'm here to help with your digital wellness journey. How can I support you today?";
  } catch (error) {
    console.error("Error generating chatbot response:", error);
    
    // Fallback responses based on common patterns
    if (userMessage.toLowerCase().includes('stress') || userMessage.toLowerCase().includes('anxious')) {
      return "I understand you're feeling stressed. Taking breaks from social media can really help. Have you tried setting specific times to check your apps, or using mindfulness techniques when you feel overwhelmed?";
    }
    
    if (userMessage.toLowerCase().includes('time') || userMessage.toLowerCase().includes('usage')) {
      return "Managing screen time is a common challenge. Consider setting daily limits for your most-used apps, or try the 'phone-free' hour before bed. What platforms do you find yourself using most?";
    }
    
    if (userMessage.toLowerCase().includes('comparison') || userMessage.toLowerCase().includes('compare')) {
      return "Social comparison is natural but can be harmful to our wellbeing. Remember that people share their highlights, not their struggles. Try unfollowing accounts that make you feel inadequate and following those that inspire you positively.";
    }
    
    return "I'm experiencing some technical difficulties, but I'm here to support your digital wellness journey. What's on your mind about your social media use?";
  }
}