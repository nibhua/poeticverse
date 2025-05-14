
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Send, Loader2 } from "lucide-react";
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
      content: "Hello! I'm your poetry assistant. I can help you write, improve, or generate poetry. What would you like to create today?",
    },
  ]);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) return;
    
    const userMessage: Message = { role: "user", content: prompt };
    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");
    setIsLoading(true);
    
    try {
      // Prepare the context with poetry focus
      const messageHistory = messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      }));
      
      // Add the user's latest message
      messageHistory.push({
        role: "user",
        parts: [{ text: prompt }]
      });
      
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
              temperature: 0.7,
              maxOutputTokens: 800,
            },
          }),
        }
      );

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || "Failed to generate response");
      }
      
      const assistantResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 
        "Sorry, I couldn't generate a response at this time.";
      
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gradient-subtle">Poetry Assistant</h1>
        <p className="text-gray-600">Get help with writing, improving, or generating poetry</p>
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
                    : "bg-primary text-primary-foreground"
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
                  <span className="text-sm">Writing poetry...</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="mt-auto p-2 bg-white dark:bg-gray-800 rounded-b-lg border-t">
          <div className="flex gap-2">
            <Textarea
              placeholder="Describe what kind of poetry you'd like... (e.g., 'Write me a haiku about autumn')"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-1 min-h-[80px]"
              disabled={isLoading}
            />
            <Button type="submit" className="h-auto" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          
          <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
            <span>Powered by Gemini AI</span>
            <button
              type="button"
              className="hover:underline"
              onClick={() => setMessages([{
                role: "assistant",
                content: "Hello! I'm your poetry assistant. I can help you write, improve, or generate poetry. What would you like to create today?",
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
