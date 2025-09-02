import { useState } from "react";
import PromptingIsAllYouNeed from "@/components/PromptingIsAllYouNeed";
import { AuthModal } from "@/components/AuthModal";

const Index = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCanvasClick = () => {
    setIsModalOpen(true);
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
