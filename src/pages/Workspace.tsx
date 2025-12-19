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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Mail,
  Check,
  X,
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

interface Invitation {
  id: string;
  workspace_id: string;
  email: string;
  status: string;
  created_at: string;
  workspace_name?: string;
}

const Workspace = () => {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [newWorkspace, setNewWorkspace] = useState({ name: "", description: "" });
  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

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
    setUserEmail(user.email || null);
    fetchWorkspaces(user.id);
    fetchInvitations(user.email || "");
  };

  const fetchWorkspaces = async (uid: string) => {
    setLoading(true);
    try {
      // First try to get workspaces owned by the user
      const { data: ownedWorkspaces, error: ownedError } = await supabase
        .from("workspaces")
        .select("*")
        .eq("owner_id", uid);

      if (ownedError) throw ownedError;

      // Get member workspaces
      const { data: memberData, error: memberError } = await supabase
        .from("workspace_members")
        .select("workspace_id")
        .eq("user_id", uid);

      let allWorkspaces = ownedWorkspaces || [];

      if (!memberError && memberData && memberData.length > 0) {
        const workspaceIds = memberData.map(m => m.workspace_id);
        const ownedIds = allWorkspaces.map(w => w.id);
        const memberOnlyIds = workspaceIds.filter(id => !ownedIds.includes(id));

        if (memberOnlyIds.length > 0) {
          const { data: memberWorkspaces } = await supabase
            .from("workspaces")
            .select("*")
            .in("id", memberOnlyIds);
          
          if (memberWorkspaces) {
            allWorkspaces = [...allWorkspaces, ...memberWorkspaces];
          }
        }
      }

      // Get member counts and project counts
      const workspacesWithCounts = await Promise.all(
        allWorkspaces.map(async (ws) => {
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

  const fetchInvitations = async (email: string) => {
    if (!email) return;
    
    try {
      const { data, error } = await supabase
        .from("workspace_invitations")
        .select("*, workspaces(name)")
        .eq("email", email)
        .eq("status", "pending");

      if (error) throw error;

      const invitationsWithNames = (data || []).map((inv: any) => ({
        ...inv,
        workspace_name: inv.workspaces?.name || "Unknown Workspace",
      }));

      setInvitations(invitationsWithNames);
    } catch (error) {
      console.error("Error fetching invitations:", error);
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

  const sendInvitation = async () => {
    if (!userId || !inviteEmail.trim() || !selectedWorkspaceId) return;

    setInviting(true);
    try {
      const { error } = await supabase
        .from("workspace_invitations")
        .insert({
          workspace_id: selectedWorkspaceId,
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
    } catch (error) {
      console.error("Error sending invitation:", error);
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive",
      });
    } finally {
      setInviting(false);
    }
  };

  const acceptInvitation = async (invitation: Invitation) => {
    if (!userId) return;

    try {
      // Update invitation status
      const { error: updateError } = await supabase
        .from("workspace_invitations")
        .update({ status: "accepted" })
        .eq("id", invitation.id);

      if (updateError) throw updateError;

      // Add user as member
      const { error: memberError } = await supabase
        .from("workspace_members")
        .insert({
          workspace_id: invitation.workspace_id,
          user_id: userId,
          role: "member",
        });

      if (memberError) throw memberError;

      toast({
        title: "Invitation Accepted",
        description: `You've joined ${invitation.workspace_name}`,
      });

      fetchWorkspaces(userId);
      fetchInvitations(userEmail || "");
    } catch (error) {
      console.error("Error accepting invitation:", error);
      toast({
        title: "Error",
        description: "Failed to accept invitation",
        variant: "destructive",
      });
    }
  };

  const declineInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from("workspace_invitations")
        .update({ status: "declined" })
        .eq("id", invitationId);

      if (error) throw error;

      toast({
        title: "Invitation Declined",
      });

      fetchInvitations(userEmail || "");
    } catch (error) {
      console.error("Error declining invitation:", error);
    }
  };

  const enterWorkspace = (workspaceId: string) => {
    navigate(`/workspace/${workspaceId}`);
  };

  const openInviteDialog = (workspaceId: string) => {
    setSelectedWorkspaceId(workspaceId);
    setInviteDialogOpen(true);
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

          {/* Invitation Dialog */}
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Member</DialogTitle>
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
                <Button onClick={sendInvitation} disabled={inviting || !inviteEmail.trim()}>
                  {inviting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Send Invitation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div className="p-6">
            <Tabs defaultValue="workspaces" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="workspaces">My Workspaces</TabsTrigger>
                <TabsTrigger value="invitations" className="relative">
                  Invitations
                  {invitations.length > 0 && (
                    <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                      {invitations.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="workspaces">
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
                        className="bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all group"
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div 
                              className="cursor-pointer flex-1"
                              onClick={() => enterWorkspace(workspace.id)}
                            >
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
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="gap-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openInviteDialog(workspace.id);
                                }}
                              >
                                <UserPlus className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="gap-1 group-hover:text-primary"
                                onClick={() => enterWorkspace(workspace.id)}
                              >
                                Enter <ArrowRight className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="invitations">
                {invitations.length === 0 ? (
                  <div className="text-center py-16">
                    <Mail className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h2 className="text-xl font-semibold mb-2">No Pending Invitations</h2>
                    <p className="text-muted-foreground">
                      When someone invites you to a workspace, it will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {invitations.map((invitation) => (
                      <Card
                        key={invitation.id}
                        className="bg-card/50 backdrop-blur-sm border-primary/20"
                      >
                        <CardHeader>
                          <CardTitle className="text-lg">{invitation.workspace_name}</CardTitle>
                          <CardDescription>
                            Invited on {new Date(invitation.created_at).toLocaleDateString()}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex gap-2">
                            <Button
                              className="flex-1 gap-1"
                              onClick={() => acceptInvitation(invitation)}
                            >
                              <Check className="w-4 h-4" />
                              Accept
                            </Button>
                            <Button
                              variant="outline"
                              className="flex-1 gap-1"
                              onClick={() => declineInvitation(invitation.id)}
                            >
                              <X className="w-4 h-4" />
                              Decline
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Workspace;