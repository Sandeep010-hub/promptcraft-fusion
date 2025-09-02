import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PromptPerfecterTool } from "@/components/PromptPerfecterTool";
import { Vault } from "@/components/Vault";
import { useAuth } from "@/contexts/AuthContext";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { 
  LogOut, 
  Zap, 
  Archive, 
  User as UserIcon,
  Sparkles
} from "lucide-react";

export const Dashboard = () => {
  const [activeView, setActiveView] = useState<'generator' | 'vault'>('generator');
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    // Navigation will be handled by the auth state change
  };



  if (!user) {
    return null; // ProtectedRoute will handle this
  }

  return (
    <SidebarProvider>
      <Sidebar variant="inset" collapsible="offcanvas" className="bg-sidebar text-sidebar-foreground">
        <SidebarHeader>
          <div className="p-4 border-b border-glass-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">PromptCraft AI</h1>
                <p className="text-sm text-muted-foreground">AI-Powered Prompt Engineering</p>
              </div>
            </div>
            <div className="glass px-4 py-3 rounded-lg flex items-center gap-3">
              <UserIcon className="h-4 w-4 text-primary" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
                <p className="text-xs text-muted-foreground">Professional Plan</p>
              </div>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setActiveView('generator')}
                  isActive={activeView === 'generator'}
                >
                  <Zap />
                  <span>Prompt Generator</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setActiveView('vault')}
                  isActive={activeView === 'vault'}
                >
                  <Archive />
                  <span>Prompt Vault</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <div className="p-2 border-t border-glass-border">
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-destructive glass-hover"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-3" />
              Sign Out
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <div className="flex items-center gap-2 p-2 border-b border-glass-border">
          <SidebarTrigger />
          <SidebarSeparator />
          <span className="text-sm text-muted-foreground">{activeView === 'generator' ? 'Prompt Generator' : 'Prompt Vault'}</span>
        </div>
        <div className="flex-1 flex flex-col min-h-[calc(100vh-3rem)]">
          {activeView === 'generator' && <PromptPerfecterTool />}
          {activeView === 'vault' && <Vault />}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};