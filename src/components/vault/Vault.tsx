import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { motion, AnimatePresence } from "framer-motion";

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full relative z-10 overflow-x-hidden">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30 shadow-[0_0_15px_rgba(0,255,255,0.3)]">
            <Archive className="h-6 w-6 text-primary drop-shadow-[0_0_5px_rgba(0,255,255,0.8)]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Prompt Vault</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Your collection of optimized AI prompts</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search prompts, tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 h-12 w-full bg-black/40 border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 shadow-inner rounded-xl transition-all"
            />
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" className="h-12 bg-black/40 border-white/10 hover:bg-white/10 rounded-xl">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button 
              className="h-12 bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow rounded-xl px-6"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Prompt
            </Button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 mt-6 overflow-x-auto pb-2 custom-scrollbar">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full px-4 border-white/10 ${selectedCategory === category ? "bg-primary text-primary-foreground shadow-glow border-primary/50" : "bg-black/40 hover:bg-white/10"}`}
            >
              {category}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        <Card className="bg-black/40 border-white/10 backdrop-blur-xl shadow-subtle hover:border-primary/30 transition-colors rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[50px] -mr-16 -mt-16 group-hover:bg-primary/20 transition-colors" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-foreground mb-1">{totalPrompts}</p>
                <p className="text-sm text-muted-foreground font-medium">Total Prompts</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <Bookmark className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-white/10 backdrop-blur-xl shadow-subtle hover:border-primary/30 transition-colors rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full blur-[50px] -mr-16 -mt-16 group-hover:bg-yellow-400/20 transition-colors" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                 <p className="text-3xl font-bold text-foreground mb-1">{prompts ? prompts.filter(p => p.starred).length : 0}</p>
                <p className="text-sm text-muted-foreground font-medium">Starred</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-yellow-400/10 flex items-center justify-center border border-yellow-400/20">
                <Star className="h-6 w-6 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-white/10 backdrop-blur-xl shadow-subtle hover:border-primary/30 transition-colors rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[50px] -mr-16 -mt-16 group-hover:bg-purple-500/20 transition-colors" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                 <p className="text-3xl font-bold text-foreground mb-1">{prompts ? prompts.reduce((sum, p) => sum + p.usage_count, 0) : 0}</p>
                <p className="text-sm text-muted-foreground font-medium">Total Uses</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                <Clock className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Prompts Grid */}
       {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-10 w-10 text-primary animate-spin mb-4 drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]" />
        </div>
      ) : (
         <motion.div 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ duration: 0.5, delay: 0.2 }}
           className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
         >
           {prompts && prompts.length > 0 && prompts.map((prompt, i) => (
            <motion.div
              key={prompt.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <Card 
                className="bg-black/40 border-white/10 hover:border-primary/50 transition-colors duration-300 cursor-pointer rounded-2xl overflow-hidden h-full flex flex-col group shadow-subtle hover:shadow-glow"
                onClick={() => handlePromptClick(prompt)}
              >
                <CardHeader className="pb-3 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-4">
                    <CardTitle className="flex items-center gap-2 text-lg leading-tight group-hover:text-primary transition-colors">
                      {prompt.starred && <Star className="h-4 w-4 text-yellow-400 fill-current drop-shadow-[0_0_5px_rgba(250,204,21,0.8)] shrink-0" />}
                      <span className="line-clamp-2">{prompt.title}</span>
                    </CardTitle>
                    <div className="flex items-center gap-3 mt-3">
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        {prompt.category}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(prompt.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <Button
                     variant="ghost"
                     size="icon"
                     onClick={(e) => { e.stopPropagation(); copyToClipboard(prompt.content); }}
                     className="h-8 w-8 rounded-full bg-white/5 hover:bg-primary hover:text-primary-foreground border border-white/10 opacity-0 group-hover:opacity-100 transition-all shadow-glass"
                   >
                     <Copy className="h-3.5 w-3.5" />
                   </Button>
                </div>
              </CardHeader>
              
              <CardContent className="pt-4 flex-1 flex flex-col">
                <p className="text-sm text-muted-foreground mb-4 line-clamp-4 leading-relaxed flex-1">
                  {prompt.content}
                </p>
                
                <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                   <div className="flex items-center gap-2 overflow-hidden">
                     <Tag className="h-3.5 w-3.5 text-primary/50 shrink-0" />
                     <div className="flex gap-1.5 flex-wrap">
                       {prompt.tags.slice(0, 3).map((tag) => (
                         <Badge key={tag} variant="secondary" className="text-[10px] bg-white/5 hover:bg-white/10 px-2 py-0.5">
                           {tag}
                         </Badge>
                       ))}
                       {prompt.tags.length > 3 && (
                         <Badge variant="secondary" className="text-[10px] bg-white/5 px-2 py-0.5">
                           +{prompt.tags.length - 3}
                         </Badge>
                       )}
                     </div>
                   </div>
                   <span className="text-[11px] font-medium text-muted-foreground bg-white/5 px-2 py-1 rounded-md shrink-0">
                     {prompt.usage_count} uses
                   </span>
                 </div>
              </CardContent>
            </Card>
           </motion.div>
        ))}
      </motion.div>
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
                  <Select
                    value={createForm.category}
                    onValueChange={(value) => setCreateForm({ ...createForm, category: value })}
                  >
                    <SelectTrigger id="category" className="mt-1 w-full glass border-glass-border focus:border-primary/50">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(cat => cat !== 'All').map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
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
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
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