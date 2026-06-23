import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PromptPerfecterTool } from "@/components/generator/PromptPerfecterTool";
import { Vault } from "@/components/vault/Vault";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
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
  RiLogoutBoxRLine, 
  RiFlashlightLine, 
  RiArchiveDrawerLine, 
  RiUser3Line,
  RiMagicLine,
  RiSearch2Line,
  RiNotification3Line
} from "react-icons/ri";
import { SiPolestar } from "react-icons/si";

export const Dashboard = () => {
  const [activeView, setActiveView] = useState<'generator' | 'vault'>(
    window.location.hash === '#vault' ? 'vault' : 'generator'
  );
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#vault') setActiveView('vault');
      else if (window.location.hash === '#generator' || !window.location.hash) setActiveView('generator');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSignOut = async () => {
    await signOut();
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none transform -translate-y-1/2" />

      <SidebarProvider>
        <Sidebar variant="floating" collapsible="icon" className="border-r-0 bg-transparent">
          <SidebarHeader>
            <div className="p-3 group-data-[collapsible=icon]:p-0 border border-white/10 group-data-[collapsible=icon]:border-transparent rounded-2xl bg-black/40 group-data-[collapsible=icon]:bg-transparent backdrop-blur-xl shadow-glass mb-4 group hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-2.5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-full">
                <div className="w-10 h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20 group-hover:border-primary/40 transition-colors mx-auto shrink-0 shadow-[0_0_15px_rgba(var(--primary),0.15)]">
                  <SiPolestar className="h-5 w-5 group-data-[collapsible=icon]:w-5 group-data-[collapsible=icon]:h-5 text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                </div>
                <div className="group-data-[collapsible=icon]:hidden flex items-center">
                  <h1 className="text-xl font-bold text-foreground leading-none tracking-tight">PromptCraft</h1>
                </div>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="px-2 group-data-[collapsible=icon]:px-0">
            <SidebarGroup className="group-data-[collapsible=icon]:p-0">
              <SidebarGroupLabel className="text-muted-foreground/70 px-2 group-data-[collapsible=icon]:hidden">Menu</SidebarGroupLabel>
              <SidebarMenu className="gap-2 mt-2">
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => { setActiveView('generator'); window.location.hash = 'generator'; }}
                    isActive={activeView === 'generator'}
                    className={`rounded-xl h-11 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mx-auto transition-all ${activeView === 'generator' ? 'bg-primary/15 text-primary border border-primary/30 shadow-glow' : 'hover:bg-white/5 text-muted-foreground'}`}
                    tooltip="Generator"
                  >
                    <RiFlashlightLine className={activeView === 'generator' ? 'text-primary' : ''} />
                    <span className="font-medium group-data-[collapsible=icon]:hidden">Generator</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => { setActiveView('vault'); window.location.hash = 'vault'; }}
                    isActive={activeView === 'vault'}
                    className={`rounded-xl h-11 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mx-auto transition-all ${activeView === 'vault' ? 'bg-primary/15 text-primary border border-primary/30 shadow-glow' : 'hover:bg-white/5 text-muted-foreground'}`}
                    tooltip="Vault"
                  >
                    <RiArchiveDrawerLine className={activeView === 'vault' ? 'text-primary' : ''} />
                    <span className="font-medium group-data-[collapsible=icon]:hidden">Vault</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <div className="p-2 group-data-[collapsible=icon]:p-0 border border-white/10 group-data-[collapsible=icon]:border-transparent rounded-2xl bg-black/40 group-data-[collapsible=icon]:bg-transparent backdrop-blur-xl mt-auto group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:w-full">
              <div className="flex items-center gap-3 p-2 group-data-[collapsible=icon]:hidden mb-2">
                <RiUser3Line className="h-4 w-4 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{user.email}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl h-10 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:!justify-center group-data-[collapsible=icon]:!w-10 group-data-[collapsible=icon]:!h-10"
                onClick={handleSignOut}
              >
                <RiLogoutBoxRLine className="h-4 w-4 group-data-[collapsible=icon]:!mr-0 mr-3" />
                <span className="group-data-[collapsible=icon]:hidden">Sign Out</span>
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="bg-transparent flex flex-col p-4 md:p-4 md:pl-0">
          {/* Top Navigation */}
          <header className="flex h-16 items-center gap-2 sm:gap-4 rounded-2xl bg-black/40 border border-white/10 px-4 sm:px-6 backdrop-blur-xl shadow-glass mb-4 z-10 shrink-0">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="h-8 w-8 hover:bg-white/10 text-foreground" />
              <SidebarSeparator className="h-5 w-[1px] bg-white/20 mx-2" />
              <h2 className="text-sm font-semibold tracking-wide text-foreground">
                {activeView === 'generator' ? 'Prompt Perfecter' : 'Prompt Vault'}
              </h2>
            </div>
            
            <div className="ml-auto flex items-center gap-4">
              <div className="relative hidden md:flex items-center">
                <RiSearch2Line className="absolute left-3 h-4 w-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search prompts..." 
                  className="h-9 w-64 rounded-full bg-white/5 border border-white/10 pl-9 pr-4 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
                />
              </div>
              <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 hover:bg-white/10 border border-transparent hover:border-white/10">
                <RiNotification3Line className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col relative z-10 bg-black/40 border border-white/10 rounded-2xl backdrop-blur-xl shadow-glass overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex-1 h-full overflow-y-auto"
              >
                {activeView === 'generator' ? <PromptPerfecterTool /> : <Vault />}
              </motion.div>
            </AnimatePresence>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};