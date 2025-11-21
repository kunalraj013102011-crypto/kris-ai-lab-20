import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  BookOpen, 
  Cpu, 
  Box, 
  CircuitBoard, 
  FolderKanban,
  LogOut,
  Info,
  Mail
} from "lucide-react";
import krisLogo from "@/assets/kris-logo.jpg";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { KrisAIChat } from "@/components/KrisAIChat";

interface Feature {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  route: string;
}

const features: Feature[] = [
  {
    id: "ai-scientist",
    title: "AI Scientist",
    icon: <Brain className="w-8 h-8" />,
    description: "Expert team for project guidance",
    route: "/ai-scientist"
  },
  {
    id: "learning-hub",
    title: "Learning Hub",
    icon: <BookOpen className="w-8 h-8" />,
    description: "Daily lessons and project analysis",
    route: "/learning-hub"
  },
  {
    id: "simulation",
    title: "Simulation",
    icon: <Cpu className="w-8 h-8" />,
    description: "Project simulation engine",
    route: "/simulation"
  },
  {
    id: "3d-lab",
    title: "3D Lab",
    icon: <Box className="w-8 h-8" />,
    description: "3D engineering projects",
    route: "/3d-lab"
  },
  {
    id: "circuit-canvas",
    title: "Circuit Canvas",
    icon: <CircuitBoard className="w-8 h-8" />,
    description: "Electronic circuit designer",
    route: "/circuit-canvas"
  },
  {
    id: "project-manager",
    title: "Project Manager",
    icon: <FolderKanban className="w-8 h-8" />,
    description: "Coordination and management",
    route: "/project-manager"
  }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [showKrisAI, setShowKrisAI] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "Successfully logged out from KRIS Laboratory.",
    });
    navigate("/auth");
  };

  const handleFeatureClick = (route: string) => {
    navigate(route);
  };

  return (
    <div className="min-h-screen bg-background circuit-bg relative overflow-hidden">
      {/* Header */}
      <header className="border-b border-primary/30 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img 
              src={krisLogo} 
              alt="KRIS" 
              className="w-12 h-12 rounded-full neon-border"
            />
            <div>
              <h1 className="text-xl font-semibold text-primary">KRIS LABORATORY</h1>
              <p className="text-xs text-muted-foreground">Kunal Raj Intelligence System</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/about")}
              className="hover:bg-primary/20"
              title="About"
            >
              <Info className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/contact")}
              className="hover:bg-primary/20"
              title="Contact"
            >
              <Mail className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="border-primary/50 hover:bg-primary/20"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="relative flex items-center justify-center" style={{ minHeight: "600px" }}>
          {/* Center Logo */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center">
              <button 
                onClick={() => setShowKrisAI(true)}
                className="transition-transform hover:scale-105"
              >
                <img 
                  src={krisLogo} 
                  alt="KRIS AI" 
                  className="w-48 h-48 mx-auto rounded-full neon-border pulse-glow mb-4 cursor-pointer"
                />
              </button>
              <h2 className="text-3xl font-semibold text-primary">K.R.I.S LAB</h2>
              <p className="text-base text-muted-foreground mt-2">Kunal Raj Intelligence System</p>
              <p className="text-sm text-muted-foreground/80 mt-1">Select a module to begin</p>
            </div>
          </div>

          {/* Circular Feature Layout */}
          <div className="relative w-full max-w-4xl aspect-square">
            {features.map((feature, index) => {
              const angle = (index * 360) / features.length - 90; // Start from top
              const radius = 38; // percentage - closer to center
              const x = 50 + radius * Math.cos((angle * Math.PI) / 180);
              const y = 50 + radius * Math.sin((angle * Math.PI) / 180);

              return (
                <button
                  key={feature.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-20"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                  }}
                  onClick={() => handleFeatureClick(feature.route)}
                >
                  <div className="bg-card/80 backdrop-blur-sm border border-primary/40 rounded-lg p-5 w-44 hover:border-primary/70 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                    <div className="flex flex-col items-center gap-2.5">
                      <div className="text-primary group-hover:scale-110 transition-transform">
                        {feature.icon}
                      </div>
                      <h3 className="font-medium text-sm text-foreground text-center">
                        {feature.title}
                      </h3>
                      <p className="text-xs text-muted-foreground text-center leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer Badge - Right Corner */}
      <footer className="fixed bottom-4 right-4 z-50">
        <Badge variant="outline" className="border-primary/50 bg-card/80 backdrop-blur-sm">
          Created by Kunal Raj
        </Badge>
      </footer>

      {/* KRIS AI Chat */}
      <KrisAIChat open={showKrisAI} onOpenChange={setShowKrisAI} />
    </div>
  );
};

export default Dashboard;
