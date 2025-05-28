
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Send, Loader2, Book } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
      'urdu', 'hindi', 'english', 'arabic', 'persian', 'literature', 'literary'
    ];
    
    const lowerText = text.toLowerCase();
    return poetryKeywords.some(keyword => lowerText.includes(keyword)) || 
           lowerText.includes('write') || 
           lowerText.includes('create') || 
           lowerText.includes('generate');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) return;

    // Check if the prompt is poetry-related
    if (!isPoetryRelated(prompt)) {
      toast({
        title: "Poetry Focus Only",
        description: "I'm Poets AI - I only assist with poetry, shayari, and literature. Please ask me about poems, poets, or creative writing!",
        variant: "destructive",
      });
      return;
    }
    
    const userMessage: Message = { role: "user", content: prompt };
    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");
    setIsLoading(true);
    
    try {
      // Enhanced poetry-focused system prompt
      const systemPrompt = `You are Poets AI, a specialized poetry assistant. You ONLY respond to poetry, literature, and creative writing related queries. Your expertise includes:

1. Writing and improving poetry, shayari, ghazals, and all forms of verse
2. Information about famous poets and their works
3. Generating shayari in any language (Urdu, Hindi, English, Arabic, Persian, etc.)
4. Creating poems based on emotions, themes, or prompts
5. Poetry analysis, techniques, and literary devices
6. Help with rhyme schemes, meter, and poetic forms

IMPORTANT RESTRICTIONS:
- ONLY answer questions related to poetry, poets, literature, and creative writing
- If asked about programming, math, science, or any non-poetry topic, politely redirect to poetry
- Always maintain a poetic, artistic, and inspiring tone
- When generating shayari or poems, be creative and emotionally resonant

Generate beautiful, meaningful poetry that touches the heart.`;

      // Prepare the context with poetry focus
      const messageHistory = [
        {
          role: "system",
          parts: [{ text: systemPrompt }]
        },
        ...messages.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.content }]
        })),
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ];
      
      // Set up the request for Gemini API
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyBQBABdgWaSX8qqjO9Tc0qcySppaePgu4s",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: messageHistory,
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
        "Sorry, I couldn't generate a poetry response at this time.";
      
      // Double-check if the response seems to be about non-poetry topics
      if (!isPoetryRelated(assistantResponse) && !assistantResponse.includes("poetry") && !assistantResponse.includes("poem")) {
        assistantResponse = "I'm Poets AI, your dedicated poetry assistant! I focus exclusively on poetry, shayari, literature, and creative writing. Please ask me about poems, poets, writing techniques, or let me create beautiful verses for you. What kind of poetry would you like to explore? 🌟";
      }
      
      const assistantMessage: Message = {
        role: "assistant",
        content: assistantResponse,
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate poetry. Please try again.",
        variant: "destructive",
      });
      console.error("Poetry generation error:", error);
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
