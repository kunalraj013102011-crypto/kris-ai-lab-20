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
import { SectionedLesson } from "./SectionedLesson";

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
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [currentProgressId, setCurrentProgressId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const topic = lesson?.title || customTopic;

  useEffect(() => {
    if (progress) {
      setCurrentProgressId(progress.id);
      fetchChatHistory(progress.id);
    } else if (topic) {
      // Create a new progress entry for custom topics
      createProgressEntry();
    }
  }, [progress, topic]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const createProgressEntry = async () => {
    if (!topic || currentProgressId) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: newProgress } = await supabase
        .from('user_lesson_progress')
        .insert({
          user_id: user.id,
          lesson_id: lesson?.id || null,
          custom_topic: lesson ? null : topic,
          status: 'in_progress'
        })
        .select()
        .single();
      
      if (newProgress) {
        setCurrentProgressId(newProgress.id);
        onProgressUpdate();
      }
    } catch (error) {
      console.error('Error creating progress entry:', error);
    }
  };

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
          topic,
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

  const renderChatMarkdown = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.includes(':**')) {
        const [label, rest] = line.split(':**');
        return (
          <p key={i} className="mb-2">
            <span className="font-semibold text-primary">{label.replace('**', '')}:</span>
            {rest}
          </p>
        );
      }
      if (line.startsWith('- ')) {
        return <li key={i} className="ml-4 text-foreground list-disc">{line.slice(2)}</li>;
      }
      if (line.match(/^\d+\./)) {
        return <li key={i} className="ml-4 text-foreground list-decimal">{line.replace(/^\d+\./, '').trim()}</li>;
      }
      if (line.trim() === '') {
        return <br key={i} />;
      }
      // Handle inline bold and formatting
      const processed = line
        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-primary">$1</strong>')
        .replace(/`(.*?)`/g, '<code class="bg-muted px-1 rounded text-sm">$1</code>');
      return <p key={i} className="text-foreground mb-1" dangerouslySetInnerHTML={{ __html: processed }} />;
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
          <SectionedLesson 
            topic={topic} 
            lessonProgressId={currentProgressId}
            onProgressUpdate={onProgressUpdate}
          />
        </TabsContent>

        <TabsContent value="chat" className="flex-1 mt-0 flex flex-col">
          <ScrollArea className="flex-1 h-[calc(100vh-280px)]">
            <div className="p-4 space-y-4">
              {chatMessages.length === 0 && (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-primary/50 mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-2">STEM Problem Solver</h3>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto">
                    Ask any question about this lesson! I'm an expert in Engineering, Math, Physics, Chemistry, and Biology.
                    I'll show you step-by-step solutions with formulas and explanations.
                  </p>
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <div
                  key={msg.id || i}
                  className={cn(
                    "p-4 rounded-lg max-w-[85%]",
                    msg.role === 'user' 
                      ? "bg-primary/20 ml-auto" 
                      : "bg-muted"
                  )}
                >
                  <div className="text-sm text-foreground">
                    {msg.role === 'assistant' ? renderChatMarkdown(msg.content) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}
              {isSendingChat && (
                <div className="bg-muted p-4 rounded-lg max-w-[85%]">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Solving problem...</span>
                  </div>
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
                placeholder="Ask a question or paste a problem to solve..."
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
