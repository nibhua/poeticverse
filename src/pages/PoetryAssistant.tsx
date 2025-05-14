
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, Send, Copy, Download } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const poetryStyles = [
  "Sonnet", "Haiku", "Free verse", "Limerick", "Ballad",
  "Ghazal", "Ode", "Villanelle", "Epic", "Prose poetry",
  "Acrostic", "Narrative", "Elegy", "Blank verse", "Concrete"
];

const poetryThemes = [
  "Love", "Nature", "Loss", "Hope", "Friendship",
  "Courage", "Time", "War", "Peace", "Dreams",
  "Mystery", "Journey", "Identity", "Freedom", "Change"
];

export default function PoetryAssistant() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("");
  const [theme, setTheme] = useState("");
  const [length, setLength] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [poetry, setPoetry] = useState("");
  const { toast } = useToast();

  const handleGeneratePoetry = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Input required",
        description: "Please enter a prompt for your poem",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-poetry", {
        body: { prompt, style, theme, length },
      });

      if (error) throw error;
      setPoetry(data.poetry);
    } catch (error) {
      console.error("Error generating poetry:", error);
      toast({
        title: "Generation failed",
        description: "Failed to generate poetry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(poetry);
    toast({
      title: "Copied",
      description: "Poetry copied to clipboard",
    });
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([poetry], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "generated-poem.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-gradient-subtle">Poetry Assistant</h1>
        <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
          Get inspired with AI-generated poetry based on your prompts, themes, and styles
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Create Your Poem</CardTitle>
              <CardDescription>
                Provide details for your AI-generated poem
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="prompt" className="text-sm font-medium mb-1 block">
                  What would you like a poem about?
                </label>
                <Textarea
                  id="prompt"
                  placeholder="Enter your poetry prompt here..."
                  className="resize-none min-h-[100px]"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="style" className="text-sm font-medium mb-1 block">
                    Poetry Style
                  </label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any style</SelectItem>
                      {poetryStyles.map((style) => (
                        <SelectItem key={style} value={style}>
                          {style}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label htmlFor="theme" className="text-sm font-medium mb-1 block">
                    Theme
                  </label>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any theme</SelectItem>
                      {poetryThemes.map((theme) => (
                        <SelectItem key={theme} value={theme}>
                          {theme}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label htmlFor="length" className="text-sm font-medium mb-1 block">
                  Length (number of lines)
                </label>
                <Input
                  id="length"
                  type="number"
                  min="1"
                  max="50"
                  placeholder="Any length"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                />
              </div>

              <Button 
                className="w-full"
                onClick={handleGeneratePoetry}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Poem
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Your Generated Poem</CardTitle>
              <CardDescription>
                AI-crafted poetry based on your input
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {poetry ? (
                <>
                  <div className="bg-muted p-4 rounded-md overflow-auto h-[300px] whitespace-pre-line">
                    {poetry}
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopy}>
                      <Copy className="h-4 w-4 mr-1" /> Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDownload}>
                      <Download className="h-4 w-4 mr-1" /> Download
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-center bg-muted/40 rounded-md p-6">
                  <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No poem generated yet</h3>
                  <p className="text-muted-foreground max-w-md">
                    Fill out the form on the left and click "Generate Poem" to create your AI-powered poetry
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
