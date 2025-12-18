import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  ChevronRight, 
  GraduationCap, 
  History, 
  Plus, 
  Cpu, 
  Zap, 
  Settings, 
  Brain,
  Cog
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  created_at: string;
  engineering_lessons?: Lesson;
}

interface LessonSidebarProps {
  onSelectLesson: (lesson: Lesson | null, progress?: LessonProgress) => void;
  onNewLesson: () => void;
  selectedProgressId: string | null;
}

const categoryIcons: Record<string, React.ReactNode> = {
  'Electronics': <Zap className="h-4 w-4" />,
  'Embedded Systems': <Cpu className="h-4 w-4" />,
  'Control Engineering': <Settings className="h-4 w-4" />,
  'Signal Processing': <Zap className="h-4 w-4" />,
  'AI/ML': <Brain className="h-4 w-4" />,
  'Robotics': <Cog className="h-4 w-4" />,
  'Manufacturing': <Cog className="h-4 w-4" />,
};

const difficultyColors: Record<string, string> = {
  beginner: 'bg-green-500/20 text-green-400 border-green-500/30',
  intermediate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  advanced: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export function LessonSidebar({ onSelectLesson, onNewLesson, selectedProgressId }: LessonSidebarProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [userProgress, setUserProgress] = useState<LessonProgress[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchLessons();
    fetchUserProgress();
  }, []);

  const fetchLessons = async () => {
    const { data } = await supabase
      .from('engineering_lessons')
      .select('*')
      .order('category', { ascending: true });
    if (data) setLessons(data);
  };

  const fetchUserProgress = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('user_lesson_progress')
      .select('*, engineering_lessons(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (data) setUserProgress(data as unknown as LessonProgress[]);
  };

  const categories = [...new Set(lessons.map(l => l.category))];

  const getLessonsByCategory = (category: string) => 
    lessons.filter(l => l.category === category);

  return (
    <div className="h-full flex flex-col bg-card/50 border-r border-border">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-4">
          <GraduationCap className="h-6 w-6 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Learning Hub</h2>
        </div>
        <Button onClick={onNewLesson} className="w-full" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Custom Topic
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {/* Learning History */}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 text-sm font-medium text-muted-foreground"
          >
            <span className="flex items-center gap-2">
              <History className="h-4 w-4" />
              My Learning History
            </span>
            <ChevronRight className={cn("h-4 w-4 transition-transform", showHistory && "rotate-90")} />
          </button>

          {showHistory && userProgress.length > 0 && (
            <div className="ml-4 space-y-1 mt-1">
              {userProgress.map((progress) => (
                <button
                  key={progress.id}
                  onClick={() => onSelectLesson(
                    progress.engineering_lessons || null,
                    progress
                  )}
                  className={cn(
                    "w-full text-left p-2 rounded-lg text-sm transition-colors",
                    selectedProgressId === progress.id 
                      ? "bg-primary/20 text-primary" 
                      : "hover:bg-muted/50 text-foreground"
                  )}
                >
                  <div className="font-medium truncate">
                    {progress.engineering_lessons?.title || progress.custom_topic || 'Custom Lesson'}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <Badge variant="outline" className={cn("text-[10px] px-1", 
                      progress.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                    )}>
                      {progress.status}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          )}

          {showHistory && userProgress.length === 0 && (
            <p className="text-xs text-muted-foreground ml-6 mt-2">No lessons started yet</p>
          )}

          <div className="my-3 border-t border-border" />

          {/* Lesson Categories */}
          {categories.map((category) => (
            <div key={category} className="mb-1">
              <button
                onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 text-sm font-medium"
              >
                <span className="flex items-center gap-2 text-foreground">
                  {categoryIcons[category] || <BookOpen className="h-4 w-4" />}
                  {category}
                </span>
                <ChevronRight className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform",
                  expandedCategory === category && "rotate-90"
                )} />
              </button>

              {expandedCategory === category && (
                <div className="ml-4 space-y-1 mt-1">
                  {getLessonsByCategory(category).map((lesson) => (
                    <button
                      key={lesson.id}
                      onClick={() => onSelectLesson(lesson)}
                      className="w-full text-left p-2 rounded-lg hover:bg-muted/50 text-sm transition-colors"
                    >
                      <div className="font-medium text-foreground truncate">{lesson.title}</div>
                      <Badge variant="outline" className={cn("text-[10px] mt-1", difficultyColors[lesson.difficulty])}>
                        {lesson.difficulty}
                      </Badge>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
