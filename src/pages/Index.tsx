import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import PromptingIsAllYouNeed from "@/components/PromptingIsAllYouNeed";
import { AuthModal } from "@/components/AuthModal";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, User as UserIcon } from "lucide-react";

const Index = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleCanvasClick = () => {
    if (!user) {
      setIsModalOpen(true);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Interactive Background */}
      <div 
        onClick={handleCanvasClick}
        className="absolute inset-0 cursor-pointer"
        aria-label="Click anywhere to access PromptCraft AI"
      >
        <PromptingIsAllYouNeed />
      </div>

      {/* Floating UI Elements */}
      <div className="relative z-10 pointer-events-none">
        <div className="absolute top-8 left-8">
          <div className="glass px-6 py-3 rounded-full">
            <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              PromptCraft AI
            </h1>
          </div>
        </div>

        {user && (
          <div className="absolute top-8 right-8 pointer-events-auto">
            <div className="glass px-4 py-2 rounded-full flex items-center gap-3">
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-primary" />
                <span className="text-sm text-foreground">{user.email}</span>
              </div>
              <Button
                variant="glass"
                size="sm"
                onClick={handleSignOut}
                className="glass-hover"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <div className="absolute bottom-8 right-8">
          <div className="glass px-4 py-2 rounded-lg text-sm text-muted-foreground">
            {user ? "Welcome to PromptCraft AI" : "Click anywhere to begin"}
          </div>
        </div>
      </div>

      {/* Authentication Modal */}
      <AuthModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default Index;
