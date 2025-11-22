import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, FolderPlus, FileText, Download, CheckCircle2, 
  Clock, AlertCircle, Play, BookOpen, Mic, Upload, X 
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

interface WorkflowStep {
  step: number;
  module: string;
  action: string;
  status: "pending" | "in-progress" | "completed";
}

const ProjectManager = () => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [showVoiceMode, setShowVoiceMode] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [projectFiles, setProjectFiles] = useState<File[]>([]);
  const [includeChatHistory, setIncludeChatHistory] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [workflow, setWorkflow] = useState<WorkflowStep[]>([
    { step: 1, module: "KRIS", action: "Start project, define goals, create project brief", status: "completed" },
    { step: 2, module: "Learning Hub", action: "Learn about project, load lessons, export summary", status: "completed" },
    { step: 3, module: "Circuit Canvas", action: "Build circuit virtually, save design file", status: "in-progress" },
    { step: 4, module: "3D Lab", action: "Convert design to 3D model, store render", status: "pending" },
    { step: 5, module: "AI Scientist Team", action: "Analyze design, detect issues, give feedback", status: "pending" },
    { step: 6, module: "Simulation Engine", action: "Simulate project, check functionality, verify", status: "pending" },
    { step: 7, module: "Project Manager", action: "Create folder, collect histories, generate documentary", status: "pending" },
  ]);

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
      if (data.projects && data.projects.length > 0) {
        setSelectedProject(data.projects[0]);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
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

      // Phase 1: Collect all chat histories (KRIS + AI Scientist)
      toast({ title: "Collecting Chat Histories", description: "Gathering all conversation data..." });
      setProgress(15);
      
      // Get KRIS conversations
      const { data: krisConversations } = await supabase
        .from('conversations')
        .select('id, name, chat_history(*)')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      // Format KRIS chat histories
      const krisChatHistories = [];
      if (krisConversations) {
        for (const conv of krisConversations) {
          if (conv.chat_history && conv.chat_history.length > 0) {
            const chatContent = conv.chat_history
              .map((msg: any) => `${msg.role}: ${msg.content}`)
              .join('\n');
            krisChatHistories.push({
              source: 'KRIS',
              conversation: conv.name,
              content: chatContent
            });
          }
        }
      }

      // Get AI Scientist chats (stored in chat_history without conversation grouping)
      // You would need similar storage for AI Scientist chats - for now we'll use available data
      const allChatHistories = [...krisChatHistories];

      // Phase 2: Generate Lessons
      toast({ title: "Generating Lessons", description: "Creating project-specific learning materials..." });
      setProgress(35);
      
      const { data: lessonsData, error: lessonsError } = await supabase.functions.invoke('generate-project-lessons', {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: {
          projectTitle: selectedProject.title,
          projectDescription: selectedProject.description,
          chatHistories: allChatHistories
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
          chatHistories: allChatHistories
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
        toast({
          title: "Documentary Generated Successfully",
          description: "Project documentary, lessons, and PDF are ready for download"
        });
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

  const handleExportData = async () => {
    if (!selectedProject) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Login required", variant: "destructive" });
        return;
      }

      // Get all reports for this project
      const { data: reports, error } = await supabase
        .from('project_reports')
        .select('*')
        .eq('project_id', selectedProject.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!reports || reports.length === 0) {
        toast({
          title: "No Reports Found",
          description: "Generate a documentary first before exporting",
          variant: "destructive"
        });
        return;
      }

      // Combine all reports into one document
      let exportContent = `# ${selectedProject.title} - Complete Project Documentation\n\n`;
      exportContent += `Generated: ${new Date().toLocaleString()}\n\n`;
      exportContent += `---\n\n`;

      reports.forEach(report => {
        exportContent += `## ${report.report_type.toUpperCase()} REPORT\n\n`;
        exportContent += `${report.content}\n\n`;
        exportContent += `---\n\n`;
      });

      // Create and download file
      const blob = new Blob([exportContent], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedProject.title.replace(/\s+/g, '_')}_Documentation.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "Project documentation downloaded as Markdown file"
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Export Failed",
        description: "Could not export project data",
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    
    const newFiles = Array.from(files);
    setProjectFiles(prev => [...prev, ...newFiles]);
    
    toast({
      title: "Files Added",
      description: `${newFiles.length} file(s) added to project`
    });
  };

  const removeFile = (index: number) => {
    setProjectFiles(prev => prev.filter((_, i) => i !== index));
  };

  const saveProjectFiles = async () => {
    if (!selectedProject || projectFiles.length === 0) return;
    
    try {
      let reportContent = `# Project Files - ${selectedProject.title}\n\n`;
      
      // Add file information
      reportContent += "## Uploaded Files\n";
      projectFiles.forEach(file => {
        reportContent += `- ${file.name} (${(file.size / 1024).toFixed(2)} KB)\n`;
      });
      
      // Add chat history summary if requested
      if (includeChatHistory) {
        reportContent += "\n## Chat History Summary\n";
        const { data: conversations } = await (supabase as any)
          .from('conversations')
          .select('*, chat_history(*)')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false })
          .limit(5);
          
        if (conversations && conversations.length > 0) {
          conversations.forEach((conv: any) => {
            reportContent += `\n### ${conv.name}\n`;
            reportContent += `Date: ${new Date(conv.created_at).toLocaleDateString()}\n`;
            if (conv.chat_history && conv.chat_history.length > 0) {
              reportContent += `Messages: ${conv.chat_history.length}\n`;
            }
          });
        }
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Login required", variant: "destructive" });
        return;
      }
      
      await supabase.functions.invoke('manage-project', {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: {
          action: 'create_report',
          projectId: selectedProject.id,
          projectData: {
            reportType: 'files',
            content: reportContent
          }
        }
      });
      
      toast({
        title: "Files Saved",
        description: "Project files and history saved successfully"
      });
      
      setProjectFiles([]);
      setIncludeChatHistory(false);
      setShowProjectDetails(false);
    } catch (error) {
      console.error('Error saving files:', error);
      toast({
        title: "Error",
        description: "Failed to save files",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: WorkflowStep["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-primary" />;
      case "in-progress":
        return <Clock className="w-5 h-5 text-secondary animate-pulse" />;
      case "pending":
        return <AlertCircle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const completedSteps = workflow.filter(s => s.status === "completed").length;
  const totalProgress = (completedSteps / workflow.length) * 100;

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Project Overview */}
          <Card className="lg:col-span-1 bg-card/80 backdrop-blur-sm border-primary/30 p-6">
            <h2 className="text-xl font-semibold text-primary mb-4">Project Overview</h2>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Overall Progress</span>
                  <span className="font-semibold">{Math.round(totalProgress)}%</span>
                </div>
                <Progress value={totalProgress} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-muted/30 rounded-lg border border-primary/20">
                  <div className="text-xs text-muted-foreground">Completed</div>
                  <div className="text-2xl font-bold text-primary">{completedSteps}</div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg border border-primary/20">
                  <div className="text-xs text-muted-foreground">Remaining</div>
                  <div className="text-2xl font-bold text-secondary">
                    {workflow.length - completedSteps}
                  </div>
                </div>
              </div>

              <div className="pt-4 space-y-2">
                <Button 
                  onClick={handleGenerateDocumentary}
                  disabled={isGenerating || !selectedProject}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  {isGenerating ? "Generating..." : "Generate Documentary"}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowNewProject(!showNewProject)}
                >
                  <FolderPlus className="w-4 h-4 mr-2" />
                  New Project
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleExportData}
                  disabled={!selectedProject}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
              </div>

              {showNewProject && (
                <div className="pt-4 space-y-3 border-t border-primary/20">
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
                      Create
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
              )}

              {isGenerating && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Generating Report</span>
                    <span className="text-primary font-semibold">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}
            </div>
          </Card>

          {/* Project Workflow */}
          <Card className="lg:col-span-2 bg-card/80 backdrop-blur-sm border-primary/30 p-6">
            <h2 className="text-xl font-semibold text-primary mb-4">Project Workflow</h2>
            
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                 {workflow.map((item) => (
                  <div
                    key={item.step}
                    onClick={() => {
                      if (selectedProject) {
                        setShowProjectDetails(true);
                      }
                    }}
                    className={`p-4 rounded-lg border transition-all cursor-pointer hover:bg-primary/5 ${
                      item.status === "completed" 
                        ? "bg-primary/10 border-primary/40" 
                        : item.status === "in-progress"
                        ? "bg-secondary/10 border-secondary/40"
                        : "bg-muted/30 border-primary/20"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="bg-card rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0 border-2 border-primary">
                        {item.step}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-primary">{item.module}</h4>
                          {getStatusIcon(item.status)}
                          <Badge 
                            variant={
                              item.status === "completed" 
                                ? "default" 
                                : item.status === "in-progress"
                                ? "secondary"
                                : "outline"
                            }
                            className="text-xs"
                          >
                            {item.status}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm">{item.action}</p>
                      </div>
                      {item.status === "in-progress" && (
                        <Button size="sm" variant="outline">
                          <Play className="w-3 h-3 mr-1" />
                          Continue
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </div>

        {/* System Features */}
        <Card className="mt-6 bg-card/80 backdrop-blur-sm border-primary/30 p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">System Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg border border-primary/20">
              <CheckCircle2 className="w-8 h-8 text-primary mb-2" />
              <h4 className="font-semibold text-foreground mb-1">History Logs</h4>
              <p className="text-sm text-muted-foreground">
                Maintains comprehensive logs of all module activities
              </p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg border border-primary/20">
              <Clock className="w-8 h-8 text-primary mb-2" />
              <h4 className="font-semibold text-foreground mb-1">Auto-Save</h4>
              <p className="text-sm text-muted-foreground">
                Automatically saves progress at each workflow stage
              </p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg border border-primary/20">
              <BookOpen className="w-8 h-8 text-primary mb-2" />
              <h4 className="font-semibold text-foreground mb-1">Documentary Generation</h4>
              <p className="text-sm text-muted-foreground">
                AI-powered comprehensive project documentation and reports
              </p>
            </div>
          </div>
        </Card>
      </main>

      {/* Voice Mode */}
      {showVoiceMode && (
        <VoiceMode
          onClose={() => setShowVoiceMode(false)}
          conversationId={undefined}
          userId={userId}
        />
      )}

      {/* Project Details Dialog */}
      <Dialog open={showProjectDetails} onOpenChange={setShowProjectDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedProject?.title || "Project Details"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <h3 className="font-semibold mb-2">Upload Files</h3>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                Select Files
              </Button>

              {projectFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm text-muted-foreground">Selected Files:</p>
                  {projectFiles.map((file, index) => (
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

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="includeChatHistory"
                checked={includeChatHistory}
                onChange={(e) => setIncludeChatHistory(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="includeChatHistory" className="text-sm cursor-pointer">
                Include chat history summary as report
              </label>
            </div>

            <Button
              onClick={saveProjectFiles}
              disabled={projectFiles.length === 0 && !includeChatHistory}
              className="w-full"
            >
              <FileText className="w-4 h-4 mr-2" />
              Save to Project
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectManager;
