import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Wand2, 
  Copy, 
  Download, 
  Sparkles, 
  RefreshCw,
  BookOpen,
  Lightbulb,
  Target
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const PromptPerfecterTool = () => {
  const [inputPrompt, setInputPrompt] = useState("");
  const [optimizedPrompt, setOptimizedPrompt] = useState("");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const { toast } = useToast();

  const handleOptimizePrompt = async () => {
    if (!inputPrompt.trim()) {
      toast({
        title: "Please enter a prompt",
        description: "Enter the prompt you'd like to optimize.",
        variant: "destructive"
      });
      return;
    }

    setIsOptimizing(true);
    
    // Simulate AI optimization (replace with actual AI call)
    setTimeout(() => {
      const optimized = `**OPTIMIZED PROMPT:**

Context: ${inputPrompt}

Enhanced Version:
You are an expert AI assistant specialized in [specific domain]. Your task is to provide comprehensive, accurate, and actionable responses.

Instructions:
1. Analyze the user's request thoroughly
2. Provide step-by-step guidance when applicable
3. Include relevant examples and best practices
4. Ensure clarity and precision in your response

Requirements:
- Be specific and detailed in your explanations
- Use professional but accessible language
- Provide actionable insights
- Consider edge cases and alternatives

Output Format:
Structure your response with clear headings and bullet points for maximum readability.

Original Request: "${inputPrompt}"`;

      setOptimizedPrompt(optimized);
      setIsOptimizing(false);
    }, 2000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Prompt copied to clipboard."
    });
  };

  const downloadPrompt = (text: string, filename: string) => {
    const element = document.createElement("a");
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="flex-1 p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <Wand2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Prompt Generator</h1>
            <p className="text-muted-foreground">Transform your ideas into powerful AI prompts</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <Card className="glass border-glass-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Your Prompt
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter your prompt here... Describe what you want to achieve with AI."
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              className="min-h-[200px] glass border-glass-border focus:border-primary/50 focus:ring-primary/25"
            />
            
            <div className="flex gap-2">
              <Button 
                onClick={handleOptimizePrompt}
                disabled={isOptimizing || !inputPrompt.trim()}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground glow-primary-hover"
              >
                {isOptimizing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Optimize Prompt
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card className="glass border-glass-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Optimized Result
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {optimizedPrompt ? (
              <>
                <div className="glass border-glass-border rounded-lg p-4 min-h-[200px]">
                  <pre className="whitespace-pre-wrap text-sm text-foreground font-mono">
                    {optimizedPrompt}
                  </pre>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(optimizedPrompt)}
                    className="glass-hover"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadPrompt(optimizedPrompt, 'optimized-prompt.txt')}
                    className="glass-hover"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </>
            ) : (
              <div className="glass border-glass-border rounded-lg p-8 min-h-[200px] flex flex-col items-center justify-center text-center">
                <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Your optimized prompt will appear here</p>
                <p className="text-sm text-muted-foreground/60 mt-1">
                  Enter a prompt and click "Optimize Prompt" to get started
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tips Section */}
      <Card className="glass border-glass-border mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Pro Tips for Better Prompts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="glass p-4 rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">Be Specific</h4>
              <p className="text-sm text-muted-foreground">
                Include clear context, desired outcome, and any constraints or requirements.
              </p>
            </div>
            <div className="glass p-4 rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">Set the Role</h4>
              <p className="text-sm text-muted-foreground">
                Define what role the AI should take (expert, teacher, analyst, etc.).
              </p>
            </div>
            <div className="glass p-4 rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">Format Output</h4>
              <p className="text-sm text-muted-foreground">
                Specify how you want the response structured (lists, steps, format, etc.).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};