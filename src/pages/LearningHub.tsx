import { useState, useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Menu, X } from "lucide-react";
import { LessonSidebar } from "@/components/learning-hub/LessonSidebar";
import { LessonContent } from "@/components/learning-hub/LessonContent";
import { CustomTopicDialog } from "@/components/learning-hub/CustomTopicDialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Lesson {
  id: string;
  title: string;
  category: string;
  description: string;
  difficulty: string;
}

interface LessonProgress {
  id: string;
  lesson_id: string | null;
  custom_topic: string | null;
  status: string;
  ai_content: string | null;
  created_at: string;
}

const LearningHub = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedProgress, setSelectedProgress] = useState<LessonProgress | null>(null);
  const [customTopic, setCustomTopic] = useState('');
  const [isCustomDialogOpen, setIsCustomDialogOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Handle KRIS redirect with topic
  useEffect(() => {
    const krisRedirect = searchParams.get('krisRedirect');
    const storedPrompt = localStorage.getItem('krisRedirectPrompt');
    const storedModule = localStorage.getItem('krisRedirectModule');
    const storedTimestamp = localStorage.getItem('krisRedirectTimestamp');
    
    if (krisRedirect === 'true' && storedModule === 'learning' && storedPrompt) {
      // Check if redirect is recent (within 30 seconds)
      const isRecent = storedTimestamp && (Date.now() - parseInt(storedTimestamp)) < 30000;
      
      if (isRecent) {
        // Extract topic from the prompt
        const topicMatch = storedPrompt.match(/learn about:?\s*(.+)/i) || 
                          storedPrompt.match(/topic:?\s*(.+)/i) ||
                          storedPrompt.match(/lesson on:?\s*(.+)/i);
        
        const topic = topicMatch ? topicMatch[1].trim() : storedPrompt;
        
        setCustomTopic(topic);
        toast.success(`Starting lesson: ${topic}`, {
          description: "KRIS detected you need to learn this topic"
        });
        
        // Clear the redirect data
        localStorage.removeItem('krisRedirectPrompt');
        localStorage.removeItem('krisRedirectModule');
        localStorage.removeItem('krisRedirectTimestamp');
      }
    }
    
    // Also check for topic in URL params
    const urlTopic = searchParams.get('topic');
    if (urlTopic) {
      setCustomTopic(urlTopic);
    }
  }, [searchParams]);

  const handleSelectLesson = (lesson: Lesson | null, progress?: LessonProgress) => {
    setSelectedLesson(lesson);
    setSelectedProgress(progress || null);
    setCustomTopic(progress?.custom_topic || '');
    // Close sidebar on mobile
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleNewLesson = () => {
    setIsCustomDialogOpen(true);
  };

  const handleCustomTopicSubmit = (topic: string) => {
    setSelectedLesson(null);
    setSelectedProgress(null);
    setCustomTopic(topic);
  };

  const handleProgressUpdate = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden"
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <h1 className="text-lg font-bold text-foreground">Engineering Learning Hub</h1>
        </div>
        <Button
          onClick={() => navigate("/dashboard")}
          variant="outline"
          size="sm"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Dashboard
        </Button>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div
          className={cn(
            "w-72 flex-shrink-0 transition-all duration-300 overflow-hidden",
            "absolute md:relative z-20 h-[calc(100vh-56px)] md:h-auto",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-0"
          )}
        >
          <LessonSidebar
            key={refreshKey}
            onSelectLesson={handleSelectLesson}
            onNewLesson={handleNewLesson}
            selectedProgressId={selectedProgress?.id || null}
          />
        </div>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-10 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Lesson Content */}
        <div className="flex-1 overflow-hidden">
          <LessonContent
            lesson={selectedLesson}
            progress={selectedProgress}
            customTopic={customTopic}
            onProgressUpdate={handleProgressUpdate}
          />
        </div>
      </div>

      {/* Custom Topic Dialog */}
      <CustomTopicDialog
        open={isCustomDialogOpen}
        onOpenChange={setIsCustomDialogOpen}
        onSubmit={handleCustomTopicSubmit}
      />
    </div>
  );
};

export default LearningHub;
