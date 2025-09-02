import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { 
  Archive, 
  Search, 
  Filter, 
  Plus, 
  Bookmark, 
  Star, 
  Clock, 
  Loader2,
  X,
  Save,
  Copy,
  Tag
} from "lucide-react";

interface Prompt {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  usage_count: number;
  starred: boolean;
  created_at: string;
}

export const Vault = () => {
  const categories = ['All', 'Creative Writing', 'Business', 'Technical', 'Education', 'Marketing', 'Personal'];

  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [totalPrompts, setTotalPrompts] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    content: '',
    category: 'Creative Writing',
    tags: ''
  });
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  // Load prompts on component mount and when filters change
  useEffect(() => {
    // Ensure we start with loading state
    setLoading(true);
    fetchPrompts();
  }, [searchTerm, selectedCategory]);

  // Fetch prompts from API
  const fetchPrompts = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to view your prompts.",
          variant: "destructive"
        });
        return;
      }

      // Use Supabase Edge Function instead of relative URL
      console.log('Vault - Calling Edge Function with:', { searchTerm, selectedCategory });
      const { data, error } = await supabase.functions.invoke('get-prompts', {
        body: {
          search: searchTerm,
          category: selectedCategory
        }
      });
      console.log('Vault - Edge Function response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to fetch prompts');
      }

      if (data) {
        console.log('Vault - Received data:', data);
        console.log('Vault - First prompt structure:', data.prompts?.[0]);
        setPrompts(data.prompts || []);
        setTotalPrompts(data.total || 0);
      } else {
        console.log('Vault - No data received');
        setPrompts([]);
        setTotalPrompts(0);
      }
    } catch (error) {
      console.error('Error fetching prompts:', error);
      toast({
        title: "Failed to load prompts",
        description: "There was an error loading your prompts. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePromptClick = (prompt: Prompt) => {
    navigate(`/vault/${prompt.id}`);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Prompt copied to clipboard."
    });
  };

  const handleCreatePrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to create prompts.",
          variant: "destructive"
        });
        return;
      }

      // Parse tags from comma-separated string
      const tags = createForm.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      // Create the prompt data
      const promptData = {
        title: createForm.title,
        content: createForm.content,
        category: createForm.category,
        tags: tags,
        user_id: session.user.id,
        usage_count: 0,
        starred: false,
        original_prompt: createForm.content, // Required by current schema
        generated_prompt: createForm.title,  // Required by current schema
        target_model: 'gemini-1.5-flash'    // Required by current schema
      };

      // Insert into database
      const { data, error } = await supabase
        .from('prompts')
        .insert([promptData])
        .select()
        .single();

      if (error) {
        console.error('Error creating prompt:', error);
        throw new Error(error.message || 'Failed to create prompt');
      }

      // Add to local state
      setPrompts(prev => [data, ...prev]);
      setTotalPrompts(prev => prev + 1);

      // Reset form and close modal
      setCreateForm({
        title: '',
        content: '',
        category: 'Creative Writing',
        tags: ''
      });
      setShowCreateModal(false);

      toast({
        title: "Success!",
        description: "Your prompt has been created and saved to the vault.",
      });

    } catch (error) {
      console.error('Error creating prompt:', error);
      toast({
        title: "Failed to create prompt",
        description: error instanceof Error ? error.message : "There was an error creating your prompt. Please try again.",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex-1 p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <Archive className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Prompt Vault</h1>
            <p className="text-muted-foreground">Your collection of optimized AI prompts</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search prompts, tags, or categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 glass border-glass-border focus:border-primary/50"
            />
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="glass-hover">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="glass-hover"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Prompt
            </Button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={selectedCategory === category ? "bg-primary text-primary-foreground" : "glass-hover"}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="glass border-glass-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-foreground">{totalPrompts}</p>
                <p className="text-sm text-muted-foreground">Total Prompts</p>
              </div>
              <Bookmark className="h-8 w-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-glass-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                                 <p className="text-2xl font-bold text-foreground">{prompts ? prompts.filter(p => p.starred).length : 0}</p>
                <p className="text-sm text-muted-foreground">Starred</p>
              </div>
              <Star className="h-8 w-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-glass-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                                 <p className="text-2xl font-bold text-foreground">{prompts ? prompts.reduce((sum, p) => sum + p.usage_count, 0) : 0}</p>
                <p className="text-sm text-muted-foreground">Total Uses</p>
              </div>
              <Clock className="h-8 w-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Prompts Grid */}
       {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <span className="ml-2 text-muted-foreground">Loading prompts...</span>
        </div>
      ) : (
                 <div className="grid gap-6">
           {prompts && prompts.length > 0 && prompts.map((prompt) => (
            <Card 
              key={prompt.id} 
              className="glass border-glass-border hover:border-primary/30 transition-all duration-300 cursor-pointer"
              onClick={() => handlePromptClick(prompt)}
            >
              <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    {prompt.starred && <Star className="h-4 w-4 text-yellow-400 fill-current" />}
                    {prompt.title}
                  </CardTitle>
                  <div className="flex items-center gap-4 mt-2">
                    <Badge variant="outline" className="glass-hover">
                      {prompt.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {prompt.created_at}
                    </span>
                                         <span className="text-xs text-muted-foreground">
                       Used {prompt.usage_count} times
                     </span>
                  </div>
                </div>
                
                                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={() => copyToClipboard(prompt.content)}
                   className="glass-hover"
                 >
                   <Copy className="h-4 w-4" />
                 </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                {prompt.content}
              </p>
              
                             <div className="flex items-center gap-2">
                 <Tag className="h-3 w-3 text-muted-foreground" />
                 <div className="flex gap-1 flex-wrap">
                   {prompt.tags.map((tag) => (
                     <Badge key={tag} variant="secondary" className="text-xs">
                       {tag}
                     </Badge>
                   ))}
                 </div>
               </div>
            </CardContent>
          </Card>
        ))}
      </div>
      )}

      {/* Empty State */}
      {!loading && prompts.length === 0 && (
        <div className="text-center py-12">
          <Archive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No prompts found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? "Try adjusting your search terms" : "Start building your prompt collection"}
          </p>
                     <Button 
             className="bg-primary hover:bg-primary/90 text-primary-foreground"
             onClick={() => setShowCreateModal(true)}
           >
             <Plus className="h-4 w-4 mr-2" />
             Create Your First Prompt
           </Button>
                 </div>
       )}

       {/* Create Prompt Modal */}
       {showCreateModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
           <div className="glass w-full max-w-2xl p-6 rounded-2xl relative">
             <div className="flex items-center justify-between mb-6">
               <h2 className="text-2xl font-bold text-foreground">Create New Prompt</h2>
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={() => setShowCreateModal(false)}
                 className="hover:bg-destructive/10 hover:text-destructive"
               >
                 <X className="h-5 w-5" />
               </Button>
             </div>

             <form onSubmit={handleCreatePrompt} className="space-y-4">
               <div>
                 <Label htmlFor="title" className="text-sm font-medium text-foreground">
                   Prompt Title
                 </Label>
                 <Input
                   id="title"
                   value={createForm.title}
                   onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                   placeholder="Enter a descriptive title for your prompt"
                   className="mt-1 glass border-glass-border focus:border-primary/50"
                   required
                 />
               </div>

               <div>
                 <Label htmlFor="content" className="text-sm font-medium text-foreground">
                   Prompt Content
                 </Label>
                 <Textarea
                   id="content"
                   value={createForm.content}
                   onChange={(e) => setCreateForm({ ...createForm, content: e.target.value })}
                   placeholder="Enter your prompt here..."
                   className="mt-1 glass border-glass-border focus:border-primary/50 min-h-[120px]"
                   required
                 />
               </div>

               <div>
                 <Label htmlFor="category" className="text-sm font-medium text-foreground">
                   Category
                 </Label>
                 <select
                   id="category"
                   value={createForm.category}
                   onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                   className="mt-1 w-full px-3 py-2 bg-transparent border border-glass-border rounded-md focus:outline-none focus:border-primary/50 text-foreground"
                 >
                   {categories.filter(cat => cat !== 'All').map((category) => (
                     <option key={category} value={category}>{category}</option>
                   ))}
                 </select>
               </div>

               <div>
                 <Label htmlFor="tags" className="text-sm font-medium text-foreground">
                   Tags (comma-separated)
                 </Label>
                 <Input
                   id="tags"
                   value={createForm.tags}
                   onChange={(e) => setCreateForm({ ...createForm, tags: e.target.value })}
                   placeholder="e.g., creative, writing, story"
                   className="mt-1 glass border-glass-border focus:border-primary/50"
                 />
               </div>

               <div className="flex gap-3 pt-4">
                 <Button
                   type="button"
                   variant="outline"
                   onClick={() => setShowCreateModal(false)}
                   className="flex-1 glass-hover"
                 >
                   Cancel
                 </Button>
                 <Button
                   type="submit"
                   disabled={creating}
                   className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                 >
                   {creating ? (
                     <>
                       <Loader2 className="h-4 w-4 mr-3 animate-spin" />
                       Creating...
                     </>
                   ) : (
                     <>
                       <Save className="h-4 w-4 mr-3" />
                       Create Prompt
                     </>
                   )}
                 </Button>
               </div>
             </form>
           </div>
         </div>
       )}
     </div>
   );
 };