import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  BookOpen,
  Lightbulb,
  Calculator,
  FlaskConical,
  Pencil,
  Rocket,
  CheckCircle2,
  Loader2,
  ChevronRight,
  Sparkles,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Section {
  id: string;
  title: string;
  summary: string;
  icon: string;
  fullContent?: string;
  isLoading?: boolean;
  isSaved?: boolean;
}

interface LessonStructure {
  title: string;
  sections: Section[];
}

interface SectionedLessonProps {
  topic: string;
  lessonProgressId: string | null;
  onProgressUpdate: () => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "book-open": BookOpen,
  "lightbulb": Lightbulb,
  "calculator": Calculator,
  "flask": FlaskConical,
  "pencil": Pencil,
  "rocket": Rocket,
  "check-circle": CheckCircle2,
};

export function SectionedLesson({ topic, lessonProgressId, onProgressUpdate }: SectionedLessonProps) {
  const [lessonStructure, setLessonStructure] = useState<LessonStructure | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [savedSections, setSavedSections] = useState<Record<string, string>>({});

  useEffect(() => {
    if (topic) {
      loadSavedSections();
      generateLessonStructure();
    }
  }, [topic, lessonProgressId]);

  const loadSavedSections = async () => {
    if (!lessonProgressId) return;

    const { data } = await supabase
      .from('lesson_sections')
      .select('*')
      .eq('lesson_progress_id', lessonProgressId);

    if (data) {
      const saved: Record<string, string> = {};
      data.forEach(section => {
        if (section.full_content) {
          saved[section.section_id] = section.full_content;
        }
      });
      setSavedSections(saved);
    }
  };

  const generateLessonStructure = async () => {
    setIsGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/learning-hub-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ action: 'generate_lesson', topic }),
      });

      if (!response.ok) throw new Error('Failed to generate lesson');

      const data = await response.json();
      
      if (data.isStructured && data.content) {
        // Add saved content to sections
        const sectionsWithContent = data.content.sections.map((section: Section) => ({
          ...section,
          fullContent: savedSections[section.id] || undefined,
          isSaved: !!savedSections[section.id],
        }));
        
        setLessonStructure({
          ...data.content,
          sections: sectionsWithContent,
        });
      } else {
        // Fallback to default structure
        setLessonStructure({
          title: topic,
          sections: [
            { id: "introduction", title: "Introduction", summary: "Overview of the topic and its importance", icon: "book-open" },
            { id: "core-concepts", title: "Core Concepts", summary: "Fundamental principles and theory", icon: "lightbulb" },
            { id: "formulas", title: "Key Formulas", summary: "Mathematical relationships and equations", icon: "calculator" },
            { id: "examples", title: "Worked Examples", summary: "Practical applications with solutions", icon: "flask" },
            { id: "practice", title: "Practice Problems", summary: "Exercises to test understanding", icon: "pencil" },
            { id: "advanced", title: "Advanced Topics", summary: "Deeper concepts for further learning", icon: "rocket" },
            { id: "summary", title: "Summary", summary: "Key takeaways and quick reference", icon: "check-circle" },
          ],
        });
      }

      toast.success('Lesson structure generated!');
    } catch (error) {
      console.error('Error generating lesson:', error);
      toast.error('Failed to generate lesson');
    } finally {
      setIsGenerating(false);
    }
  };

  const expandSection = async (sectionId: string, sectionTitle: string) => {
    if (!lessonStructure) return;
    
    // Check if already expanded with content
    const section = lessonStructure.sections.find(s => s.id === sectionId);
    if (section?.fullContent) {
      setExpandedSections(prev => 
        prev.includes(sectionId) ? prev.filter(id => id !== sectionId) : [...prev, sectionId]
      );
      return;
    }

    // Set loading state
    setLessonStructure(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        sections: prev.sections.map(s => 
          s.id === sectionId ? { ...s, isLoading: true } : s
        ),
      };
    });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/learning-hub-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action: 'expand_section',
          topic,
          lessonProgressId,
          sectionId,
          sectionTitle,
        }),
      });

      if (!response.ok) throw new Error('Failed to expand section');

      const data = await response.json();

      // Update section with full content
      setLessonStructure(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          sections: prev.sections.map(s => 
            s.id === sectionId 
              ? { ...s, fullContent: data.content, isLoading: false, isSaved: true } 
              : s
          ),
        };
      });

      setExpandedSections(prev => [...prev, sectionId]);
      toast.success(`"${sectionTitle}" content loaded and saved!`);
    } catch (error) {
      console.error('Error expanding section:', error);
      toast.error('Failed to load section content');
      
      // Reset loading state
      setLessonStructure(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          sections: prev.sections.map(s => 
            s.id === sectionId ? { ...s, isLoading: false } : s
          ),
        };
      });
    }
  };

  const getCompletedSectionsCount = () => {
    if (!lessonStructure) return 0;
    return lessonStructure.sections.filter(s => s.fullContent || s.isSaved).length;
  };

  const renderMarkdown = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('## ')) {
        return <h2 key={i} className="text-xl font-semibold mt-6 mb-3 text-foreground">{line.slice(3)}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={i} className="text-lg font-medium mt-4 mb-2 text-foreground">{line.slice(4)}</h3>;
      }
      if (line.startsWith('#### ')) {
        return <h4 key={i} className="text-base font-medium mt-3 mb-2 text-foreground">{line.slice(5)}</h4>;
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i} className="font-semibold text-foreground mb-2">{line.slice(2, -2)}</p>;
      }
      if (line.startsWith('- ')) {
        return <li key={i} className="ml-4 text-muted-foreground list-disc">{line.slice(2)}</li>;
      }
      if (line.match(/^\d+\./)) {
        return <li key={i} className="ml-4 text-muted-foreground list-decimal">{line.replace(/^\d+\./, '').trim()}</li>;
      }
      if (line.startsWith('```')) {
        return null;
      }
      if (line.trim() === '') {
        return <br key={i} />;
      }
      // Handle inline bold
      const boldProcessed = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return <p key={i} className="text-muted-foreground mb-2" dangerouslySetInnerHTML={{ __html: boldProcessed }} />;
    });
  };

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Generating lesson structure...</p>
      </div>
    );
  }

  if (!lessonStructure) {
    return (
      <div className="text-center py-8">
        <Sparkles className="h-12 w-12 text-primary/50 mx-auto mb-4" />
        <p className="text-muted-foreground">Loading lesson...</p>
      </div>
    );
  }

  const progress = (getCompletedSectionsCount() / lessonStructure.sections.length) * 100;

  return (
    <ScrollArea className="h-[calc(100vh-200px)]">
      <div className="p-6 space-y-6">
        {/* Progress Header */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">{lessonStructure.title}</h1>
            <Badge variant="outline" className="text-xs">
              {getCompletedSectionsCount()}/{lessonStructure.sections.length} sections
            </Badge>
          </div>
          <div className="space-y-1">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {Math.round(progress)}% complete - Click "Read More" on each section to expand
            </p>
          </div>
        </div>

        {/* Sections */}
        <Accordion 
          type="multiple" 
          value={expandedSections}
          onValueChange={setExpandedSections}
          className="space-y-3"
        >
          {lessonStructure.sections.map((section, index) => {
            const IconComponent = iconMap[section.icon] || BookOpen;
            const hasContent = section.fullContent || section.isSaved;
            
            return (
              <AccordionItem
                key={section.id}
                value={section.id}
                className={cn(
                  "border rounded-lg overflow-hidden transition-all",
                  hasContent ? "border-primary/30 bg-primary/5" : "border-border"
                )}
              >
                <div className="flex items-center gap-4 p-4">
                  <div className={cn(
                    "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                    hasContent ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                  )}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Section {index + 1}</span>
                      {hasContent && (
                        <Badge variant="secondary" className="text-xs gap-1">
                          <Save className="h-3 w-3" />
                          Saved
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-foreground">{section.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{section.summary}</p>
                  </div>

                  <Button
                    variant={hasContent ? "outline" : "default"}
                    size="sm"
                    onClick={() => expandSection(section.id, section.title)}
                    disabled={section.isLoading}
                    className="flex-shrink-0"
                  >
                    {section.isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : hasContent ? (
                      <>
                        <ChevronRight className={cn(
                          "h-4 w-4 mr-2 transition-transform",
                          expandedSections.includes(section.id) && "rotate-90"
                        )} />
                        {expandedSections.includes(section.id) ? "Collapse" : "Expand"}
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Read More
                      </>
                    )}
                  </Button>
                </div>

                <AccordionContent className="px-4 pb-4">
                  {section.fullContent && (
                    <div className="pt-2 border-t border-border mt-2">
                      <div className="prose prose-sm prose-invert max-w-none">
                        {renderMarkdown(section.fullContent)}
                      </div>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </ScrollArea>
  );
}
