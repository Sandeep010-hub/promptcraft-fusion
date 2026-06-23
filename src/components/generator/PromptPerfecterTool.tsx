import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Wand2, 
  Copy, 
  Download, 
  Sparkles, 
  RefreshCw,
  BookOpen,
  Lightbulb,
  Save,
  Target
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { SiOpenai, SiGooglegemini, SiAnthropic } from "react-icons/si";

export const PromptPerfecterTool = () => {
  const [inputPrompt, setInputPrompt] = useState("");
  const [optimizedPrompt, setOptimizedPrompt] = useState("");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [targetModel, setTargetModel] = useState("All");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  const handleGenerate = async () => {
    if (!inputPrompt.trim()) {
      toast({
        title: "Please enter a prompt",
        description: "Enter the prompt you'd like to optimize.",
        variant: "destructive"
      });
      return;
    }

    setIsOptimizing(true);
    
    try {
      // FIX #1: Get the user session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to generate prompts.",
          variant: "destructive"
        });
        setIsOptimizing(false);
        return;
      }

      // FIX #2: Use backticks (`) for the URL
      const response = await fetch(`${supabaseUrl}/functions/v1/generate-prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // FIX #3: Add the Authorization header
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          prompt: inputPrompt,
          targetModel: targetModel
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate prompt');
      }

      const data = await response.json();
      const resultText = data.generatedPrompt || data.prompt || JSON.stringify(data, null, 2);
      setOptimizedPrompt(resultText);

    } catch (error) {
      console.error('Error generating prompt:', error);
      toast({
        title: "Generation failed",
        description: "There was an error generating your prompt. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleSaveToVault = async () => {
    if (!optimizedPrompt.trim()) {
      toast({
        title: "No prompt to save",
        description: "Generate a prompt first before saving to vault.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to save prompts to vault.",
          variant: "destructive"
        });
        return;
      }

      // FIX #4: Use backticks (`) for the URL
      const response = await fetch(`${supabaseUrl}/functions/v1/save-prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          originalPrompt: inputPrompt,
          generatedPrompt: optimizedPrompt,
          targetModel: targetModel
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save prompt');
      }

      toast({
        title: "Saved to Vault!",
        description: "Your prompt has been successfully saved to the vault.",
      });
    } catch (error) {
      console.error('Error saving prompt:', error);
      toast({
        title: "Save failed",
        description: "There was an error saving your prompt. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
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
    <div className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full relative overflow-x-hidden">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mb-8 relative z-10"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30 shadow-[0_0_15px_rgba(0,255,255,0.3)]">
            <Wand2 className="h-6 w-6 text-primary drop-shadow-[0_0_5px_rgba(0,255,255,0.8)]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Prompt Generator</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Transform your ideas into powerful AI prompts</p>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8 relative z-10">
        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        >
          <Card className="glass border-glass-border h-full flex flex-col hover:border-primary/30 transition-colors duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary drop-shadow-[0_0_3px_rgba(0,255,255,0.5)]" />
                Your Prompt
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 flex flex-col">
              <Textarea
                placeholder="Enter your prompt here... Describe what you want to achieve with AI."
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                className="flex-1 min-h-[250px] glass border-glass-border focus:border-primary/50 focus:ring-primary/25 resize-none shadow-inner"
              />
              
              <div className="space-y-4 pt-2">
                {/* Model Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Target AI Model</label>
                  <Select value={targetModel} onValueChange={setTargetModel}>
                    <SelectTrigger className="glass border-glass-border focus:border-primary/50">
                      <SelectValue placeholder="Select AI model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">
                        <div className="flex items-center gap-2">
                          <SiGooglegemini className="w-3 h-3 text-[#8E75B2]"/>
                          <SiOpenai className="w-3 h-3 text-white"/>
                          <SiAnthropic className="w-3 h-3 text-[#d97757]"/>
                          All Models
                        </div>
                      </SelectItem>
                      <SelectItem value="Gemini">
                        <div className="flex items-center gap-2"><SiGooglegemini className="w-4 h-4 text-[#8E75B2]"/> Gemini</div>
                      </SelectItem>
                      <SelectItem value="ChatGPT">
                        <div className="flex items-center gap-2"><SiOpenai className="w-4 h-4 text-white"/> ChatGPT</div>
                      </SelectItem>
                      <SelectItem value="Claude">
                        <div className="flex items-center gap-2"><SiAnthropic className="w-4 h-4 text-[#d97757]"/> Claude</div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  onClick={handleGenerate}
                  disabled={isOptimizing || !inputPrompt.trim()}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground glow-primary-hover shadow-glow"
                >
                  {isOptimizing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Prompt
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Output Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        >
          <Card className="glass border-glass-border h-full flex flex-col hover:border-primary/30 transition-colors duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary drop-shadow-[0_0_3px_rgba(0,255,255,0.5)]" />
                Optimized Result
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 flex flex-col">
              {optimizedPrompt ? (
                <>
                  <div className="glass border-glass-border rounded-lg p-4 flex-1 min-h-[250px] overflow-y-auto custom-scrollbar bg-black/20 shadow-inner">
                    <pre className="whitespace-pre-wrap text-sm text-foreground font-mono">
                      {optimizedPrompt}
                    </pre>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(optimizedPrompt)}
                      className="glass-hover flex-1"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadPrompt(optimizedPrompt, 'optimized-prompt.txt')}
                      className="glass-hover flex-1"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleSaveToVault}
                      disabled={isSaving}
                      className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow"
                    >
                      {isSaving ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      {isSaving ? 'Saving...' : 'Save to Vault'}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="glass border-glass-border rounded-lg p-8 flex-1 min-h-[250px] flex flex-col items-center justify-center text-center bg-black/10">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10 shadow-glass animate-pulse">
                    <Lightbulb className="h-8 w-8 text-primary/70" />
                  </div>
                  <p className="text-foreground font-medium">Your optimized prompt will appear here</p>
                  <p className="text-sm text-muted-foreground/60 mt-2 max-w-[250px]">
                    Enter a prompt and click "Generate Prompt" to get started with PromptCraft AI.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tips Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
      >
        <Card className="glass border-glass-border mt-8 relative z-10 hover:border-primary/20 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Pro Tips for Better Prompts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="glass p-4 rounded-xl hover:bg-white/10 transition-colors">
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary" /> Be Specific</h4>
                <p className="text-sm text-muted-foreground">
                  Include clear context, desired outcome, and any constraints or requirements.
                </p>
              </div>
              <div className="glass p-4 rounded-xl hover:bg-white/10 transition-colors">
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary" /> Set the Role</h4>
                <p className="text-sm text-muted-foreground">
                  Define what role the AI should take (expert, teacher, analyst, etc.).
                </p>
              </div>
              <div className="glass p-4 rounded-xl hover:bg-white/10 transition-colors">
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary" /> Format Output</h4>
                <p className="text-sm text-muted-foreground">
                  Specify how you want the response structured (lists, steps, format, etc.).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};