import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import PromptingIsAllYouNeed from "@/components/PromptingIsAllYouNeed";
import { AuthModal } from "@/components/AuthModal";
import { Dashboard } from "@/components/Dashboard";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const Index = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleCanvasClick = () => {
    if (!user) {
      setIsModalOpen(true);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="glass p-8 rounded-2xl flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading PromptCraft AI...</p>
        </div>
      </div>
    );
  }

  // Authenticated user - show Dashboard
  if (user) {
    return <Dashboard user={user} />;
  }

  // Unauthenticated user - show landing page
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

        <div className="absolute bottom-8 right-8">
          <div className="glass px-4 py-2 rounded-lg text-sm text-muted-foreground">
            Click anywhere to begin
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
