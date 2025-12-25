import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  Brain, 
  BookOpen, 
  Cpu, 
  Box, 
  CircuitBoard, 
  FolderKanban,
  Lock,
  ArrowRight,
} from "lucide-react";
import krisLogo from "@/assets/kris-logo.jpg";
import { KrisAIChat } from "@/components/KrisAIChat";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

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
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleFeatureClick = (route: string) => {
    if (!session) {
      setShowLoginModal(true);
      return;
    }
    navigate(route);
  };

  const handleChatClick = () => {
    if (!session) {
      setShowLoginModal(true);
      return;
    }
    setShowKrisAI(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background circuit-bg flex items-center justify-center">
        <div className="text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background circuit-bg">
        <DashboardSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="border-b border-primary/30 bg-card/50 backdrop-blur-sm p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div className="flex items-center gap-3">
                  <img 
                    src={krisLogo} 
                    alt="KRIS" 
                    className="w-10 h-10 rounded-full neon-border"
                  />
                  <div>
                    <h1 className="text-xl font-semibold text-primary">KRIS LABORATORY</h1>
                    <p className="text-xs text-muted-foreground">Virtual Innovation Lab</p>
                  </div>
                </div>
              </div>
              
              {!session && (
                <Button 
                  size="sm" 
                  onClick={() => navigate("/auth")}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Sign In
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 container mx-auto px-4 py-8">
            <div className="relative flex items-center justify-center" style={{ minHeight: "500px" }}>
              {/* Center Logo */}
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="text-center">
                  <button 
                    onClick={handleChatClick}
                    className="transition-transform hover:scale-105"
                  >
                    <img 
                      src={krisLogo} 
                      alt="KRIS AI" 
                      className="w-40 h-40 mx-auto rounded-full neon-border pulse-glow mb-4 cursor-pointer"
                    />
                  </button>
                  <h2 className="text-2xl font-semibold text-primary">K.R.I.S LAB</h2>
                  <p className="text-sm text-muted-foreground mt-1">Click to chat with KRIS AI</p>
                </div>
              </div>

              {/* Circular Feature Layout */}
              <div className="relative w-full max-w-3xl aspect-square">
                {features.map((feature, index) => {
                  const angle = (index * 360) / features.length - 90;
                  const radius = 40;
                  const x = 50 + radius * Math.cos((angle * Math.PI) / 180);
                  const y = 50 + radius * Math.sin((angle * Math.PI) / 180);

                  return (
                    <button
                      key={feature.id}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-20"
                      style={{ left: `${x}%`, top: `${y}%` }}
                      onClick={() => handleFeatureClick(feature.route)}
                    >
                      <div className="bg-card/80 backdrop-blur-sm border border-primary/40 rounded-lg p-4 w-36 hover:border-primary/70 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                        <div className="flex flex-col items-center gap-2">
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

          {/* Footer Badge */}
          <footer className="p-4 text-center">
            <Badge variant="outline" className="border-primary/50 bg-card/80">
              Created by Kunal Raj
            </Badge>
          </footer>
        </div>

        {/* KRIS AI Chat - only shown if logged in */}
        {session && <KrisAIChat open={showKrisAI} onOpenChange={setShowKrisAI} />}

        {/* Login Modal */}
        <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
          <DialogContent className="bg-card border-primary/30 max-w-md">
            <DialogHeader>
              <div className="flex justify-center mb-4">
                <img 
                  src={krisLogo} 
                  alt="KRIS" 
                  className="w-16 h-16 rounded-full neon-border"
                />
              </div>
              <DialogTitle className="text-center text-xl text-primary">
                Sign In Required
              </DialogTitle>
              <DialogDescription className="text-center">
                Please sign in to access KRIS AI Chat and all lab features!
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-3 my-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Brain className="w-5 h-5 text-primary" />
                <span className="text-sm">Unlimited AI conversations</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Cpu className="w-5 h-5 text-primary" />
                <span className="text-sm">Full simulation & 3D lab access</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <FolderKanban className="w-5 h-5 text-primary" />
                <span className="text-sm">Save & manage your projects</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button 
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => navigate("/auth")}
              >
                <Lock className="w-4 h-4 mr-2" />
                Sign In / Sign Up
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
