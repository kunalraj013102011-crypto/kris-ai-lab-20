import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, BookOpen, CheckCircle, Clock, History, Sparkles } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Lesson {
  title: string;
  description: string;
  concepts: string[];
  tips: string[];
}

interface ChatHistoryItem {
  id: string;
  date: string;
  expert: string;
  summary: string;
}

const LearningHub = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const projectName = searchParams.get('projectName');
  
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);

  const [chatHistory] = useState<ChatHistoryItem[]>([
    { id: "1", date: "2025-10-17", expert: "Dr. Tesla", summary: "Discussed circuit optimization techniques" },
    { id: "2", date: "2025-10-16", expert: "Dr. Maxwell", summary: "Analyzed power supply design" },
    { id: "3", date: "2025-10-15", expert: "Dr. Curie", summary: "Battery selection for portable devices" },
  ]);

  const [showAnalysisDialog, setShowAnalysisDialog] = useState(false);
  const [analysisProject, setAnalysisProject] = useState("");
  const [analysisContent, setAnalysisContent] = useState("");

  useEffect(() => {
    if (projectId && projectName) {
      loadProjectLessons();
    }
  }, [projectId, projectName]);

  const loadProjectLessons = async () => {
    if (!projectId || !projectName) return;
    
    setLoadingLessons(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ 
          title: "Login required", 
          description: "Please log in to load lessons.", 
          variant: "destructive" 
        });
        return;
      }

      // Collect KRIS chat histories
      const { data: chatHistories, error: chatError } = await supabase
        .from('chat_history')
        .select('content, role')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: true });

      if (chatError) throw chatError;

      const formattedChatHistories = chatHistories?.map(msg => ({
        source: msg.role === 'user' ? 'User' : 'KRIS AI',
        content: msg.content
      })) || [];

      // Generate lessons
      const { data, error } = await supabase.functions.invoke('generate-project-lessons', {
        body: { 
          projectTitle: projectName,
          projectDescription: `Project ID: ${projectId}`,
          chatHistories: formattedChatHistories
        }
      });

      if (error) throw error;

      setLessons(data.lessons || []);
      toast({
        title: "Lessons Generated",
        description: `Generated ${data.lessons?.length || 0} lessons based on your project`,
      });
    } catch (error: any) {
      console.error('Error loading lessons:', error);
      toast({
        title: "Failed to Load Lessons",
        description: error.message || "Could not generate lessons",
        variant: "destructive",
      });
    } finally {
      setLoadingLessons(false);
    }
  };


  const analyzeProject = async () => {
    if (!analysisProject.trim()) {
      toast({
        title: "Project Description Required",
        description: "Please describe your project",
        variant: "destructive",
      });
      return;
    }

    setLoadingLessons(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Login required", description: "Please log in to run analysis.", variant: "destructive" });
        setLoadingLessons(false);
        return;
      }
      
      const { data, error } = await supabase.functions.invoke('generate-lesson', {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: { topic: analysisProject, type: 'analysis' }
      });

      if (error) throw error;

      setAnalysisContent(data.content);
      toast({
        title: "Analysis Complete",
        description: "Your project analysis is ready!",
      });
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze project",
        variant: "destructive",
      });
    } finally {
      setLoadingLessons(false);
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
            <h1 className="text-2xl font-bold text-primary neon-glow">Learning Hub</h1>
            {projectName && (
              <Badge variant="default" className="ml-2">
                {projectName}
              </Badge>
            )}
          </div>
          <Badge variant="outline" className="border-primary/50">
            {lessons.length} Lessons Available
          </Badge>
        </div>
      </header>
      
      <main className="container mx-auto p-6">
        <Tabs defaultValue="lessons" className="space-y-6">
          <TabsList className="bg-card/80 border border-primary/30">
            <TabsTrigger value="lessons" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BookOpen className="w-4 h-4 mr-2" />
              Daily Lessons
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <History className="w-4 h-4 mr-2" />
              Chat History
            </TabsTrigger>
            <TabsTrigger value="analysis" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <CheckCircle className="w-4 h-4 mr-2" />
              Project Analysis
            </TabsTrigger>
          </TabsList>

          {/* Daily Lessons Tab */}
          <TabsContent value="lessons">
            <Card className="bg-card/80 backdrop-blur-sm border-primary/30 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-primary">AI-Generated Lessons</h3>
                {projectId && (
                  <Button onClick={loadProjectLessons} size="sm" disabled={loadingLessons}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    {loadingLessons ? "Generating..." : "Refresh Lessons"}
                  </Button>
                )}
              </div>
              
              {loadingLessons ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Generating lessons from your project...</p>
                </div>
              ) : lessons.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-primary/50 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">
                    {projectId ? "Click 'Refresh Lessons' to generate lessons" : "Select a project to generate lessons"}
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[600px]">
                  <div className="space-y-6">
                    {lessons.map((lesson, index) => (
                      <div
                        key={index}
                        className="p-6 bg-muted/30 rounded-lg border border-primary/20 hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-start gap-3 mb-4">
                          <Badge variant="default" className="mt-1">
                            Lesson {index + 1}
                          </Badge>
                          <div className="flex-1">
                            <h4 className="font-bold text-lg text-foreground mb-2">{lesson.title}</h4>
                            <p className="text-sm text-muted-foreground">{lesson.description}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-4 mt-4">
                          <div>
                            <h5 className="font-semibold text-sm text-primary mb-2">Key Concepts:</h5>
                            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                              {lesson.concepts.map((concept, i) => (
                                <li key={i}>{concept}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h5 className="font-semibold text-sm text-primary mb-2">Practical Tips:</h5>
                            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                              {lesson.tips.map((tip, i) => (
                                <li key={i}>{tip}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </Card>
          </TabsContent>

          {/* Chat History Tab */}
          <TabsContent value="history">
            <Card className="bg-card/80 backdrop-blur-sm border-primary/30 p-6">
              <h3 className="text-lg font-semibold text-primary mb-4">Expert Consultation History</h3>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {chatHistory.map(chat => (
                    <div
                      key={chat.id}
                      className="p-4 bg-muted/30 rounded-lg border border-primary/20 hover:border-primary/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant="outline">{chat.expert}</Badge>
                            <span className="text-sm text-muted-foreground">{chat.date}</span>
                          </div>
                          <p className="text-foreground">{chat.summary}</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </TabsContent>

          {/* Project Analysis Tab */}
          <TabsContent value="analysis">
            <Card className="bg-card/80 backdrop-blur-sm border-primary/30 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-primary">Project Analysis</h3>
                <Button onClick={() => setShowAnalysisDialog(true)}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analyze Project with AI
                </Button>
              </div>
              {analysisContent ? (
                <ScrollArea className="h-[500px]">
                  <div className="prose prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap text-sm">{analysisContent}</pre>
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-primary/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Click "Analyze Project with AI" to get detailed analysis
                  </p>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>

        {/* Project Analysis Dialog */}
        <Dialog open={showAnalysisDialog} onOpenChange={setShowAnalysisDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>AI Project Analysis</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm mb-2 block">Project Description</label>
                <Textarea
                  value={analysisProject}
                  onChange={(e) => setAnalysisProject(e.target.value)}
                  placeholder="Describe your project in detail..."
                  className="min-h-[150px]"
                  disabled={loadingLessons}
                />
              </div>
              <Button 
                onClick={analyzeProject} 
                disabled={loadingLessons}
                className="w-full"
              >
                {loadingLessons ? "Analyzing..." : "Analyze Project"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default LearningHub;
