
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Send, Loader2, Book } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function PoetryAssistant() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Welcome to Poets AI! 🌟 I'm your dedicated poetry assistant. I can help you with:\n\n• Writing and improving poetry & shayari\n• Finding famous poets and their works\n• Generating shayari in any language\n• Creating poems based on emotions\n• Poetry analysis and techniques\n\nWhat kind of poetry would you like to explore today?",
    },
  ]);
  const { toast } = useToast();

  const isPoetryRelated = (text: string): boolean => {
    const poetryKeywords = [
      'poem', 'poetry', 'poet', 'verse', 'rhyme', 'stanza', 'haiku', 'sonnet', 'limerick',
      'shayari', 'ghazal', 'nazm', 'rubai', 'qawwali', 'doha', 'sher', 'couplet',
      'metaphor', 'simile', 'alliteration', 'rhythm', 'meter', 'ballad', 'ode', 'elegy',
      'write', 'compose', 'create', 'generate', 'emotion', 'love', 'sad', 'happy', 'romantic',
      'urdu', 'hindi', 'english', 'arabic', 'persian', 'literature', 'literary', 'author',
      'book', 'story', 'novel', 'writing', 'creative', 'inspiring', 'beautiful', 'heart',
      'feeling', 'express', 'art', 'artistic', 'verse', 'line', 'quote', 'famous'
    ];
    
    const lowerText = text.toLowerCase();
    
    // Check for greetings - these are allowed
    const greetings = ['hi', 'hello', 'hey', 'good morning', 'good evening', 'namaste', 'salaam'];
    if (greetings.some(greeting => lowerText.includes(greeting))) {
      return true;
    }
    
    // Check for poetry-related keywords
    return poetryKeywords.some(keyword => lowerText.includes(keyword));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) return;

    // Check if the prompt is poetry-related or a greeting
    if (!isPoetryRelated(prompt)) {
      const defaultMessage = "I'm Poets AI - I only assist with poetry, shayari, and literature! 🌟\n\nI can help you with:\n• Write beautiful shayari in any language\n• Find famous poets and their works\n• Create poems based on emotions\n• Poetry analysis and techniques\n• Generate romantic, sad, or happy verses\n\nWhat kind of poetry would you like to explore?";
      
      const assistantMessage: Message = {
        role: "assistant",
        content: defaultMessage,
      };
      
      const userMessage: Message = { role: "user", content: prompt };
      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setPrompt("");
      return;
    }
    
    const userMessage: Message = { role: "user", content: prompt };
    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");
    setIsLoading(true);
    
    try {
      // Create the enhanced poetry prompt for the AI
      const enhancedPrompt = `You are Poets AI, a specialized poetry assistant. You ONLY respond to poetry, literature, and creative writing queries.

User Query: ${prompt}

Instructions:
- If this is about poetry, shayari, literature, or creative writing, provide a helpful, creative response
- Generate beautiful, meaningful poetry that touches the heart
- Help with any poetry-related questions, poet information, or literary analysis
- Be poetic, artistic, and inspiring in your responses
- If generating shayari or poems, make them emotionally resonant and beautiful

Please respond with poetry-focused content only.`;

      // Prepare messages for Gemini API (without system role)
      const apiMessages = [
        {
          role: "user",
          parts: [{ text: enhancedPrompt }]
        }
      ];
      
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyBQBABdgWaSX8qqjO9Tc0qcySppaePgu4s",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: apiMessages,
            generationConfig: {
              temperature: 0.8,
              maxOutputTokens: 800,
            },
          }),
        }
      );

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || "Failed to generate response");
      }
      
      let assistantResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 
        "Sorry, I couldn't generate a poetry response at this time. Please try asking about poems, shayari, or poets!";
      
      const assistantMessage: Message = {
        role: "assistant",
        content: assistantResponse,
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Poetry generation error:", error);
      
      // Provide a fallback poetry response
      const fallbackMessage: Message = {
        role: "assistant",
        content: "I'm having trouble connecting right now, but I'm here to help with poetry! 🌟\n\nTry asking me:\n• 'Write a romantic shayari in Urdu'\n• 'Tell me about Mirza Ghalib'\n• 'Create a poem about happiness'\n• 'Generate a sad poem'\n\nWhat would you like to explore in poetry?",
      };
      
      setMessages((prev) => [...prev, fallbackMessage]);
      
      toast({
        title: "Connection Issue",
        description: "Having trouble connecting, but I'm still here to help with poetry!",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Book className="h-8 w-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gradient-subtle">Poets AI</h1>
        </div>
        <p className="text-gray-600">Your dedicated poetry assistant for shayari, poems, and literary creativity</p>
        <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <p className="text-sm text-purple-700">
            🎭 <strong>Search for poets</strong> • 📝 <strong>Generate shayari in any language</strong> • 💝 <strong>Create poems based on emotions</strong>
          </p>
        </div>
      </div>
      
      <div className="flex flex-col h-[60vh]">
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900/50 rounded-t-lg space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "assistant" ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === "assistant"
                    ? "bg-white dark:bg-gray-800 border shadow-sm"
                    : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] p-3 rounded-lg bg-white dark:bg-gray-800 border shadow-sm">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Crafting poetry...</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="mt-auto p-2 bg-white dark:bg-gray-800 rounded-b-lg border-t">
          <div className="flex gap-2">
            <Textarea
              placeholder="Ask about poetry, poets, or request shayari... (e.g., 'Write a romantic shayari in Urdu', 'Tell me about Mirza Ghalib')"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-1 min-h-[80px]"
              disabled={isLoading}
            />
            <Button type="submit" className="h-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          
          <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
            <span>Powered by Gemini AI • Poetry Focus Only</span>
            <button
              type="button"
              className="hover:underline"
              onClick={() => setMessages([{
                role: "assistant",
                content: "Welcome to Poets AI! 🌟 I'm your dedicated poetry assistant. I can help you with:\n\n• Writing and improving poetry & shayari\n• Finding famous poets and their works\n• Generating shayari in any language\n• Creating poems based on emotions\n• Poetry analysis and techniques\n\nWhat kind of poetry would you like to explore today?",
              }])}
            >
              Clear conversation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
