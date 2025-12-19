import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Plus,
  Users,
  FolderKanban,
  Clock,
  ArrowLeft,
  UserPlus,
  Loader2,
  Settings,
  Trash2,
  Mail,
} from "lucide-react";

interface WorkspaceProject {
  id: string;
  title: string;
  description: string | null;
  current_phase: string;
  status: string;
  created_at: string;
  created_by: string;
}

interface WorkspaceMember {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
}

interface WorkspaceData {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
}

const WorkspaceDetail = () => {
  const navigate = useNavigate();
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [workspace, setWorkspace] = useState<WorkspaceData | null>(null);
  const [projects, setProjects] = useState<WorkspaceProject[]>([]);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [newProject, setNewProject] = useState({ title: "", description: "" });
  const [inviteEmail, setInviteEmail] = useState("");
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, [workspaceId]);

  useEffect(() => {
    if (!workspaceId || !userId) return;

    // Subscribe to real-time updates for projects
    const channel = supabase
      .channel(`workspace-${workspaceId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "workspace_projects",
          filter: `workspace_id=eq.${workspaceId}`,
        },
        () => {
          fetchProjects();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workspaceId, userId]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setUserId(user.id);
    if (workspaceId) {
      fetchWorkspaceData();
    }
  };

  const fetchWorkspaceData = async () => {
    if (!workspaceId) return;
    setLoading(true);

    try {
      // Fetch workspace details
      const { data: wsData, error: wsError } = await supabase
        .from("workspaces")
        .select("*")
        .eq("id", workspaceId)
        .single();

      if (wsError) throw wsError;
      setWorkspace(wsData);

      await Promise.all([fetchProjects(), fetchMembers()]);
    } catch (error) {
      console.error("Error fetching workspace:", error);
      toast({
        title: "Error",
        description: "Failed to load workspace",
        variant: "destructive",
      });
      navigate("/workspace");
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    if (!workspaceId) return;

    const { data, error } = await supabase
      .from("workspace_projects")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching projects:", error);
      return;
    }

    setProjects(data || []);
  };

  const fetchMembers = async () => {
    if (!workspaceId) return;

    const { data, error } = await supabase
      .from("workspace_members")
      .select("*")
      .eq("workspace_id", workspaceId);

    if (error) {
      console.error("Error fetching members:", error);
      return;
    }

    setMembers(data || []);
  };

  const createProject = async () => {
    if (!userId || !workspaceId || !newProject.title.trim()) return;

    setCreating(true);
    try {
      const { error } = await supabase
        .from("workspace_projects")
        .insert({
          workspace_id: workspaceId,
          title: newProject.title.trim(),
          description: newProject.description.trim() || null,
          created_by: userId,
        });

      if (error) throw error;

      toast({
        title: "Project Created",
        description: `"${newProject.title}" has been created.`,
      });

      setNewProject({ title: "", description: "" });
      setProjectDialogOpen(false);
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const inviteMember = async () => {
    if (!workspaceId || !userId || !inviteEmail.trim()) return;

    setInviting(true);
    try {
      const { error } = await supabase
        .from("workspace_invitations")
        .insert({
          workspace_id: workspaceId,
          email: inviteEmail.trim().toLowerCase(),
          invited_by: userId,
        });

      if (error) throw error;

      toast({
        title: "Invitation Sent",
        description: `Invitation sent to ${inviteEmail}`,
      });

      setInviteEmail("");
      setInviteDialogOpen(false);
    } catch (error: any) {
      console.error("Error inviting member:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send invitation",
        variant: "destructive",
      });
    } finally {
      setInviting(false);
    }
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
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background circuit-bg">
          <DashboardSidebar />
          <main className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background circuit-bg">
        <DashboardSidebar />
        <main className="flex-1 overflow-auto">
          <header className="border-b border-primary/30 bg-card/50 backdrop-blur-sm p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <Button variant="ghost" size="sm" onClick={() => navigate("/workspace")}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-primary neon-glow">{workspace?.name}</h1>
                  <p className="text-sm text-muted-foreground">{workspace?.description || "Collaborative workspace"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <UserPlus className="w-4 h-4" />
                      Invite
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Invite Team Member</DialogTitle>
                      <DialogDescription>
                        Send an invitation to collaborate on this workspace.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="colleague@example.com"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={inviteMember} disabled={inviting || !inviteEmail.trim()}>
                        {inviting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Send Invitation
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="w-4 h-4" />
                      New Project
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Project</DialogTitle>
                      <DialogDescription>
                        Create a collaborative project that all team members can access.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Project Title</Label>
                        <Input
                          id="title"
                          placeholder="Enter project title"
                          value={newProject.title}
                          onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="desc">Description (optional)</Label>
                        <Textarea
                          id="desc"
                          placeholder="Describe your project"
                          value={newProject.description}
                          onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setProjectDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={createProject} disabled={creating || !newProject.title.trim()}>
                        {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Create Project
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </header>

          <div className="p-6">
            <Tabs defaultValue="projects" className="space-y-6">
              <TabsList>
                <TabsTrigger value="projects" className="gap-2">
                  <FolderKanban className="w-4 h-4" />
                  Projects ({projects.length})
                </TabsTrigger>
                <TabsTrigger value="members" className="gap-2">
                  <Users className="w-4 h-4" />
                  Members ({members.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="projects">
                {projects.length === 0 ? (
                  <div className="text-center py-16">
                    <FolderKanban className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h2 className="text-xl font-semibold mb-2">No Projects Yet</h2>
                    <p className="text-muted-foreground mb-6">
                      Create your first project to start collaborating.
                    </p>
                    <Button onClick={() => setProjectDialogOpen(true)} className="gap-2">
                      <Plus className="w-4 h-4" />
                      Create First Project
                    </Button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                      <Card
                        key={project.id}
                        className="bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all cursor-pointer group"
                        onClick={() => navigate(`/workspace/${workspaceId}/project/${project.id}`)}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-lg group-hover:text-primary transition-colors">
                              {project.title}
                            </CardTitle>
                            <Badge className={getPhaseColor(project.current_phase)}>
                              {project.current_phase}
                            </Badge>
                          </div>
                          <CardDescription>
                            {project.description || "No description"}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(project.created_at).toLocaleDateString()}
                            </div>
                            <Badge variant="outline">{project.status}</Badge>
                          </div>
                          <p className="text-xs text-primary mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            Click to open KRIS Laboratory →
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="members">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {members.map((member) => (
                    <Card key={member.id} className="bg-card/50 backdrop-blur-sm border-primary/20">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                            <Users className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">Team Member</p>
                            <p className="text-sm text-muted-foreground">{member.role}</p>
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {member.role}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-3">
                          Joined {new Date(member.joined_at).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default WorkspaceDetail;