import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  Send, 
  Bot, 
  Mic, 
  Brain, 
  Sparkles,
  Lock,
  Zap,
  Lightbulb,
  Rocket,
  ArrowRight,
  BookOpen,
  Cpu,
  Box,
  CircuitBoard,
  FolderKanban
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import krisLogo from "@/assets/kris-logo.jpg";
import welcomeSound from "@/assets/kris-welcome.mp3";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const FREE_CHAT_LIMIT = 2;
const STORAGE_KEY = "kris_free_chats_used";

const quickActions = [
  { icon: <Lightbulb className="w-4 h-4" />, label: "Validate an Idea", prompt: "I have an idea I want to validate. Can you help me explore it?" },
  { icon: <Brain className="w-4 h-4" />, label: "AI Research", prompt: "I want to learn about AI and machine learning basics." },
  { icon: <Cpu className="w-4 h-4" />, label: "Build a Project", prompt: "I want to build a tech project. Where do I start?" },
  { icon: <Rocket className="w-4 h-4" />, label: "Get Started", prompt: "What can I do in KRIS Lab? Show me the possibilities." },
];

const features = [
  { icon: <Brain className="w-5 h-5" />, title: "AI Scientist", desc: "Expert guidance" },
  { icon: <BookOpen className="w-5 h-5" />, title: "Learning Hub", desc: "Daily lessons" },
  { icon: <Cpu className="w-5 h-5" />, title: "Simulation", desc: "Test projects" },
  { icon: <Box className="w-5 h-5" />, title: "3D Lab", desc: "3D engineering" },
  { icon: <CircuitBoard className="w-5 h-5" />, title: "Circuit Canvas", desc: "Design circuits" },
  { icon: <FolderKanban className="w-5 h-5" />, title: "Project Manager", desc: "Manage work" },
];

const TryLab = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hey there! I'm K.R.I.S (Kunal Raj Intelligence System) - your personal AI buddy and innovation partner! 👋\n\n🚀 Welcome to KRIS Lab - a virtual innovation lab where you can:\n\n• Validate and develop your ideas\n• Learn AI, engineering, and technology\n• Build and simulate projects virtually\n• Create circuits and 3D designs\n\nYou have 2 free messages to try me out. What would you like to explore?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [freeChatsUsed, setFreeChatsUsed] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const welcomeAudioRef = useRef<HTMLAudioElement | null>(null);

  // Load free chats used from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setFreeChatsUsed(parseInt(stored, 10));
    }
  }, []);

  // Play welcome sound on mount
  useEffect(() => {
    try {
      if (!welcomeAudioRef.current) {
        welcomeAudioRef.current = new Audio(welcomeSound);
      }
      welcomeAudioRef.current.play().catch(err => {
        console.log('Audio autoplay prevented:', err);
      });
    } catch (error) {
      console.log('Error playing welcome sound:', error);
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend) return;

    // Check if free chats exhausted
    if (freeChatsUsed >= FREE_CHAT_LIMIT) {
      setShowLoginModal(true);
      return;
    }

    const userMessage: Message = { role: "user", content: textToSend };
    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    setInput("");
    setIsThinking(true);

    // Increment free chats used
    const newCount = freeChatsUsed + 1;
    setFreeChatsUsed(newCount);
    localStorage.setItem(STORAGE_KEY, newCount.toString());

    try {
      // Call kris-chat function without auth for demo
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/kris-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
          },
          body: JSON.stringify({
            messages: currentMessages.map(m => ({
              role: m.role,
              content: m.content
            })),
            userId: 'demo-user',
            files: [],
            useOpenRouter: false
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      if (!reader) throw new Error('No response body');

      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              
              if (content) {
                assistantMessage += content;
                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = {
                    role: "assistant",
                    content: assistantMessage
                  };
                  return newMessages;
                });
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      // Show login prompt if limit reached after this message
      if (newCount >= FREE_CHAT_LIMIT) {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            role: "assistant",
            content: "🔒 You've used your 2 free messages! To continue chatting and unlock all features of KRIS Lab, please sign up for a free account. It only takes 30 seconds!"
          }]);
          setShowLoginModal(true);
        }, 1500);
      }

      setIsThinking(false);
    } catch (error: any) {
      console.error('Error:', error);
      setIsThinking(false);
      
      // Provide a fallback response
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I'm excited to help you explore! KRIS Lab offers AI experimentation, circuit design, 3D modeling, and more. Sign up to unlock the full experience and start building your projects!"
      }]);
    }
  };

  const remainingChats = Math.max(0, FREE_CHAT_LIMIT - freeChatsUsed);

  return (
    <main className="min-h-screen bg-background circuit-bg flex flex-col">
      {/* Header */}
      <header className="border-b border-primary/30 bg-card/50 backdrop-blur-sm p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={krisLogo} 
              alt="KRIS" 
              className="w-10 h-10 rounded-full neon-border cursor-pointer"
              onClick={() => navigate("/")}
            />
            <div>
              <h1 className="text-lg font-semibold text-primary">KRIS AI LAB</h1>
              <p className="text-xs text-muted-foreground">Virtual Innovation Lab</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-primary/50">
              <Zap className="w-3 h-3 mr-1" />
              {remainingChats} free {remainingChats === 1 ? 'chat' : 'chats'} left
            </Badge>
            <Button 
              size="sm" 
              onClick={() => navigate("/auth")}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Sign Up Free
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex max-w-6xl mx-auto w-full">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col p-4">
          {/* Messages */}
          <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
            <div className="space-y-4 pb-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-primary/30"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="flex items-center gap-2 mb-2">
                        <Bot className="w-4 h-4 text-primary" />
                        <span className="text-xs text-primary font-medium">K.R.I.S</span>
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}
              
              {isThinking && (
                <div className="flex justify-start">
                  <div className="bg-card border border-primary/30 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-primary animate-pulse" />
                      <span className="text-xs text-primary">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Quick Actions */}
          {messages.length <= 2 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSend(action.prompt)}
                  className="border-primary/30 hover:border-primary hover:bg-primary/10"
                  disabled={freeChatsUsed >= FREE_CHAT_LIMIT}
                >
                  {action.icon}
                  <span className="ml-2">{action.label}</span>
                </Button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-primary/30 pt-4">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={freeChatsUsed >= FREE_CHAT_LIMIT ? "Sign up to continue chatting..." : "Ask me anything about building, learning, or innovating..."}
                className="flex-1 min-h-[60px] resize-none bg-input border-primary/30 focus:border-primary"
                disabled={freeChatsUsed >= FREE_CHAT_LIMIT}
              />
              <Button
                onClick={() => handleSend()}
                disabled={isThinking || !input.trim() || freeChatsUsed >= FREE_CHAT_LIMIT}
                className="bg-primary text-primary-foreground hover:bg-primary/90 self-end"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Side Panel - Features */}
        <aside className="hidden lg:block w-72 border-l border-primary/30 p-4 bg-card/30">
          <h3 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Unlock Full Lab Access
          </h3>
          
          <div className="space-y-3 mb-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 border border-primary/20"
              >
                <div className="text-primary">{feature.icon}</div>
                <div>
                  <p className="text-xs font-medium text-foreground">{feature.title}</p>
                  <p className="text-xs text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <Button 
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => navigate("/auth")}
          >
            <Lock className="w-4 h-4 mr-2" />
            Sign Up to Unlock
          </Button>
          
          <p className="text-xs text-muted-foreground text-center mt-3">
            Free account • No credit card required
          </p>
        </aside>
      </div>

      {/* Login Modal */}
      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent className="bg-card border-primary/30 max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <img 
                src={krisLogo} 
                alt="KRIS" 
                className="w-16 h-16 rounded-full neon-border"
              />
            </div>
            <DialogTitle className="text-center text-xl text-primary">
              Unlock Full KRIS Lab Access
            </DialogTitle>
            <DialogDescription className="text-center">
              You've used your 2 free messages. Sign up for a free account to continue chatting and access all lab features!
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 my-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Brain className="w-5 h-5 text-primary" />
              <span className="text-sm">Unlimited AI conversations</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Cpu className="w-5 h-5 text-primary" />
              <span className="text-sm">Full simulation & 3D lab access</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <FolderKanban className="w-5 h-5 text-primary" />
              <span className="text-sm">Save & manage your projects</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button 
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => navigate("/auth")}
            >
              Sign Up Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button 
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={() => navigate("/auth")}
            >
              Already have an account? Sign In
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default TryLab;
