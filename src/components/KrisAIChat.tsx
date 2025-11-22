import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Send, Bot, Mic, Image as ImageIcon, Search, Code, Brain, Maximize2, Minimize2, Trash2, History, Clock, Plus, Edit2, Paperclip, X, Radio, Rocket, GraduationCap, CircuitBoard, Box, Lightbulb, FileText, Volume2, ArrowRight, Images, ArrowDown, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import krisLogo from "@/assets/kris-logo.jpg";
import { VoiceMode } from "./VoiceMode";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface Message {
  role: "user" | "assistant";
  content: string;
  type?: "text" | "image" | "voice" | "file";
  imageUrl?: string;
  fileUrl?: string;
  fileName?: string;
  redirect?: {
    module: string;
    label: string;
    prompt?: string;
  };
  id?: string;
}

interface Conversation {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  current_phase: string;
  created_at: string;
}

interface KrisAIChatProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contextData?: any;
}

export const KrisAIChat = ({ open, onOpenChange, contextData }: KrisAIChatProps) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [editingConversationId, setEditingConversationId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userId, setUserId] = useState<string>("");
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [showVoiceMode, setShowVoiceMode] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [showProjectNav, setShowProjectNav] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [showImageLibrary, setShowImageLibrary] = useState(false);
  const [imageLibrary, setImageLibrary] = useState<{url: string, conversation: string, date: string}[]>([]);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingMessageContent, setEditingMessageContent] = useState("");
  const [conversationTitle, setConversationTitle] = useState<string>("");

  // Get authenticated user ID
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  // Load conversations and image library on open
  useEffect(() => {
    if (open) {
      loadConversations();
      loadImageLibrary();
    }
  }, [open]);

  // Handle scroll detection for scroll-to-bottom button
  useEffect(() => {
    const scrollElement = scrollViewportRef.current;
    if (!scrollElement) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollElement;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    };

    scrollElement.addEventListener('scroll', handleScroll);
    return () => scrollElement.removeEventListener('scroll', handleScroll);
  }, [messages]);

  const loadImageLibrary = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('chat_history')
        .select('image_url, conversation_id, created_at')
        .eq('user_id', userId)
        .not('image_url', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get conversation names
      const convIds = [...new Set(data.map((d: any) => d.conversation_id))];
      const { data: convData } = await (supabase as any)
        .from('conversations')
        .select('id, name')
        .in('id', convIds);

      const convMap = new Map(convData?.map((c: any) => [c.id, c.name]) || []);

      setImageLibrary(data.map((img: any) => ({
        url: img.image_url,
        conversation: convMap.get(img.conversation_id) || 'Unknown',
        date: new Date(img.created_at).toLocaleDateString()
      })));
    } catch (error) {
      console.error('Error loading image library:', error);
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollViewportRef.current) {
      scrollViewportRef.current.scrollTop = scrollViewportRef.current.scrollHeight;
    }
  }, [messages]);

  const loadConversations = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setConversations(data);
        // Load the most recent conversation
        if (!currentConversation) {
          loadConversation(data[0].id);
        }
      } else {
        // Create a new conversation if none exists
        createNewConversation();
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadConversation = async (conversationId: string) => {
    try {
      setIsLoadingHistory(true);
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(data.map((msg: any) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        imageUrl: msg.image_url,
      })));
      
      const conv = conversations.find(c => c.id === conversationId) || null;
      setCurrentConversation(conv);
      setConversationTitle(conv?.name || "");
      setActiveConversationId(conversationId);
    } catch (error: any) {
      console.error('Error loading conversation:', error);
      toast({
        title: "Error",
        description: "Failed to load conversation",
        variant: "destructive"
      });
    } finally {
      setIsLoadingHistory(false);
    }
  };


  const createNewConversation = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('conversations')
        .insert({
          user_id: userId,
          name: `New Chat ${new Date().toLocaleDateString()}`
        })
        .select()
        .single();

      if (error) throw error;

      setConversations(prev => [data, ...prev]);
      setCurrentConversation(data);
      setActiveConversationId(data.id);
      setConversationTitle("");
      setMessages([{
        role: "assistant",
        content: "Hey there! I'm K.R.I.S (Kunal Raj Intelligence System) - your personal AI buddy and research partner! 👋\n\n🚀 What I'm All About:\nI'm here to help you create NEW, ORIGINAL inventions through scientific logic and creative imagination. Not by mixing existing stuff, but by dreaming up fresh concepts that might not exist yet!\n\n✨ What We Can Do Together:\n• Generate original concepts based on scientific principles\n• Explain how things could work (physics, chemistry, computation)\n• Find you research materials (papers, books, studies)\n• Guide you through prototype design and testing\n• Create images and visualizations with AI watermarking\n• Analyze your documents, PDFs, and images\n• Process your files and research materials\n• Explore wild ideas and ask thought-provoking questions\n• Connect concepts across different fields\n\nJust upload your files or share your ideas - let's invent something amazing! 🎯",
        type: "text"
      }]);

      toast({
        title: "New Conversation",
        description: "Started a new conversation"
      });
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Error",
        description: "Failed to create new conversation",
        variant: "destructive"
      });
    }
  };

  const generateChatTitle = async (conversationId: string, messageHistory: Message[]) => {
    try {
      // Only generate title after 3+ messages
      if (messageHistory.length < 3) return;

      const { data, error } = await supabase.functions.invoke('generate-chat-title', {
        body: {
          messages: messageHistory.slice(0, 6).map(m => ({ role: m.role, content: m.content }))
        }
      });

      if (error) throw error;

      if (data?.title) {
        await updateConversationName(conversationId, data.title);
      }
    } catch (error) {
      console.error('Error generating chat title:', error);
    }
  };

  const detectProjectCreation = (messageContent: string) => {
    const projectKeywords = ['create project', 'start project', 'new project', 'build a', 'make a', 'develop a'];
    return projectKeywords.some(keyword => messageContent.toLowerCase().includes(keyword));
  };

  const createProject = async (title: string, description: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('manage-project', {
        headers: session?.access_token ? {
          Authorization: `Bearer ${session.access_token}`
        } : {},
        body: {
          action: 'create',
          projectData: {
            title,
            description
          }
        }
      });

      if (error) throw error;

      setCurrentProject(data.project);
      setShowProjectNav(true);
      
      // Update conversation name to project title
      if (currentConversation) {
        await updateConversationName(currentConversation.id, title);
      }

      toast({
        title: "Project Created",
        description: `Project "${title}" has been created and is ready for development!`
      });

      return data.project;
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive"
      });
      return null;
    }
  };

  const navigateToModule = (module: string, prompt?: string) => {
    // Store redirect prompt for target module to retrieve
    if (prompt) {
      localStorage.setItem('krisRedirectPrompt', prompt);
      localStorage.setItem('krisRedirectModule', module);
      localStorage.setItem('krisRedirectTimestamp', Date.now().toString());
    }
    
    onOpenChange(false);
    const routes: Record<string, string> = {
      'learning': '/learning-hub',
      'circuit': '/circuit-canvas',
      '3d-lab': '/3d-lab',
      'scientist': '/ai-scientist',
      'simulation': '/simulation',
      'projects': '/project-manager'
    };
    
    const route = routes[module];
    if (route) {
      const params = new URLSearchParams();
      if (currentProject) {
        params.append('projectId', currentProject.id);
        params.append('projectName', currentProject.title);
      }
      if (prompt) params.append('krisRedirect', 'true');
      
      navigate(`${route}${params.toString() ? '?' + params.toString() : ''}`);
    }
  };

  const updateConversationName = async (conversationId: string, newName: string) => {
    try {
      const { error } = await (supabase as any)
        .from('conversations')
        .update({ name: newName })
        .eq('id', conversationId);

      if (error) throw error;

      setConversations(prev => prev.map(conv => 
        conv.id === conversationId ? { ...conv, name: newName } : conv
      ));

      if (currentConversation?.id === conversationId) {
        setCurrentConversation(prev => prev ? { ...prev, name: newName } : null);
        setConversationTitle(newName);
      }

      setEditingConversationId(null);
      setEditingName("");
    } catch (error) {
      console.error('Error updating conversation name:', error);
      toast({
        title: "Error",
        description: "Failed to update conversation name",
        variant: "destructive"
      });
    }
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('conversations')
        .delete()
        .eq('id', conversationId);

      if (error) throw error;

      setConversations(prev => prev.filter(conv => conv.id !== conversationId));

      if (currentConversation?.id === conversationId) {
        // Load another conversation or create new one
        const remaining = conversations.filter(c => c.id !== conversationId);
        if (remaining.length > 0) {
          loadConversation(remaining[0].id);
        } else {
          createNewConversation();
        }
      }

      toast({
        title: "Conversation Deleted",
        description: "The conversation has been deleted"
      });
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive"
      });
    }
  };

  const saveChatMessage = async (role: "user" | "assistant", content: string, imageUrl?: string) => {
    if (!currentConversation) return;
    
    try {
      await (supabase as any)
        .from('chat_history')
        .insert({
          user_id: userId,
          conversation_id: currentConversation.id,
          role,
          content,
          image_url: imageUrl
        });

      // Update conversation's updated_at timestamp
      await (supabase as any)
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', currentConversation.id);
    } catch (error) {
      console.error('Error saving chat message:', error);
    }
  };



  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsRecording(false);
      };

      recognitionRef.current.onerror = () => {
        setIsRecording(false);
        toast({
          title: "Voice input error",
          description: "Could not capture voice input. Please try again.",
          variant: "destructive"
        });
      };
    }
  }, []);

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Voice input unavailable",
        description: "Your browser doesn't support voice input.",
        variant: "destructive"
      });
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const cleanTextForSpeech = (text: string): string => {
    // Remove emojis and special characters, keep alphanumeric and basic punctuation
    return text
      .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Misc Symbols and Pictographs
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport and Map
      .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') // Flags
      .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Misc symbols
      .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Dingbats
      .replace(/[\u{1F900}-\u{1F9FF}]/gu, '') // Supplemental Symbols and Pictographs
      .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '') // Chess Symbols
      .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '') // Symbols and Pictographs Extended-A
      .replace(/[•●○◆◇■□▪▫]/g, '')            // Common bullet points
      .replace(/[✨🚀👋✓]/g, '')                 // Popular special chars
      .trim();
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      stopSpeaking(); // Stop any ongoing speech
      const cleanedText = cleanTextForSpeech(text);
      const utterance = new SpeechSynthesisUtterance(cleanedText);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    setUploadedFiles(prev => [...prev, ...newFiles]);

    toast({
      title: "Files Uploaded",
      description: `${newFiles.length} file(s) uploaded successfully`
    });
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const processFiles = async (files: File[]): Promise<string> => {
    let fileContents = "";

    for (const file of files) {
      const fileType = file.type;
      
      try {
        if (fileType.startsWith('text/') || fileType === 'application/json') {
          // Text-based files
          const text = await file.text();
          fileContents += `\n\n--- File: ${file.name} ---\n${text}`;
        } else if (fileType === 'application/pdf' || 
                   fileType.includes('word') || 
                   fileType.includes('powerpoint') || 
                   fileType.includes('excel')) {
          // Document files - would need document parsing
          fileContents += `\n\n--- File: ${file.name} (${fileType}) ---\n[Document content - processing capability can be added]`;
        } else if (fileType.startsWith('image/')) {
          // Images
          const base64 = await convertToBase64(file);
          fileContents += `\n\n--- Image: ${file.name} ---\n[Image uploaded - can be analyzed by AI]`;
        } else {
          fileContents += `\n\n--- File: ${file.name} (${fileType}) ---\n[File type not directly readable]`;
        }
      } catch (error) {
        console.error('Error processing file:', file.name, error);
        fileContents += `\n\n--- File: ${file.name} ---\n[Error processing file]`;
      }
    }

    return fileContents;
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Add watermark to generated images
  const addWatermarkToImage = async (imageDataUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          resolve(imageDataUrl);
          return;
        }
        
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw the original image
        ctx.drawImage(img, 0, 0);
        
        // Load and draw the logo
        const logo = new Image();
        logo.crossOrigin = "anonymous";
        logo.src = "/src/assets/kris-logo.jpg";
        
        logo.onload = () => {
          // Calculate logo size (5% of image width, maintain aspect ratio)
          const logoWidth = img.width * 0.08;
          const logoHeight = (logo.height / logo.width) * logoWidth;
          
          // Position in bottom right with padding
          const x = img.width - logoWidth - 20;
          const y = img.height - logoHeight - 20;
          
          // Add semi-transparent background for logo
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.fillRect(x - 5, y - 5, logoWidth + 10, logoHeight + 10);
          
          // Draw logo
          ctx.drawImage(logo, x, y, logoWidth, logoHeight);
          
          resolve(canvas.toDataURL('image/png'));
        };
        
        logo.onerror = () => {
          // If logo fails to load, just return original image
          resolve(canvas.toDataURL('image/png'));
        };
      };
      
      img.onerror = () => {
        resolve(imageDataUrl);
      };
      
      img.src = imageDataUrl;
    });
  };

  const handleSend = async () => {
    if (!input.trim() && uploadedFiles.length === 0) return;

    const userMessage: Message = { role: "user", content: input, type: uploadedFiles.length > 0 ? "file" : "text" };
    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    
    // Save user message
    await saveChatMessage("user", input);
    
    const currentInput = input;
    const currentFiles = [...uploadedFiles];
    setInput("");
    setUploadedFiles([]);
    setIsThinking(true);

    try {
      // Convert files to base64
      const filesData = await Promise.all(
        currentFiles.map(async (file) => {
          const base64 = await convertToBase64(file);
          return {
            name: file.name,
            type: file.type,
            data: base64,
          };
        })
      );

      // Get session for auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Please log in", description: "Sign in to chat with KRIS.", variant: "destructive" });
        setIsThinking(false);
        navigate('/auth');
        return;
      }
      
      // Call kris-chat function with files
      const { data, error } = await supabase.functions.invoke('kris-chat', {
        headers: session?.access_token ? {
          Authorization: `Bearer ${session.access_token}`
        } : {},
        body: {
          messages: currentMessages.map(m => ({
            role: m.role,
            content: m.content
          })),
          userId,
          files: filesData,
          useOpenRouter: false,
          currentProject: currentProject
        }
      });

      // Note: kris-chat streams SSE; ignore non-JSON response here
      // if (error) throw error;

      // Check if response contains an image
      if (data && data.image) {
        // Add watermark to the generated image
        const watermarkedImage = await addWatermarkToImage(data.image);
        
        const assistantMessage: Message = {
          role: "assistant",
          content: data.content || "I've created an image for you with the KRIS watermark!",
          type: "image",
          imageUrl: watermarkedImage
        };

        setMessages(prev => [...prev, assistantMessage]);
        await saveChatMessage("assistant", assistantMessage.content, watermarkedImage);
        speakResponse(assistantMessage.content);
        setIsThinking(false);
        return;
      }

      // Handle streaming text response using environment variable for correct Supabase URL
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(
        `${supabaseUrl}/functions/v1/kris-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token || ''}`,
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
          },
          body: JSON.stringify({
            messages: currentMessages.map(m => ({
              role: m.role,
              content: m.content
            })),
            userId,
            files: filesData,
            useOpenRouter: false,
            openRouterKey: undefined,
            currentProject: currentProject
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";
      let assistantImageUrl: string | undefined;
      const streamConversationId = currentConversation?.id;

      if (!reader) throw new Error('No response body');

      setMessages(prev => [...prev, { role: "assistant", content: "", type: "text" }]);

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
              const redirect = parsed.choices?.[0]?.delta?.redirect;
              const conversationTitle = parsed.choices?.[0]?.delta?.conversationTitle;
              const imageUrl = parsed.choices?.[0]?.delta?.image_url;
              
              if (content) {
                assistantMessage += content;
              }
              
              if (imageUrl) {
                assistantImageUrl = imageUrl;
              }
              
              // Only update messages if we're still in the same conversation
              if (streamConversationId === activeConversationId) {
                // Update or create assistant message
                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastMsg = newMessages[newMessages.length - 1];
                  
                  if (lastMsg?.role === "assistant") {
                    // Update existing assistant message
                    newMessages[newMessages.length - 1] = {
                      role: "assistant",
                      content: assistantMessage || "Here's your image!",
                      type: imageUrl ? "image" : "text",
                      ...(imageUrl && { imageUrl })
                    };
                  } else {
                    // Create new assistant message
                    newMessages.push({
                      role: "assistant",
                      content: assistantMessage || "Here's your image!",
                      type: imageUrl ? "image" : "text",
                      ...(imageUrl && { imageUrl })
                    });
                  }
                  return newMessages;
                });
                
                if (redirect) {
                  setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].redirect = redirect;
                    return newMessages;
                  });
                }
              }
              
              if (conversationTitle && currentConversation && streamConversationId === activeConversationId) {
                setConversationTitle(conversationTitle);
                updateConversationName(currentConversation.id, conversationTitle);
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      // Only save if still in the same conversation
      if (streamConversationId === activeConversationId) {
        await saveChatMessage("assistant", assistantMessage, assistantImageUrl);
        
        // Generate chat title after a few messages
        if (currentConversation && messages.length >= 2) {
          generateChatTitle(currentConversation.id, [...messages, { role: "assistant", content: assistantMessage }]);
        }
      }

      // Fallback: if user asked for an image but none arrived via stream, call dedicated generator
      try {
        const inputLower = currentInput.toLowerCase();
        const imageKeywords = [
          'generate image', 'create image', 'draw', 'make image', 'show me', 'visualize',
          'picture of', 'image of', 'image', 'picture'
        ];
        const askedForImage = imageKeywords.some(k => inputLower.includes(k));

        if (!assistantImageUrl && askedForImage) {
          const { data: giData, error: giError } = await supabase.functions.invoke('generate-image', {
            headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
            body: { prompt: currentInput }
          });
          if (giError) throw giError;
          const fallbackUrl = giData?.imageUrl;
          if (fallbackUrl) {
            setMessages(prev => [
              ...prev,
              { role: 'assistant', content: "Here's your image!", type: 'image', imageUrl: fallbackUrl }
            ]);
            await saveChatMessage('assistant', "Here's your image!", fallbackUrl);
          }
        }
      } catch (e) {
        console.error('Fallback image generation failed:', e);
      }
      
      // Detect if this is a project creation
      if (detectProjectCreation(currentInput) && !currentProject) {
        // Extract project title and description from conversation
        const title = currentInput.substring(0, 100); // Simple extraction
        const description = assistantMessage;
        await createProject(title, description);
      }
      
      setIsThinking(false);

      if (assistantMessage.length < 200) {
        speakResponse(assistantMessage);
      }
    } catch (error: any) {
      console.error('Error:', error);
      setIsThinking(false);
      toast({
        title: "Error",
        description: error.message || "Failed to get response from KRIS",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      {showVoiceMode && (
        <VoiceMode 
          onClose={() => {
            setShowVoiceMode(false);
            onOpenChange(true);
          }}
          conversationId={currentConversation?.id}
          userId={userId}
        />
      )}
      
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={`${isFullscreen ? 'max-w-full h-screen' : 'max-w-4xl h-[85vh]'} flex flex-col bg-card border-primary/30 transition-all`}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={krisLogo} 
                alt="KRIS" 
                className="w-10 h-10 rounded-full border-2 border-primary"
              />
              <div>
                <DialogTitle className="flex items-center gap-2 text-primary">
                  K.R.I.S {currentProject && <Badge variant="secondary" className="text-xs">{currentProject.current_phase}</Badge>}
                </DialogTitle>
                {conversationTitle && messages.length > 2 ? (
                  <div className="text-sm font-medium text-foreground mt-1">
                    {conversationTitle}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{currentProject ? currentProject.title : "Your Personal AI Buddy & Research Partner"}</span>
                    <div className="flex gap-2">
                      <Brain className="w-3 h-3" />
                      <Search className="w-3 h-3" />
                      <ImageIcon className="w-3 h-3" />
                      <Mic className="w-3 h-3" />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Sheet open={showHistory} onOpenChange={setShowHistory}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    title="View Conversations"
                  >
                    <History className="w-4 h-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 bg-card border-primary/30">
                  <SheetHeader>
                    <SheetTitle className="text-primary">
                      {!showImageLibrary ? 'Conversations' : 'Image Library'}
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex gap-2 mt-4 border-b pb-2">
                    <Button
                      variant={!showImageLibrary ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setShowImageLibrary(false)}
                      className="flex-1"
                    >
                      <History className="w-4 h-4 mr-1" />
                      Chats
                    </Button>
                    <Button
                      variant={showImageLibrary ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setShowImageLibrary(true)}
                      className="flex-1"
                    >
                      <Images className="w-4 h-4 mr-1" />
                      Library
                    </Button>
                  </div>
                  {!showImageLibrary ? (
                    <>
                      <div className="mt-4 mb-4">
                        <Button
                          onClick={createNewConversation}
                          className="w-full"
                          variant="outline"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          New Conversation
                        </Button>
                      </div>
                      <ScrollArea className="h-[calc(100vh-14rem)]">
                        <div className="space-y-2">
                          {conversations.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">No conversations yet</p>
                          ) : (
                            conversations.map((conversation) => (
                              <div
                                key={conversation.id}
                                className={`p-3 rounded-lg border transition-colors ${
                                  currentConversation?.id === conversation.id
                                    ? "bg-primary/20 border-primary"
                                    : "hover:bg-primary/10 border-primary/20"
                                }`}
                              >
                                {editingConversationId === conversation.id ? (
                                  <div className="flex items-center gap-2">
                                    <Input
                                      value={editingName}
                                      onChange={(e) => setEditingName(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          updateConversationName(conversation.id, editingName);
                                        } else if (e.key === 'Escape') {
                                          setEditingConversationId(null);
                                          setEditingName("");
                                        }
                                      }}
                                      className="flex-1"
                                      autoFocus
                                    />
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => updateConversationName(conversation.id, editingName)}
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-between gap-2">
                                    <button
                                      onClick={() => {
                                        loadConversation(conversation.id);
                                        setShowHistory(false);
                                      }}
                                      className="flex-1 text-left min-w-0"
                                    >
                                      <p className="text-sm font-medium truncate">{conversation.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {new Date(conversation.updated_at).toLocaleDateString()}
                                      </p>
                                    </button>
                                    <div className="flex gap-1 flex-shrink-0">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditingConversationId(conversation.id);
                                          setEditingName(conversation.name);
                                        }}
                                        title="Edit"
                                      >
                                        <Edit2 className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          deleteConversation(conversation.id);
                                        }}
                                        title="Delete"
                                      >
                                        <Trash2 className="w-3 h-3 text-destructive" />
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </ScrollArea>
                    </>
                  ) : (
                    <ScrollArea className="h-[calc(100vh-12rem)] mt-4">
                      <div className="grid grid-cols-2 gap-2">
                        {imageLibrary.length === 0 ? (
                          <div className="col-span-2 text-center py-8 text-muted-foreground">
                            No images generated yet
                          </div>
                        ) : (
                          imageLibrary.map((img, idx) => (
                            <div key={idx} className="group relative border rounded-lg overflow-hidden hover:border-primary transition-all">
                              <img src={img.url} alt="Generated" className="w-full h-32 object-cover" />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                                <p className="text-xs text-white truncate">{img.conversation}</p>
                                <p className="text-xs text-white/70">{img.date}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  )}
                </SheetContent>
              </Sheet>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Project Navigation Bar */}
        {currentProject && showProjectNav && (
          <div className="border-b border-primary/30 bg-card/30 p-3">
            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="text-xs font-semibold text-muted-foreground mr-2">Quick Navigate:</span>
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-shrink-0"
                onClick={() => navigateToModule('learning')}
              >
                <GraduationCap className="w-3 h-3 mr-1" />
                Learn
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-shrink-0"
                onClick={() => navigateToModule('scientist')}
              >
                <Lightbulb className="w-3 h-3 mr-1" />
                AI Scientist
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-shrink-0"
                onClick={() => navigateToModule('circuit')}
              >
                <CircuitBoard className="w-3 h-3 mr-1" />
                Circuit
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-shrink-0"
                onClick={() => navigateToModule('3d')}
              >
                <Box className="w-3 h-3 mr-1" />
                3D Lab
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-shrink-0"
                onClick={() => navigateToModule('simulation')}
              >
                <Rocket className="w-3 h-3 mr-1" />
                Simulate
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-shrink-0"
                onClick={() => navigateToModule('manager')}
              >
                <FileText className="w-3 h-3 mr-1" />
                Report
              </Button>
            </div>
          </div>
        )}

        <div className="relative flex-1 overflow-hidden">
          <div className="h-full overflow-auto pr-4" ref={scrollViewportRef}>
            {isLoadingHistory ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Loading chat history...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={message.id || index}
                    className={`flex gap-3 ${
                      message.role === "assistant" ? "justify-start" : "justify-end"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <img 
                        src={krisLogo} 
                        alt="KRIS" 
                        className="w-8 h-8 rounded-full border border-primary flex-shrink-0"
                      />
                    )}
                    <div
                      className={`rounded-lg px-4 py-2 max-w-[80%] ${
                        message.role === "assistant"
                          ? "bg-muted/50"
                          : "bg-primary/20"
                      }`}
                    >
                      {editingMessageId === message.id && message.role === "user" ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editingMessageContent}
                            onChange={(e) => setEditingMessageContent(e.target.value)}
                            className="min-h-[60px]"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={async () => {
                                try {
                                  const { error } = await supabase
                                    .from('chat_history')
                                    .update({ content: editingMessageContent })
                                    .eq('id', message.id);

                                  if (error) throw error;

                                  setMessages(prev => prev.map(m => 
                                    m.id === message.id ? { ...m, content: editingMessageContent } : m
                                  ));
                                  setEditingMessageId(null);
                                  toast({
                                    title: "Message updated",
                                    description: "Your message has been updated successfully"
                                  });
                                } catch (error: any) {
                                  console.error('Error updating message:', error);
                                  toast({
                                    title: "Error",
                                    description: "Failed to update message",
                                    variant: "destructive"
                                  });
                                }
                              }}
                            >
                              <Check className="w-3 h-3 mr-1" />
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingMessageId(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      )}
                    {message.imageUrl && (
                      <img 
                        src={message.imageUrl} 
                        alt="Generated" 
                        className="mt-2 rounded-lg max-w-full cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(message.imageUrl, '_blank')}
                      />
                    )}
                      {message.role === "assistant" && (
                        <div className="flex gap-2 mt-2">
                          {!isSpeaking ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => speakResponse(message.content)}
                              title="Speak this response"
                            >
                              <Volume2 className="w-3 h-3 mr-1" />
                              Speak
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={stopSpeaking}
                              title="Stop speaking"
                              className="text-destructive"
                            >
                              <X className="w-3 h-3 mr-1" />
                              Stop
                            </Button>
                          )}
                          {message.redirect && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigateToModule(message.redirect.module, message.redirect.prompt)}
                              className="border-primary/50"
                            >
                              <ArrowRight className="w-3 h-3 mr-1" />
                              {message.redirect.label}
                            </Button>
                          )}
                        </div>
                      )}
                      {message.role === "user" && message.id && editingMessageId !== message.id && (
                        <div className="flex gap-2 mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingMessageId(message.id!);
                              setEditingMessageContent(message.content);
                            }}
                            title="Edit message"
                          >
                            <Edit2 className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              {isThinking && (
                <div className="flex gap-3 justify-start">
                  <img 
                    src={krisLogo} 
                    alt="KRIS" 
                    className="w-8 h-8 rounded-full border border-primary flex-shrink-0 animate-pulse"
                  />
                  <div className="rounded-lg px-4 py-2 bg-muted/50">
                    <p className="text-sm text-muted-foreground">Thinking...</p>
                  </div>
                </div>
                )}
              </div>
            )}
          </div>

          {/* Scroll to Bottom Button */}
          {showScrollButton && (
            <Button
              className="absolute bottom-4 right-8 rounded-full w-10 h-10 shadow-lg z-10 animate-fade-in"
              size="icon"
              variant="default"
              onClick={() => {
                scrollViewportRef.current?.scrollTo({
                  top: scrollViewportRef.current.scrollHeight,
                  behavior: 'smooth'
                });
              }}
              title="Scroll to bottom"
            >
              <ArrowDown className="w-4 h-4" />
            </Button>
          )}
        </div>

        <div className="space-y-2 pt-4 border-t border-primary/20">
          {uploadedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 px-2">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-lg text-sm border border-primary/20"
                >
                  <Paperclip className="w-3 h-3" />
                  <span className="max-w-[150px] truncate">{file.name}</span>
                  <button
                    onClick={() => removeFile(index)}
                    className="hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              accept="*/*"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              title="Upload File"
            >
              <Paperclip className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleVoiceInput}
              className={`${isRecording ? "bg-red-500/20 border-red-500" : ""}`}
              title="Voice Input"
            >
              <Mic className={`w-4 h-4 ${isRecording ? "text-red-500" : ""}`} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setShowVoiceMode(true);
                onOpenChange(false);
              }}
              title="Voice Mode (Multilingual)"
              className="bg-primary/10"
            >
              <Radio className="w-4 h-4" />
            </Button>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Share an idea, ask me to create an image, or upload a file..."
              className="min-h-[60px] bg-background/50 border-primary/20"
            />
            <Button onClick={handleSend} className="self-end" disabled={isThinking}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="text-xs text-muted-foreground text-center pt-2">
          💡 Try: "Create an image of a futuristic city", "Invent a new energy storage method", "Parle-moi en français" 🌍
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
};
