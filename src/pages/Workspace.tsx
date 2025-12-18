import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Plus,
  Users,
  FolderKanban,
  Clock,
  ArrowRight,
  UserPlus,
  Loader2,
  Layers,
} from "lucide-react";

interface Workspace {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  created_at: string;
  member_count?: number;
  project_count?: number;
}

const Workspace = () => {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newWorkspace, setNewWorkspace] = useState({ name: "", description: "" });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setUserId(user.id);
    fetchWorkspaces(user.id);
  };

  const fetchWorkspaces = async (uid: string) => {
    setLoading(true);
    try {
      // Get workspaces where user is a member
      const { data: memberData, error: memberError } = await supabase
        .from("workspace_members")
        .select("workspace_id")
        .eq("user_id", uid);

      if (memberError) throw memberError;

      if (!memberData || memberData.length === 0) {
        setWorkspaces([]);
        setLoading(false);
        return;
      }

      const workspaceIds = memberData.map(m => m.workspace_id);

      // Get workspace details
      const { data: workspacesData, error: workspacesError } = await supabase
        .from("workspaces")
        .select("*")
        .in("id", workspaceIds);

      if (workspacesError) throw workspacesError;

      // Get member counts and project counts
      const workspacesWithCounts = await Promise.all(
        (workspacesData || []).map(async (ws) => {
          const { count: memberCount } = await supabase
            .from("workspace_members")
            .select("*", { count: "exact", head: true })
            .eq("workspace_id", ws.id);

          const { count: projectCount } = await supabase
            .from("workspace_projects")
            .select("*", { count: "exact", head: true })
            .eq("workspace_id", ws.id);

          return {
            ...ws,
            member_count: memberCount || 0,
            project_count: projectCount || 0,
          };
        })
      );

      setWorkspaces(workspacesWithCounts);
    } catch (error) {
      console.error("Error fetching workspaces:", error);
      toast({
        title: "Error",
        description: "Failed to load workspaces",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createWorkspace = async () => {
    if (!userId || !newWorkspace.name.trim()) return;

    setCreating(true);
    try {
      // Create workspace
      const { data: workspace, error: wsError } = await supabase
        .from("workspaces")
        .insert({
          name: newWorkspace.name.trim(),
          description: newWorkspace.description.trim() || null,
          owner_id: userId,
        })
        .select()
        .single();

      if (wsError) throw wsError;

      // Add creator as owner member
      const { error: memberError } = await supabase
        .from("workspace_members")
        .insert({
          workspace_id: workspace.id,
          user_id: userId,
          role: "owner",
        });

      if (memberError) throw memberError;

      toast({
        title: "Workspace Created",
        description: `"${workspace.name}" has been created successfully.`,
      });

      setNewWorkspace({ name: "", description: "" });
      setDialogOpen(false);
      fetchWorkspaces(userId);
    } catch (error) {
      console.error("Error creating workspace:", error);
      toast({
        title: "Error",
        description: "Failed to create workspace",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const enterWorkspace = (workspaceId: string) => {
    navigate(`/workspace/${workspaceId}`);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background circuit-bg">
        <DashboardSidebar />
        <main className="flex-1 overflow-auto">
          <header className="border-b border-primary/30 bg-card/50 backdrop-blur-sm p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-2xl font-bold text-primary neon-glow">Collaborative Workspace</h1>
                  <p className="text-sm text-muted-foreground">Create and manage group projects</p>
                </div>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create Workspace
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Workspace</DialogTitle>
                    <DialogDescription>
                      Create a collaborative workspace where team members can work together on projects in real-time.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Workspace Name</Label>
                      <Input
                        id="name"
                        placeholder="Enter workspace name"
                        value={newWorkspace.name}
                        onChange={(e) => setNewWorkspace({ ...newWorkspace, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description (optional)</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your workspace"
                        value={newWorkspace.description}
                        onChange={(e) => setNewWorkspace({ ...newWorkspace, description: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={createWorkspace} disabled={creating || !newWorkspace.name.trim()}>
                      {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Create Workspace
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </header>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : workspaces.length === 0 ? (
              <div className="text-center py-16">
                <Layers className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">No Workspaces Yet</h2>
                <p className="text-muted-foreground mb-6">
                  Create your first collaborative workspace to start working with your team.
                </p>
                <Button onClick={() => setDialogOpen(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Your First Workspace
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workspaces.map((workspace) => (
                  <Card
                    key={workspace.id}
                    className="bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all cursor-pointer group"
                    onClick={() => enterWorkspace(workspace.id)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg group-hover:text-primary transition-colors">
                            {workspace.name}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {workspace.description || "No description"}
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className="border-primary/50">
                          {workspace.owner_id === userId ? "Owner" : "Member"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {workspace.member_count} members
                        </div>
                        <div className="flex items-center gap-1">
                          <FolderKanban className="w-4 h-4" />
                          {workspace.project_count} projects
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {new Date(workspace.created_at).toLocaleDateString()}
                        </div>
                        <Button variant="ghost" size="sm" className="gap-1 group-hover:text-primary">
                          Enter <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Workspace;