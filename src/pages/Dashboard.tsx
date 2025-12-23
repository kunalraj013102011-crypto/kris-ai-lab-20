import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  BookOpen, 
  Cpu, 
  Box, 
  CircuitBoard, 
  FolderKanban,
} from "lucide-react";
import krisLogo from "@/assets/kris-logo.jpg";
import { KrisAIChat } from "@/components/KrisAIChat";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";

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

  const handleFeatureClick = (route: string) => {
    navigate(route);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background circuit-bg">
        <DashboardSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="border-b border-primary/30 bg-card/50 backdrop-blur-sm p-4">
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
          </header>

          {/* Main Content */}
          <main className="flex-1 container mx-auto px-4 py-8">
            <div className="relative flex items-center justify-center" style={{ minHeight: "500px" }}>
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

        {/* KRIS AI Chat */}
        <KrisAIChat open={showKrisAI} onOpenChange={setShowKrisAI} />
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
