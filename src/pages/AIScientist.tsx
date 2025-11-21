import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Send, User, Bot, Brain, Microscope, Atom, FlaskConical, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  scientist?: string;
  timestamp: Date;
}

interface Scientist {
  id: string;
  name: string;
  specialty: string;
  icon: React.ReactNode;
}

const scientists: Scientist[] = [
  { id: "physics", name: "Dr. Maxwell", specialty: "Physics & Electronics", icon: <Atom className="w-5 h-5" /> },
  { id: "chemistry", name: "Dr. Curie", specialty: "Chemistry & Materials", icon: <FlaskConical className="w-5 h-5" /> },
  { id: "engineering", name: "Dr. Tesla", specialty: "Engineering & Design", icon: <Microscope className="w-5 h-5" /> },
  { id: "software", name: "Dr. Turing", specialty: "Software & Algorithms", icon: <Brain className="w-5 h-5" /> },
];

const AIScientist = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const projectName = searchParams.get('projectName');
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Welcome to the AI Scientist Team. We are a collective of experts ready to guide your project. Share your project details, and we'll provide comprehensive analysis and suggestions.",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState("");
  const [selectedScientist, setSelectedScientist] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (projectId && projectName) {
      toast.success(`Working on project: ${projectName}`);
    }
  }, [projectId, projectName]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please log in to chat with the AI Scientist");
        setIsLoading(false);
        navigate('/auth');
        return;
      }
      
      const { data, error } = await supabase.functions.invoke('ai-scientist-chat', {
        headers: session?.access_token ? {
          Authorization: `Bearer ${session.access_token}`
        } : {},
        body: {
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
          selectedScientist,
          projectId,
          projectContext: projectName ? `Project: ${projectName}` : undefined
        }
      });

      if (error) throw error;

      const scientist = selectedScientist 
        ? scientists.find(s => s.id === selectedScientist)?.name 
        : "AI Team";

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content,
        scientist: selectedScientist || undefined,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error calling AI scientist:', error);
      toast.error("Failed to get AI response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background circuit-bg flex flex-col">
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
            <h1 className="text-2xl font-bold text-primary neon-glow">AI Scientist Team</h1>
            {projectName && (
              <Badge variant="default" className="ml-2">
                {projectName}
              </Badge>
            )}
          </div>
          <Badge variant="outline" className="border-primary/50">
            Expert Guidance System
          </Badge>
        </div>
      </header>
      
      <div className="flex-1 container mx-auto p-4 flex gap-4">
        {/* Scientist Selection Sidebar */}
        <Card className="w-64 p-4 bg-card/80 backdrop-blur-sm border-primary/30">
          <h3 className="text-lg font-semibold text-primary mb-4">Select Expert</h3>
          <div className="space-y-2">
            <Button
              variant={selectedScientist === null ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => setSelectedScientist(null)}
            >
              <Brain className="w-4 h-4 mr-2" />
              All Experts
            </Button>
            {scientists.map(scientist => (
              <Button
                key={scientist.id}
                variant={selectedScientist === scientist.id ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setSelectedScientist(scientist.id)}
              >
                {scientist.icon}
                <span className="ml-2 text-left flex-1">
                  <div className="text-sm font-semibold">{scientist.name}</div>
                  <div className="text-xs opacity-70">{scientist.specialty}</div>
                </span>
              </Button>
            ))}
          </div>

          <div className="mt-6 p-3 bg-muted/50 rounded-lg border border-primary/20">
            <h4 className="text-sm font-semibold text-primary mb-2">Capabilities</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Project evaluation</li>
              <li>• Issue identification</li>
              <li>• Design suggestions</li>
              <li>• Technical guidance</li>
              <li>• Error analysis</li>
            </ul>
          </div>
        </Card>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-card/80 backdrop-blur-sm rounded-lg border border-primary/30">
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-4">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[70%] rounded-lg p-4 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted border border-primary/20"
                    }`}
                  >
                    {message.scientist && (
                      <div className="text-xs font-semibold text-primary mb-1">
                        {scientists.find(s => s.id === message.scientist)?.name}
                      </div>
                    )}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    <div className="text-xs opacity-50 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                  {message.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-secondary" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t border-primary/30 p-4">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe your project, ask questions, or request analysis..."
                className="min-h-[60px] bg-background/50 border-primary/20"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90 h-auto px-6"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIScientist;
