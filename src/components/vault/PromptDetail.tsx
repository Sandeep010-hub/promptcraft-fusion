import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, 
  Copy, 
  Download, 
  Upload, 
  Clock, 
  Tag,
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PromptDetail {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  starred: boolean;
  created_at: string;
  usage_count: number;
  outputUrl?: string;
  outputType?: string;
}

export const PromptDetail = () => {
  const { promptId } = useParams<{ promptId: string }>();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState<PromptDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  useEffect(() => {
    if (promptId) {
      fetchPromptDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promptId]);

  const fetchPromptDetail = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to view prompt details.",
          variant: "destructive"
        });
        navigate('/');
        return;
      }

      const { data, error } = await supabase.functions.invoke('get-prompts', {
        body: {}
      });

      if (error) {
        throw new Error(error.message || 'Failed to fetch prompts');
      }
      const foundPrompt = data.prompts.find((p: PromptDetail) => p.id === promptId);
      
      if (!foundPrompt) {
        toast({
          title: "Prompt not found",
          description: "The requested prompt could not be found.",
          variant: "destructive"
        });
        navigate('/dashboard#vault');
        return;
      }

      setPrompt(foundPrompt);
    } catch (error) {
      console.error('Error fetching prompt detail:', error);
      toast({
        title: "Failed to load prompt",
        description: "There was an error loading the prompt details. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !prompt) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload.",
        variant: "destructive"
      });
      return;
    }

    try {
      setUploading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to upload files.",
          variant: "destructive"
        });
        return;
      }

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('promptId', prompt.id);

      // Need to use standard fetch for FormData since invoke() doesn't support it directly
      const response = await fetch(`${supabaseUrl}/functions/v1/upload-output`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const data = await response.json();
      
      toast({
        title: "Upload successful!",
        description: "Your output file has been uploaded and linked to this prompt.",
      });

      // Refresh prompt data to show new output
      await fetchPromptDetail();
      setSelectedFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Text copied to clipboard."
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

  if (loading) {
    return (
      <div className="flex-1 p-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <span className="ml-2 text-muted-foreground">Loading prompt details...</span>
        </div>
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="flex-1 p-8 max-w-7xl mx-auto w-full">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Prompt not found</h3>
          <Button onClick={() => navigate('/dashboard#vault')}>
            Back to Vault
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard#vault')}
            className="glass-hover"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Vault
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">{prompt.title}</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Prompt details and outputs</p>
          </div>
        </div>

        {/* Prompt Info */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4">
          <Badge variant="outline" className="glass-hover">
            {prompt.category}
          </Badge>
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {prompt.created_at}
          </span>
          <span className="text-sm text-muted-foreground">
            Used {prompt.usage_count} times
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Original Prompt */}
        <Card className="glass border-glass-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Original Prompt
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="glass border-glass-border rounded-lg p-4">
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {prompt.title}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(prompt.title)}
                className="glass-hover"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadPrompt(prompt.title, 'original-prompt.txt')}
                className="glass-hover"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Generated Prompt */}
        <Card className="glass border-glass-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Generated Prompt
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="glass border-glass-border rounded-lg p-4 max-h-64 overflow-y-auto">
              <pre className="text-sm text-foreground whitespace-pre-wrap font-mono">
                {prompt.content}
              </pre>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(prompt.content)}
                className="glass-hover"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadPrompt(prompt.content, 'generated-prompt.txt')}
                className="glass-hover"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Output Section */}
      <Card className="glass border-glass-border mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Output & Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Output */}
          {prompt.outputUrl && (
            <div className="glass border-glass-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-foreground">Current Output</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Type: {prompt.outputType}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(prompt.outputUrl, '_blank')}
                  className="glass-hover"
                >
                  View Output
                </Button>
              </div>
            </div>
          )}

          {/* File Upload */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Upload Output File
              </label>
              <p className="text-sm text-muted-foreground mb-4">
                Upload your AI-generated output to link it with this prompt
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                id="file-upload"
                type="file"
                onChange={handleFileSelect}
                className="flex-1 glass border-glass-border"
                accept="*/*"
              />
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </>
                )}
              </Button>
            </div>

            {selectedFile && (
              <div className="text-sm text-muted-foreground">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
