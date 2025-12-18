import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  MessageSquare, 
  Send, 
  Loader2, 
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
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
  ai_content: string | null;
  created_at: string;
}

interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
}

interface LessonContentProps {
  lesson: Lesson | null;
  progress: LessonProgress | null;
  customTopic: string;
  onProgressUpdate: () => void;
}

export function LessonContent({ lesson, progress, customTopic, onProgressUpdate }: LessonContentProps) {
  const [lessonContent, setLessonContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [currentProgressId, setCurrentProgressId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const topic = lesson?.title || customTopic;

  useEffect(() => {
    if (progress) {
      setCurrentProgressId(progress.id);
      if (progress.ai_content) {
        setLessonContent(progress.ai_content);
      } else if (topic) {
        generateLesson();
      }
      fetchChatHistory(progress.id);
    } else if (topic) {
      generateLesson();
    }
  }, [progress, topic]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const fetchChatHistory = async (progressId: string) => {
    const { data } = await supabase
      .from('lesson_chat_history')
      .select('*')
      .eq('lesson_progress_id', progressId)
      .order('created_at', { ascending: true });
    
    if (data) {
      setChatMessages(data.map(msg => ({ id: msg.id, role: msg.role as 'user' | 'assistant', content: msg.content })));
    }
  };

  const generateLesson = async () => {
    if (!topic) return;
    
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
      setLessonContent(data.content);

      // Save or update progress
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (currentProgressId) {
        await supabase
          .from('user_lesson_progress')
          .update({ ai_content: data.content, updated_at: new Date().toISOString() })
          .eq('id', currentProgressId);
      } else {
        const { data: newProgress } = await supabase
          .from('user_lesson_progress')
          .insert({
            user_id: user.id,
            lesson_id: lesson?.id || null,
            custom_topic: lesson ? null : topic,
            ai_content: data.content,
            status: 'in_progress'
          })
          .select()
          .single();
        
        if (newProgress) {
          setCurrentProgressId(newProgress.id);
          onProgressUpdate();
        }
      }

      toast.success('Lesson generated successfully!');
    } catch (error) {
      console.error('Error generating lesson:', error);
      toast.error('Failed to generate lesson');
    } finally {
      setIsGenerating(false);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || !currentProgressId) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsSendingChat(true);

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
          action: 'chat',
          lessonProgressId: currentProgressId,
          message: userMessage,
          chatHistory: chatMessages,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
    } catch (error) {
      console.error('Error sending chat:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSendingChat(false);
    }
  };

  const markAsCompleted = async () => {
    if (!currentProgressId) return;

    try {
      await supabase
        .from('user_lesson_progress')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', currentProgressId);
      
      toast.success('Lesson marked as completed!');
      onProgressUpdate();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const renderMarkdown = (content: string) => {
    // Simple markdown rendering
    return content
      .split('\n')
      .map((line, i) => {
        if (line.startsWith('# ')) {
          return <h1 key={i} className="text-2xl font-bold mt-6 mb-4 text-foreground">{line.slice(2)}</h1>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={i} className="text-xl font-semibold mt-5 mb-3 text-foreground">{line.slice(3)}</h2>;
        }
        if (line.startsWith('### ')) {
          return <h3 key={i} className="text-lg font-medium mt-4 mb-2 text-foreground">{line.slice(4)}</h3>;
        }
        if (line.startsWith('- ')) {
          return <li key={i} className="ml-4 text-muted-foreground">{line.slice(2)}</li>;
        }
        if (line.startsWith('```')) {
          return null; // Skip code block markers
        }
        if (line.trim() === '') {
          return <br key={i} />;
        }
        return <p key={i} className="text-muted-foreground mb-2">{line}</p>;
      });
  };

  if (!topic) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="h-16 w-16 text-primary/50 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Select a Topic to Learn</h2>
          <p className="text-muted-foreground">Choose from the sidebar or create a custom topic</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">{topic}</h1>
          {lesson && (
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">{lesson.category}</Badge>
              <Badge variant="outline" className="text-xs capitalize">{lesson.difficulty}</Badge>
            </div>
          )}
        </div>
        {currentProgressId && progress?.status !== 'completed' && (
          <Button onClick={markAsCompleted} variant="outline" size="sm">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Mark Complete
          </Button>
        )}
      </div>

      <Tabs defaultValue="lesson" className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-2 w-fit">
          <TabsTrigger value="lesson">
            <BookOpen className="h-4 w-4 mr-2" />
            Lesson
          </TabsTrigger>
          <TabsTrigger value="chat" disabled={!currentProgressId}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Ask Questions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lesson" className="flex-1 mt-0">
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="p-6">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                  <p className="text-muted-foreground">Generating comprehensive lesson...</p>
                </div>
              ) : (
                <div className="prose prose-invert max-w-none">
                  {renderMarkdown(lessonContent)}
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="chat" className="flex-1 mt-0 flex flex-col">
          <ScrollArea className="flex-1 h-[calc(100vh-280px)]">
            <div className="p-4 space-y-4">
              {chatMessages.length === 0 && (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-primary/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">Ask questions about this lesson</p>
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <div
                  key={msg.id || i}
                  className={cn(
                    "p-3 rounded-lg max-w-[80%]",
                    msg.role === 'user' 
                      ? "bg-primary/20 ml-auto" 
                      : "bg-muted"
                  )}
                >
                  <p className="text-sm text-foreground whitespace-pre-wrap">{msg.content}</p>
                </div>
              ))}
              {isSendingChat && (
                <div className="bg-muted p-3 rounded-lg max-w-[80%]">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendChatMessage()}
                placeholder="Ask a question about this lesson..."
                disabled={isSendingChat}
              />
              <Button onClick={sendChatMessage} disabled={isSendingChat || !chatInput.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
