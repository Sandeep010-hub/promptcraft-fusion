import { useState } from "react";
import { Navigate } from "react-router-dom";
import PromptingIsAllYouNeed from "@/components/landing/PromptingIsAllYouNeed";
import { AuthModal } from "@/components/auth/AuthModal";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, loading } = useAuth();

  // If user is authenticated, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

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
          <div className="h-8 w-8 text-primary animate-spin">⏳</div>
          <p className="text-muted-foreground">Loading PromptCraft AI...</p>
        </div>
      </div>
    );
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
        <div className="absolute top-4 left-4 sm:top-8 sm:left-8">
          <div className="glass px-6 py-3 rounded-full">
            <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              PromptCraft AI
            </h1>
          </div>
        </div>

        <div className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8">
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
