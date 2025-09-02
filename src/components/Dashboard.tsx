import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PromptPerfecterTool } from "@/components/PromptPerfecterTool";
import { Vault } from "@/components/Vault";
import { 
  LogOut, 
  Zap, 
  Archive, 
  User as UserIcon,
  Sparkles
} from "lucide-react";

interface DashboardProps {
  user: User;
}

export const Dashboard = ({ user }: DashboardProps) => {
  const [activeView, setActiveView] = useState<'generator' | 'vault'>('generator');

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-80 glass border-r border-glass-border flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-glass-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">PromptCraft AI</h1>
              <p className="text-sm text-muted-foreground">AI-Powered Prompt Engineering</p>
            </div>
          </div>
          
          {/* User Info */}
          <div className="glass px-4 py-3 rounded-lg flex items-center gap-3">
            <UserIcon className="h-4 w-4 text-primary" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
              <p className="text-xs text-muted-foreground">Professional Plan</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-6">
          <nav className="space-y-2">
            <Button
              variant={activeView === 'generator' ? 'default' : 'ghost'}
              className={`w-full justify-start glass-hover ${
                activeView === 'generator' 
                  ? 'bg-primary text-primary-foreground glow-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveView('generator')}
            >
              <Zap className="h-4 w-4 mr-3" />
              Prompt Generator
            </Button>
            
            <Button
              variant={activeView === 'vault' ? 'default' : 'ghost'}
              className={`w-full justify-start glass-hover ${
                activeView === 'vault' 
                  ? 'bg-primary text-primary-foreground glow-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveView('vault')}
            >
              <Archive className="h-4 w-4 mr-3" />
              Prompt Vault
            </Button>
          </nav>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-glass-border">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-destructive glass-hover"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-3" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {activeView === 'generator' && <PromptPerfecterTool />}
        {activeView === 'vault' && <Vault />}
      </div>
    </div>
  );
};