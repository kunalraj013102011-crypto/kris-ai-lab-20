import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft,
  Brain,
  Cpu,
  Box,
  Activity,
  GraduationCap,
  ImageIcon,
  MessageSquare,
  Loader2,
  Users,
  Clock,
  Zap,
} from "lucide-react";

interface ProjectData {
  id: string;
  title: string;
  description: string | null;
  current_phase: string;
  status: string;
  workspace_id: string;
  created_at: string;
}

interface WorkspaceData {
  id: string;
  name: string;
}

interface ActiveUser {
  user_id: string;
  email?: string;
  last_seen: string;
}

const modules = [
  {
    id: "ai-scientist",
    title: "AI Scientist",
    description: "Ask KRIS about STEM problems and get intelligent responses",
    icon: Brain,
    color: "from-purple-500 to-pink-500",
    path: "/ai-scientist",
  },
  {
    id: "circuit-canvas",
    title: "Circuit Canvas",
    description: "Design and visualize electronic circuits collaboratively",
    icon: Cpu,
    color: "from-blue-500 to-cyan-500",
    path: "/circuit-canvas",
  },
  {
    id: "3d-lab",
    title: "3D Lab",
    description: "Create and manipulate 3D models together",
    icon: Box,
    color: "from-green-500 to-emerald-500",
    path: "/3d-lab",
  },
  {
    id: "simulation",
    title: "Simulation",
    description: "Run experiments and simulations in real-time",
    icon: Activity,
    color: "from-orange-500 to-red-500",
    path: "/simulation",
  },
  {
    id: "learning-hub",
    title: "Learning Hub",
    description: "Access shared educational resources and tutorials",
    icon: GraduationCap,
    color: "from-indigo-500 to-purple-500",
    path: "/learning-hub",
  },
  {
    id: "image-creator",
    title: "Image Creator",
    description: "Generate AI images for your project",
    icon: ImageIcon,
    color: "from-pink-500 to-rose-500",
    path: "/dashboard",
  },
];

const WorkspaceProjectDashboard = () => {
  const navigate = useNavigate();
  const { workspaceId, projectId } = useParams<{ workspaceId: string; projectId: string }>();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [workspace, setWorkspace] = useState<WorkspaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, [projectId, workspaceId]);

  useEffect(() => {
    if (!projectId || !userId) return;

    // Set up presence channel for real-time collaboration
    const channel = supabase.channel(`project-presence-${projectId}`);

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const users: ActiveUser[] = [];
        Object.values(state).forEach((presence: any) => {
          presence.forEach((p: any) => {
            users.push({
              user_id: p.user_id,
              email: p.email,
              last_seen: new Date().toISOString(),
            });
          });
        });
        setActiveUsers(users);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          const { data: { user } } = await supabase.auth.getUser();
          await channel.track({
            user_id: userId,
            email: user?.email,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, userId]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setUserId(user.id);
    if (projectId && workspaceId) {
      fetchProjectData();
    }
  };

  const fetchProjectData = async () => {
    if (!projectId || !workspaceId) return;
    setLoading(true);

    try {
      const [projectRes, workspaceRes] = await Promise.all([
        supabase
          .from("workspace_projects")
          .select("*")
          .eq("id", projectId)
          .eq("workspace_id", workspaceId)
          .single(),
        supabase
          .from("workspaces")
          .select("id, name")
          .eq("id", workspaceId)
          .single(),
      ]);

      if (projectRes.error) throw projectRes.error;
      if (workspaceRes.error) throw workspaceRes.error;

      setProject(projectRes.data);
      setWorkspace(workspaceRes.data);
    } catch (error) {
      console.error("Error fetching project:", error);
      toast({
        title: "Error",
        description: "Failed to load project",
        variant: "destructive",
      });
      navigate(`/workspace/${workspaceId}`);
    } finally {
      setLoading(false);
    }
  };

  const handleModuleClick = (module: typeof modules[0]) => {
    // Navigate to module with project context
    navigate(`${module.path}?workspaceId=${workspaceId}&projectId=${projectId}`);
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case "planning": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "design": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "development": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "testing": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "completed": return "bg-green-500/20 text-green-400 border-green-500/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background circuit-bg">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background circuit-bg">
      {/* Header */}
      <header className="border-b border-primary/30 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate(`/workspace/${workspaceId}`)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Workspace
              </Button>
              <div className="h-6 w-px bg-border" />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-primary neon-glow">{project?.title}</h1>
                  <Badge className={getPhaseColor(project?.current_phase || "")}>
                    {project?.current_phase}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {workspace?.name} • Collaborative Project
                </p>
              </div>
            </div>

            {/* Active Users */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{activeUsers.length} online</span>
              </div>
              <div className="flex -space-x-2">
                {activeUsers.slice(0, 5).map((user, index) => (
                  <Avatar key={user.user_id} className="w-8 h-8 border-2 border-background">
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                      {user.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {activeUsers.length > 5 && (
                  <Avatar className="w-8 h-8 border-2 border-background">
                    <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                      +{activeUsers.length - 5}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Project Info */}
        <div className="mb-8">
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-muted-foreground">
                    {project?.description || "No description provided"}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Created {new Date(project?.created_at || "").toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="w-4 h-4 text-primary" />
                      Real-time collaboration enabled
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="capitalize">
                  {project?.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* KRIS Lab Title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-primary neon-glow mb-2">
            KRIS Laboratory
          </h2>
          <p className="text-muted-foreground">
            Access powerful modules to collaborate on your project
          </p>
        </div>

        {/* Module Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => (
            <Card
              key={module.id}
              className="bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/50 transition-all cursor-pointer group overflow-hidden"
              onClick={() => handleModuleClick(module)}
            >
              <CardHeader className="relative">
                <div className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
                <div className="relative z-10 flex items-center gap-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${module.color}`}>
                    <module.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <CardDescription>{module.description}</CardDescription>
                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <Users className="w-3 h-3" />
                  <span>Collaborative</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Chat */}
        <div className="mt-8">
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Team Communication</CardTitle>
                  <CardDescription>
                    Discuss project details with your team members
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Team chat coming soon</p>
                <p className="text-sm">Use the AI Scientist module for collaborative discussions</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default WorkspaceProjectDashboard;
