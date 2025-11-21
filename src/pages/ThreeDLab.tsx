import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Send, Box, History, Edit2, Loader2, ExternalLink, Trash2 } from "lucide-react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ChatItem {
  id: string;
  name: string;
  date: string;
  preview: string;
}

const ThreeDLab = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const projectName = searchParams.get('projectName');
  
  const [prompt, setPrompt] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatItem[]>([
    { id: "1", name: "PCB Housing Design", date: "2025-10-17", preview: "3D model of electronic enclosure" },
    { id: "2", name: "Motor Mount Bracket", date: "2025-10-16", preview: "Mechanical mounting component" },
    { id: "3", name: "Sensor Array Holder", date: "2025-10-15", preview: "Multi-sensor fixture design" },
  ]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDescription, setGeneratedDescription] = useState("");
  
  // Hugging Face token management
  const [hfToken, setHfToken] = useState<string>("");
  const [tokenInput, setTokenInput] = useState<string>("");
  const [showTokenForm, setShowTokenForm] = useState(false);

  useEffect(() => {
    if (projectId && projectName) {
      toast.success(`Working on project: ${projectName}`);
    }
    
    // Check for HF token
    const envToken = import.meta.env.VITE_HF_TOKEN;
    const storedToken = localStorage.getItem("hf_token");
    
    if (envToken) {
      setHfToken(envToken);
    } else if (storedToken) {
      setHfToken(storedToken);
    } else {
      setShowTokenForm(true);
    }
  }, [projectId, projectName]);

  const handleSaveToken = () => {
    if (tokenInput.trim()) {
      localStorage.setItem("hf_token", tokenInput.trim());
      setHfToken(tokenInput.trim());
      setShowTokenForm(false);
      toast.success("Hugging Face token saved!");
    } else {
      toast.error("Please enter a valid token");
    }
  };

  const handleClearToken = () => {
    localStorage.removeItem("hf_token");
    setHfToken("");
    setShowTokenForm(true);
    toast.info("Token cleared");
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    
    setIsGenerating(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please log in to generate a 3D description");
        setIsGenerating(false);
        navigate('/auth');
        return;
      }
      
      const { data, error } = await supabase.functions.invoke('generate-3d-description', {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: { 
          prompt,
          projectId,
          projectContext: projectName ? `Project: ${projectName}` : undefined
        }
      });

      if (error) throw error;

      if (data.success) {
        const newChat: ChatItem = {
          id: Date.now().toString(),
          name: prompt.substring(0, 30) + "...",
          date: new Date().toISOString().split('T')[0],
          preview: prompt,
        };
        
        setChatHistory(prev => [newChat, ...prev]);
        setGeneratedDescription(data.content);
        toast.success("3D model description generated!");
      }
      
      setPrompt("");
    } catch (error) {
      console.error('Error generating 3D description:', error);
      toast.error("Failed to generate 3D description. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRename = (id: string, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
  };

  const saveRename = (id: string) => {
    setChatHistory(prev => 
      prev.map(item => 
        item.id === id ? { ...item, name: editName } : item
      )
    );
    setEditingId(null);
  };

  const huggingFaceUrl = hfToken 
    ? `https://tencent-hunyuan3d-2.hf.space/?__theme=dark&hf_token=${hfToken}`
    : "";

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
            <h1 className="text-2xl font-bold text-primary neon-glow">3D Laboratory</h1>
            {projectName && (
              <Badge variant="default" className="ml-2">
                {projectName}
              </Badge>
            )}
          </div>
          <Badge variant="outline" className="border-primary/50">
            AI 3D Generation
          </Badge>
        </div>
      </header>
      
      <div className="flex-1 container mx-auto p-4 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full rounded-lg border border-primary/30">
          {/* Left Panel - Main Content */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="flex h-full gap-4 p-4">
              {/* Chat History Sidebar */}
              <Card className="w-64 p-4 bg-card/80 backdrop-blur-sm border-primary/30">
                <div className="flex items-center gap-2 mb-4">
                  <History className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-primary">History</h3>
                </div>
                <ScrollArea className="h-[calc(100vh-240px)]">
                  <div className="space-y-2">
                    {chatHistory.map(chat => (
                      <div
                        key={chat.id}
                        className="p-3 bg-muted/30 rounded-lg border border-primary/20 hover:border-primary/50 transition-colors"
                      >
                        {editingId === chat.id ? (
                          <div className="space-y-2">
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="h-7 text-xs"
                            />
                            <div className="flex gap-1">
                              <Button size="sm" onClick={() => saveRename(chat.id)} className="h-6 text-xs">
                                Save
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="h-6 text-xs">
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-sm text-foreground truncate">
                                  {chat.name}
                                </div>
                                <div className="text-xs text-muted-foreground">{chat.date}</div>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={() => handleRename(chat.id, chat.name)}
                              >
                                <Edit2 className="w-3 h-3" />
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {chat.preview}
                            </p>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </Card>

              {/* Prompt Section */}
              <Card className="flex-1 bg-card/80 backdrop-blur-sm border-primary/30 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Box className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-primary">3D Prompt Generator</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                      Describe your 3D engineering project
                    </label>
                    <Textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Example: Create a 3D model of a PCB enclosure with ventilation slots, mounting holes, and a transparent top cover..."
                      className="min-h-[200px] bg-background/50 border-primary/20"
                    />
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Generate 3D Model
                      </>
                    )}
                  </Button>

                  {generatedDescription && (
                    <div className="p-4 bg-muted/30 rounded-lg border border-primary/20 max-h-[200px] overflow-y-auto">
                      <h4 className="text-sm font-semibold text-primary mb-2">AI Generated Description</h4>
                      <p className="text-xs text-foreground whitespace-pre-wrap">{generatedDescription}</p>
                    </div>
                  )}

                  <div className="p-4 bg-muted/30 rounded-lg border border-primary/20">
                    <h4 className="text-sm font-semibold text-primary mb-2">Capabilities</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• AI-powered 3D model generation</li>
                      <li>• Engineering project visualization</li>
                      <li>• Interactive 3D workspace</li>
                      <li>• Export for manufacturing</li>
                      <li>• Real-time model rendering</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Panel - Hugging Face Space */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="h-full relative bg-card/80 backdrop-blur-sm">
              {showTokenForm ? (
                <div className="h-full flex flex-col items-center justify-center p-8 space-y-4">
                  <Box className="w-16 h-16 text-primary/60" />
                  <h3 className="text-lg font-semibold text-primary">Hugging Face Token Required</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-md">
                    To access the Hunyuan3D-2 model, you need a Hugging Face token.
                  </p>
                  <div className="w-full max-w-md space-y-3">
                    <Input
                      type="password"
                      placeholder="Enter your Hugging Face token"
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value)}
                      className="bg-background/50 border-primary/20"
                    />
                    <Button onClick={handleSaveToken} className="w-full bg-primary hover:bg-primary/90">
                      Save Token
                    </Button>
                    <a
                      href="https://huggingface.co/settings/tokens"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 text-xs text-primary hover:underline"
                    >
                      Get your token from Hugging Face
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ) : (
                <>
                  <div className="absolute top-2 right-2 z-10 flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => window.open(huggingFaceUrl, '_blank', 'noopener,noreferrer')}
                      className="shadow-lg"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Open in New Tab
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleClearToken}
                      className="shadow-lg"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Clear Token
                    </Button>
                  </div>
                  <iframe
                    src={huggingFaceUrl}
                    className="w-full h-full border-0"
                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    title="Hunyuan3D-2 Model"
                  />
                </>
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default ThreeDLab;
