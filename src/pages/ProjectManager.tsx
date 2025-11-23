import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, FolderPlus, FileText, Download, CheckCircle2, 
  Clock, AlertCircle, Plus, Upload, X, FolderOpen, Sparkles, Mic
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { VoiceMode } from "@/components/VoiceMode";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  current_phase: string;
  created_at: string;
  updated_at: string;
}

interface ProjectReport {
  id: string;
  project_id: string;
  report_type: string;
  content: string;
  created_at: string;
}

const ProjectManager = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectReports, setProjectReports] = useState<ProjectReport[]>([]);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [showVoiceMode, setShowVoiceMode] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [showChatUpload, setShowChatUpload] = useState(false);
  const [uploadedChatFiles, setUploadedChatFiles] = useState<File[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProjects();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  const loadProjects = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Login required", description: "Please log in to view projects.", variant: "destructive" });
        return;
      }
      
      const { data, error } = await supabase.functions.invoke('manage-project', {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: { action: 'list' }
      });

      if (error) throw error;
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const loadProjectReports = async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('project_reports')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjectReports(data || []);
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  };

  const createNewProject = async () => {
    if (!newProjectTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a project title",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Login required", description: "Please log in to create a project.", variant: "destructive" });
        return;
      }
      
      const { data, error } = await supabase.functions.invoke('manage-project', {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: {
          action: 'create',
          projectData: {
            title: newProjectTitle,
            description: newProjectDescription
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Project Created",
        description: "Your new project has been created successfully"
      });

      setShowNewProject(false);
      setNewProjectTitle("");
      setNewProjectDescription("");
      loadProjects();
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive"
      });
    }
  };

  const selectProject = (project: Project) => {
    setSelectedProject(project);
    loadProjectReports(project.id);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    
    const newFiles = Array.from(files);
    setUploadedChatFiles(prev => [...prev, ...newFiles]);
    
    toast({
      title: "Chat Files Added",
      description: `${newFiles.length} file(s) added for documentary generation`
    });
  };

  const removeFile = (index: number) => {
    setUploadedChatFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerateDocumentary = async () => {
    if (!selectedProject) {
      toast({
        title: "No Project Selected",
        description: "Please select a project first",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Authentication required');
      }

      // Phase 1: Collect all chat histories
      toast({ title: "Collecting Chat Histories", description: "Gathering conversation data..." });
      setProgress(15);
      
      // Read uploaded chat files
      const chatHistories = [];
      for (const file of uploadedChatFiles) {
        const content = await file.text();
        chatHistories.push({
          source: file.name.includes('KRIS') ? 'KRIS' : 'AI Scientist',
          conversation: file.name,
          content: content
        });
      }

      // Also get KRIS conversations from database
      const { data: krisConversations } = await supabase
        .from('conversations')
        .select('id, name, chat_history(*)')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (krisConversations) {
        for (const conv of krisConversations) {
          if (conv.chat_history && conv.chat_history.length > 0) {
            const chatContent = conv.chat_history
              .map((msg: any) => `${msg.role}: ${msg.content}`)
              .join('\n');
            chatHistories.push({
              source: 'KRIS',
              conversation: conv.name,
              content: chatContent
            });
          }
        }
      }

      // Phase 2: Generate Lessons
      toast({ title: "Generating Lessons", description: "Creating project-specific learning materials..." });
      setProgress(35);
      
      const { data: lessonsData, error: lessonsError } = await supabase.functions.invoke('generate-project-lessons', {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: {
          projectTitle: selectedProject.title,
          projectDescription: selectedProject.description,
          chatHistories: chatHistories
        }
      });

      if (lessonsError) {
        console.error('Lessons generation error:', lessonsError);
      }

      // Phase 3: Generate comprehensive documentary
      toast({ title: "Analyzing Project", description: "Creating comprehensive documentary report..." });
      setProgress(60);
      
      const { data: documentaryData, error: docError } = await supabase.functions.invoke('generate-project-documentary', {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: {
          projectData: {
            title: selectedProject.title,
            description: selectedProject.description,
            status: selectedProject.status,
            current_phase: selectedProject.current_phase,
            created_at: selectedProject.created_at
          },
          chatHistories: chatHistories
        }
      });

      if (docError) throw docError;

      const documentaryContent = documentaryData?.documentary || `# Project Documentary: ${selectedProject.title}

## Executive Summary
${selectedProject.description}

## Project Information
- Created: ${new Date(selectedProject.created_at).toLocaleString()}
- Current Phase: ${selectedProject.current_phase}
- Status: ${selectedProject.status}

## Development Journey
This project represents an innovative approach to engineering and development.

---
Generated by KRIS Project Management System
${new Date().toLocaleString()}`;

      // Phase 4: Save reports
      toast({ title: "Saving Reports", description: "Finalizing documentation..." });
      setProgress(80);

      // Save documentary
      const { error: docSaveError } = await supabase.functions.invoke('manage-project', {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: {
          action: 'create_report',
          projectId: selectedProject.id,
          projectData: {
            reportType: 'documentary',
            content: documentaryContent
          }
        }
      });

      if (docSaveError) throw docSaveError;

      // Save lessons if generated
      if (lessonsData?.lessons) {
        const lessonsContent = JSON.stringify(lessonsData.lessons, null, 2);
        await supabase.functions.invoke('manage-project', {
          headers: { Authorization: `Bearer ${session.access_token}` },
          body: {
            action: 'create_report',
            projectId: selectedProject.id,
            projectData: {
              reportType: 'lessons',
              content: lessonsContent
            }
          }
        });
      }

      setProgress(100);
      setTimeout(() => {
        setIsGenerating(false);
        setProgress(0);
        setShowChatUpload(false);
        setUploadedChatFiles([]);
        toast({
          title: "Documentary Generated Successfully",
          description: "Project documentary and lessons are ready"
        });
        loadProjectReports(selectedProject.id);
      }, 500);

    } catch (error) {
      console.error('Error generating documentary:', error);
      setIsGenerating(false);
      setProgress(0);
      toast({
        title: "Error",
        description: "Failed to generate documentary",
        variant: "destructive"
      });
    }
  };

  const handleExportReport = async (report: ProjectReport) => {
    try {
      const blob = new Blob([report.content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedProject?.title}_${report.report_type}_${new Date().toISOString().split('T')[0]}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "Report downloaded successfully"
      });
    } catch (error) {
      console.error('Error exporting report:', error);
      toast({
        title: "Export Failed",
        description: "Could not export report",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background circuit-bg">
      <header className="border-b border-primary/30 bg-card/50 backdrop-blur-sm p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/dashboard")}
              className="hover:bg-primary/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-primary neon-glow">Project Manager</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowVoiceMode(true)}
              className="hover:bg-primary/20"
            >
              <Mic className="w-4 h-4 mr-2" />
              Voice Mode
            </Button>
            <Badge variant="outline" className="border-primary/50">
              Coordination AI System
            </Badge>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-6">
        {!selectedProject ? (
          // Project History View
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-primary">Project History</h2>
              <Button 
                onClick={() => setShowNewProject(!showNewProject)}
                className="bg-primary hover:bg-primary/90"
              >
                <FolderPlus className="w-4 h-4 mr-2" />
                Create New Project
              </Button>
            </div>

            {showNewProject && (
              <Card className="bg-card/80 backdrop-blur-sm border-primary/30 p-6">
                <h3 className="text-lg font-semibold text-primary mb-4">New Project</h3>
                <div className="space-y-3">
                  <Input
                    placeholder="Project Title"
                    value={newProjectTitle}
                    onChange={(e) => setNewProjectTitle(e.target.value)}
                  />
                  <Textarea
                    placeholder="Project Description"
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button onClick={createNewProject} className="flex-1">
                      Create Project
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowNewProject(false);
                        setNewProjectTitle("");
                        setNewProjectDescription("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.length === 0 ? (
                <Card className="col-span-full bg-card/80 backdrop-blur-sm border-primary/30 p-12 text-center">
                  <FolderOpen className="w-16 h-16 text-primary/50 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Projects Yet</h3>
                  <p className="text-muted-foreground mb-4">Create your first project to get started</p>
                  <Button onClick={() => setShowNewProject(true)}>
                    <FolderPlus className="w-4 h-4 mr-2" />
                    Create Project
                  </Button>
                </Card>
              ) : (
                projects.map((project) => (
                  <Card 
                    key={project.id}
                    className="bg-card/80 backdrop-blur-sm border-primary/30 p-6 cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => selectProject(project)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <FolderOpen className="w-8 h-8 text-primary" />
                      <Badge variant="outline">
                        {project.status}
                      </Badge>
                    </div>
                    <h3 className="font-bold text-lg text-foreground mb-2">{project.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {project.description || "No description"}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      Created: {new Date(project.created_at).toLocaleDateString()}
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        ) : (
          // Project Detail View
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost"
                  onClick={() => setSelectedProject(null)}
                  className="hover:bg-primary/20"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Projects
                </Button>
                <div>
                  <h2 className="text-2xl font-semibold text-primary">{selectedProject.title}</h2>
                  <p className="text-sm text-muted-foreground">{selectedProject.description}</p>
                </div>
              </div>
              <Badge variant="outline" className="border-primary/50">
                {selectedProject.status}
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Actions Panel */}
              <Card className="lg:col-span-1 bg-card/80 backdrop-blur-sm border-primary/30 p-6">
                <h3 className="text-lg font-semibold text-primary mb-4">Actions</h3>
                <div className="space-y-3">
                  <Button 
                    onClick={() => setShowChatUpload(true)}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Chat History
                  </Button>
                  <Button 
                    onClick={handleGenerateDocumentary}
                    disabled={isGenerating || uploadedChatFiles.length === 0}
                    className="w-full"
                    variant="outline"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {isGenerating ? "Generating..." : "Generate Documentary"}
                  </Button>
                </div>

                {isGenerating && (
                  <div className="space-y-2 mt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-primary font-semibold">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}
              </Card>

              {/* Project Reports */}
              <Card className="lg:col-span-2 bg-card/80 backdrop-blur-sm border-primary/30 p-6">
                <h3 className="text-lg font-semibold text-primary mb-4">Project Reports & Folders</h3>
                <ScrollArea className="h-[500px]">
                  {projectReports.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-primary/50 mx-auto mb-4" />
                      <p className="text-muted-foreground mb-2">No reports generated yet</p>
                      <p className="text-sm text-muted-foreground">
                        Upload chat histories and generate a documentary to see reports here
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {projectReports.map((report) => (
                        <div
                          key={report.id}
                          className="p-4 bg-muted/30 rounded-lg border border-primary/20 hover:border-primary/50 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <FileText className="w-5 h-5 text-primary" />
                                <h4 className="font-semibold text-foreground capitalize">
                                  {report.report_type} Report
                                </h4>
                                <Badge variant="outline" className="text-xs">
                                  {new Date(report.created_at).toLocaleDateString()}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {report.content.substring(0, 150)}...
                              </p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleExportReport(report)}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </Card>
            </div>
          </div>
        )}
      </main>

      {/* Voice Mode */}
      {showVoiceMode && (
        <VoiceMode
          onClose={() => setShowVoiceMode(false)}
          conversationId={undefined}
          userId={userId}
        />
      )}

      {/* Chat Upload Dialog */}
      <Dialog open={showChatUpload} onOpenChange={setShowChatUpload}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Chat Histories from App Modules</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <p className="text-sm text-muted-foreground mb-3">
                Upload chat history files from KRIS, AI Scientist, or other modules to generate comprehensive project documentation.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".txt,.md,.json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                Select Chat History Files
              </Button>

              {uploadedChatFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm text-muted-foreground">Uploaded Files:</p>
                  {uploadedChatFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-muted rounded"
                    >
                      <span className="text-sm truncate flex-1">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              onClick={() => {
                setShowChatUpload(false);
                if (uploadedChatFiles.length > 0) {
                  toast({
                    title: "Files Ready",
                    description: "Chat histories are ready. Click 'Generate Documentary' to create reports."
                  });
                }
              }}
              disabled={uploadedChatFiles.length === 0}
              className="w-full"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectManager;