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
  id: number;
  title: string;
  topic: string;
  duration: string;
  completed: boolean;
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
  
  const [lessons, setLessons] = useState<Lesson[]>([
    { id: 1, title: "Introduction to Circuit Design", topic: "Electronics Basics", duration: "45 min", completed: true },
    { id: 2, title: "Understanding Resistors & Capacitors", topic: "Components", duration: "60 min", completed: true },
    { id: 3, title: "Voltage and Current Analysis", topic: "Theory", duration: "50 min", completed: false },
    { id: 4, title: "PCB Design Fundamentals", topic: "Design", duration: "75 min", completed: false },
    { id: 5, title: "Microcontroller Programming", topic: "Software", duration: "90 min", completed: false },
  ]);

  const [chatHistory] = useState<ChatHistoryItem[]>([
    { id: "1", date: "2025-10-17", expert: "Dr. Tesla", summary: "Discussed circuit optimization techniques" },
    { id: "2", date: "2025-10-16", expert: "Dr. Maxwell", summary: "Analyzed power supply design" },
    { id: "3", date: "2025-10-15", expert: "Dr. Curie", summary: "Battery selection for portable devices" },
  ]);

  const [showLessonDialog, setShowLessonDialog] = useState(false);
  const [lessonTopic, setLessonTopic] = useState("");
  const [lessonContent, setLessonContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [showAnalysisDialog, setShowAnalysisDialog] = useState(false);
  const [analysisProject, setAnalysisProject] = useState("");
  const [analysisContent, setAnalysisContent] = useState("");

  const completedCount = lessons.filter(l => l.completed).length;
  const progress = (completedCount / lessons.length) * 100;

  useEffect(() => {
    if (projectId && projectName) {
      toast({
        title: "Project Context",
        description: `Working on: ${projectName}`,
      });
    }
  }, [projectId, projectName]);

  const handleLessonComplete = (lessonId: number) => {
    setLessons(prev => {
      const updated = prev.map(lesson =>
        lesson.id === lessonId ? { ...lesson, completed: true } : lesson
      );
      
      // Auto-advance to next lesson
      const currentIndex = updated.findIndex(l => l.id === lessonId);
      if (currentIndex < updated.length - 1) {
        console.log(`Advancing to lesson: ${updated[currentIndex + 1].title}`);
      }
      
      return updated;
    });
  };

  const generateLesson = async () => {
    if (!lessonTopic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic for your lesson",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Login required", description: "Please log in to generate lessons.", variant: "destructive" });
        setIsGenerating(false);
        return;
      }
      
      const { data, error } = await supabase.functions.invoke('generate-lesson', {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: { 
          topic: lessonTopic, 
          type: 'lesson',
          projectId,
          projectContext: projectName ? `Project: ${projectName}` : undefined
        }
      });

      if (error) throw error;

      setLessonContent(data.content);
      toast({
        title: "Lesson Generated",
        description: "Your AI-powered lesson is ready!",
      });
    } catch (error: any) {
      console.error('Lesson generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate lesson",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
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

    setIsGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Login required", description: "Please log in to run analysis.", variant: "destructive" });
        setIsGenerating(false);
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
      setIsGenerating(false);
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
            {completedCount}/{lessons.length} Lessons Completed
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <Card className="bg-card/80 backdrop-blur-sm border-primary/30 p-6">
                  <h3 className="text-lg font-semibold text-primary mb-4">Learning Progress</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Overall Progress</span>
                        <span className="font-semibold">{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                    <div className="pt-4 border-t border-primary/20">
                      <div className="text-sm text-muted-foreground space-y-2">
                        <div className="flex justify-between">
                          <span>Completed:</span>
                          <span className="text-primary font-semibold">{completedCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>In Progress:</span>
                          <span className="text-secondary font-semibold">{lessons.length - completedCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="lg:col-span-2">
                <Card className="bg-card/80 backdrop-blur-sm border-primary/30 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-primary">Lesson List</h3>
                    <Button onClick={() => setShowLessonDialog(true)} size="sm">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate AI Lesson
                    </Button>
                  </div>
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-3">
                      {lessons.map(lesson => (
                        <div
                          key={lesson.id}
                          className="p-4 bg-muted/30 rounded-lg border border-primary/20 hover:border-primary/50 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant={lesson.completed ? "default" : "outline"} className="text-xs">
                                  {lesson.topic}
                                </Badge>
                                {lesson.completed && (
                                  <CheckCircle className="w-4 h-4 text-primary" />
                                )}
                              </div>
                              <h4 className="font-semibold text-foreground mb-1">{lesson.title}</h4>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                <span>{lesson.duration}</span>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant={lesson.completed ? "outline" : "default"}
                              onClick={() => handleLessonComplete(lesson.id)}
                              disabled={lesson.completed}
                              className="ml-4"
                            >
                              {lesson.completed ? "Completed" : "Mark Done"}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </Card>
              </div>
            </div>
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

        {/* Generate Lesson Dialog */}
        <Dialog open={showLessonDialog} onOpenChange={setShowLessonDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Generate AI-Powered Lesson</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm mb-2 block">Lesson Topic</label>
                <Input
                  value={lessonTopic}
                  onChange={(e) => setLessonTopic(e.target.value)}
                  placeholder="e.g., Advanced PCB Layout Techniques"
                  disabled={isGenerating}
                />
              </div>
              <Button 
                onClick={generateLesson} 
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? "Generating..." : "Generate Lesson"}
              </Button>
              {lessonContent && (
                <ScrollArea className="h-[400px] border border-primary/20 rounded-lg p-4">
                  <div className="prose prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap text-sm">{lessonContent}</pre>
                  </div>
                </ScrollArea>
              )}
            </div>
          </DialogContent>
        </Dialog>

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
                  disabled={isGenerating}
                />
              </div>
              <Button 
                onClick={analyzeProject} 
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? "Analyzing..." : "Analyze Project"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default LearningHub;
