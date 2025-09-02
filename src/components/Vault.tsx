import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Archive, 
  Search, 
  Copy, 
  Star, 
  Clock, 
  Tag,
  Plus,
  Bookmark,
  Filter
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data - replace with actual Supabase integration
const mockPrompts = [
  {
    id: 1,
    title: "Marketing Copy Generator",
    content: "You are an expert marketing copywriter. Create compelling, conversion-focused copy for [product/service]. Focus on benefits, address pain points, and include a strong call-to-action...",
    category: "Marketing",
    tags: ["copywriting", "conversion", "sales"],
    starred: true,
    createdAt: "2024-01-15",
    usageCount: 42
  },
  {
    id: 2,
    title: "Code Review Assistant",
    content: "Act as a senior software engineer conducting a thorough code review. Analyze the provided code for bugs, performance issues, security vulnerabilities, and adherence to best practices...",
    category: "Development",
    tags: ["code-review", "programming", "best-practices"],
    starred: false,
    createdAt: "2024-01-10",
    usageCount: 28
  },
  {
    id: 3,
    title: "Content Strategy Planner",
    content: "You are a content strategist with 10+ years of experience. Help me create a comprehensive content strategy for [industry/niche]. Include content pillars, posting frequency, and engagement tactics...",
    category: "Content",
    tags: ["strategy", "content-marketing", "planning"],
    starred: true,
    createdAt: "2024-01-08",
    usageCount: 35
  }
];

export const Vault = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { toast } = useToast();

  const categories = ["All", "Marketing", "Development", "Content", "Analysis", "Writing"];

  const filteredPrompts = mockPrompts.filter(prompt => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === "All" || prompt.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Prompt copied to clipboard."
    });
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
            <Button variant="outline" size="sm" className="glass-hover">
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
                <p className="text-2xl font-bold text-foreground">24</p>
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
                <p className="text-2xl font-bold text-foreground">8</p>
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
                <p className="text-2xl font-bold text-foreground">156</p>
                <p className="text-sm text-muted-foreground">Total Uses</p>
              </div>
              <Clock className="h-8 w-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Prompts Grid */}
      <div className="grid gap-6">
        {filteredPrompts.map((prompt) => (
          <Card key={prompt.id} className="glass border-glass-border hover:border-primary/30 transition-all duration-300">
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
                      {prompt.createdAt}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Used {prompt.usageCount} times
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

      {/* Empty State */}
      {filteredPrompts.length === 0 && (
        <div className="text-center py-12">
          <Archive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No prompts found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? "Try adjusting your search terms" : "Start building your prompt collection"}
          </p>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Prompt
          </Button>
        </div>
      )}
    </div>
  );
};