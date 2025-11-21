import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2, VolumeX, X, Settings } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import krisLogo from "@/assets/kris-logo.jpg";
import { useNavigate } from "react-router-dom";

interface VoiceModeProps {
  onClose: () => void;
  conversationId?: string;
  userId?: string;
}

// Navigation command detection
const detectNavigationCommand = (text: string): { module: string; message: string } | null => {
  const lowerText = text.toLowerCase();
  
  const navigationPatterns = [
    {
      keywords: ['take me to circuit', 'open circuit', 'go to circuit', 'circuit design', 'circuit canvas', 'show circuit'],
      module: 'circuit',
      message: 'Taking you to Circuit Canvas for circuit design.'
    },
    {
      keywords: ['take me to scientist', 'open scientist', 'go to scientist', 'ai scientist', 'show scientist', 'component selection', 'select components', 'choose components'],
      module: 'scientist',
      message: 'Taking you to the AI Scientist for component selection and expert consultation.'
    },
    {
      keywords: ['take me to 3d', 'open 3d', 'go to 3d', '3d lab', '3d model', 'show 3d', 'modeling', 'enclosure'],
      module: '3d-lab',
      message: 'Taking you to the 3D Lab for modeling and design.'
    },
    {
      keywords: ['take me to simulation', 'open simulation', 'go to simulation', 'simulate', 'show simulation', 'run experiment'],
      module: 'simulation',
      message: 'Taking you to Simulation to test and analyze your project.'
    },
    {
      keywords: ['take me to learning', 'open learning', 'go to learning', 'learning hub', 'show learning', 'teach me', 'lessons'],
      module: 'learning',
      message: 'Taking you to the Learning Hub for educational content.'
    },
    {
      keywords: ['take me to projects', 'open projects', 'go to projects', 'project manager', 'show projects', 'my projects'],
      module: 'projects',
      message: 'Taking you to Project Manager to organize your work.'
    },
    {
      keywords: ['take me to dashboard', 'open dashboard', 'go to dashboard', 'show dashboard', 'home'],
      module: 'dashboard',
      message: 'Taking you back to the Dashboard.'
    }
  ];
  
  for (const pattern of navigationPatterns) {
    if (pattern.keywords.some(keyword => lowerText.includes(keyword))) {
      return { module: pattern.module, message: pattern.message };
    }
  }
  
  return null;
};

export const VoiceMode = ({ onClose, conversationId, userId }: VoiceModeProps) => {
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [autoSend, setAutoSend] = useState(true);
  const [continuousMode, setContinuousMode] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const conversationHistoryRef = useRef<Array<{ role: string; content: string }>>([]);

  // Navigation function
  const navigateToModule = (module: string) => {
    const routes: Record<string, string> = {
      'circuit': '/circuit-canvas',
      'scientist': '/ai-scientist',
      '3d-lab': '/3d-lab',
      'simulation': '/simulation',
      'learning': '/learning-hub',
      'projects': '/project-manager',
      'dashboard': '/dashboard'
    };
    
    const route = routes[module];
    if (route) {
      // Close voice mode and navigate
      onClose();
      navigate(route);
    }
  };

  useEffect(() => {
    // Initialize speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in your browser",
        variant: "destructive"
      });
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    
    // Detect browser language
    const browserLang = navigator.language || 'en-US';
    recognitionRef.current.lang = browserLang;
    console.log('Speech recognition language:', browserLang);

    recognitionRef.current.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPiece = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPiece + ' ';
        } else {
          interimTranscript += transcriptPiece;
        }
      }

      setTranscript(finalTranscript || interimTranscript);

      // Auto-send after silence
      if (autoSend && finalTranscript) {
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }
        
        silenceTimerRef.current = setTimeout(() => {
          if (finalTranscript.trim()) {
            handleVoiceInput(finalTranscript.trim());
            setTranscript('');
          }
        }, 1500); // Send after 1.5 seconds of silence
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error !== 'no-speech') {
        toast({
          title: "Error",
          description: `Speech recognition error: ${event.error}`,
          variant: "destructive"
        });
      }
    };

    recognitionRef.current.onend = () => {
      if (continuousMode && isListening && !isProcessing && !isSpeaking) {
        // Automatically restart listening in continuous mode
        try {
          recognitionRef.current?.start();
        } catch (e) {
          console.log('Recognition already started');
        }
      } else {
        setIsListening(false);
      }
    };

    // Start listening immediately
    if (continuousMode) {
      startListening();
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  // Handle continuous mode changes
  useEffect(() => {
    if (continuousMode && !isListening && !isProcessing && !isSpeaking) {
      startListening();
    }
  }, [isSpeaking, isProcessing]);

  const startListening = () => {
    try {
      if (recognitionRef.current && !isListening) {
        recognitionRef.current.start();
        setIsListening(true);
        setTranscript('');
      }
    } catch (e) {
      console.log('Recognition already started or error:', e);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    }
  };

  const handleVoiceInput = async (text: string) => {
    if (!text.trim() || isProcessing) return;

    setIsProcessing(true);
    stopListening();

    try {
      // Check for navigation commands first
      const navigationResult = detectNavigationCommand(text);
      
      if (navigationResult) {
        // Handle navigation command
        const { module, message } = navigationResult;
        
        // Speak the navigation message and wait for it to finish
        await speakText(message);
        
        // Navigate to the module
        navigateToModule(module);
        return;
      }

      // Add user message to history
      conversationHistoryRef.current.push({ role: 'user', content: text });

      const { data: { session } } = await supabase.auth.getSession();
      const { data: { user } } = await supabase.auth.getUser();

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(
        `${supabaseUrl}/functions/v1/kris-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token || ''}`,
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Accept': 'text/event-stream'
          },
          body: JSON.stringify({
            messages: conversationHistoryRef.current,
            userId: user?.id || '',
            useOpenRouter: false
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      if (!reader) throw new Error('No response body');

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
                fullResponse += content;
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      // Add assistant response to history
      conversationHistoryRef.current.push({ role: 'assistant', content: fullResponse });

      setResponse(fullResponse);
      
      // Save to database if conversation ID is available
      if (conversationId && userId) {
        try {
          await (supabase as any).from('chat_history').insert([
            {
              conversation_id: conversationId,
              user_id: userId,
              role: 'user',
              content: text
            },
            {
              conversation_id: conversationId,
              user_id: userId,
              role: 'assistant',
              content: fullResponse
            }
          ]);
        } catch (error) {
          console.error('Error saving voice chat to history:', error);
        }
      }
      
      setIsProcessing(false);
      
      // Speak the response
      await speakText(fullResponse);
      
    } catch (error: any) {
      console.error('Error:', error);
      setIsProcessing(false);
      toast({
        title: "Error",
        description: error.message || "Failed to process voice input",
        variant: "destructive"
      });
      
      // Resume listening after error
      if (continuousMode) {
        setTimeout(() => startListening(), 1000);
      }
    }
  };

  const speakText = (text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (!text.trim()) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      synthRef.current = utterance;
      
      // Auto-detect language from text or use browser language
      const browserLang = navigator.language || 'en-US';
      utterance.lang = browserLang;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Get available voices and select best match
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => voice.lang.startsWith(browserLang.split('-')[0]));
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        synthRef.current = null;
        resolve();
        
        // Auto-resume listening in continuous mode
        if (continuousMode) {
          setTimeout(() => {
            startListening();
          }, 500);
        }
      };

      utterance.onerror = (error) => {
        console.error('Speech synthesis error:', error);
        setIsSpeaking(false);
        synthRef.current = null;
        resolve();
      };

      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    });
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    synthRef.current = null;
    
    // Resume listening after stopping speech
    if (continuousMode) {
      setTimeout(() => startListening(), 500);
    }
  };

  const handleManualSend = () => {
    if (transcript.trim()) {
      handleVoiceInput(transcript.trim());
      setTranscript('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-6 space-y-6 relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <img 
              src={krisLogo} 
              alt="KRIS" 
              className="w-20 h-20 rounded-full border-2 border-primary shadow-lg"
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Voice Mode</h2>
            <p className="text-sm text-muted-foreground">
              Have a natural conversation with KRIS using your voice
            </p>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex justify-center items-center gap-8">
          <div className={`flex flex-col items-center gap-2 ${isListening ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isListening ? 'bg-primary/20 animate-pulse' : 'bg-muted'}`}>
              <Mic className="w-8 h-8" />
            </div>
            <span className="text-sm font-medium">Listening</span>
          </div>

          <div className={`flex flex-col items-center gap-2 ${isSpeaking ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isSpeaking ? 'bg-primary/20 animate-pulse' : 'bg-muted'}`}>
              <Volume2 className="w-8 h-8" />
            </div>
            <span className="text-sm font-medium">Speaking</span>
          </div>

          <div className={`flex flex-col items-center gap-2 ${isProcessing ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isProcessing ? 'bg-primary/20 animate-spin' : 'bg-muted'}`}>
              <div className="w-8 h-8 border-4 border-current border-t-transparent rounded-full" />
            </div>
            <span className="text-sm font-medium">Processing</span>
          </div>
        </div>

        {/* Transcript Display */}
        {transcript && (
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-1">You said:</p>
            <p className="text-sm">{transcript}</p>
          </div>
        )}

        {/* Response Display */}
        {response && (
          <div className="p-4 bg-primary/10 rounded-lg">
            <p className="text-sm font-medium mb-1">KRIS:</p>
            <p className="text-sm">{response}</p>
          </div>
        )}

        {/* Settings */}
        <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="w-full justify-between"
          >
            <span className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Voice Settings & Commands
            </span>
          </Button>

          {showSettings && (
            <div className="space-y-4 pt-2">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-send" className="text-sm">Auto-send after speaking</Label>
                  <Switch
                    id="auto-send"
                    checked={autoSend}
                    onCheckedChange={setAutoSend}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="continuous" className="text-sm">Continuous conversation</Label>
                  <Switch
                    id="continuous"
                    checked={continuousMode}
                    onCheckedChange={setContinuousMode}
                  />
                </div>
              </div>

              {/* Voice Commands Help */}
              <div className="pt-3 border-t border-border space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">Voice Navigation Commands:</p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• "Take me to circuit design"</p>
                  <p>• "Open AI Scientist"</p>
                  <p>• "Show me 3D Lab"</p>
                  <p>• "Go to simulation"</p>
                  <p>• "Open learning hub"</p>
                  <p>• "Show my projects"</p>
                  <p>• "Take me to dashboard"</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-3 justify-center">
          {!autoSend && (
            <Button
              onClick={handleManualSend}
              disabled={!transcript.trim() || isProcessing}
              variant="default"
            >
              Send Message
            </Button>
          )}

          {isListening ? (
            <Button
              onClick={stopListening}
              variant="destructive"
              size="lg"
            >
              <MicOff className="w-5 h-5 mr-2" />
              Stop Listening
            </Button>
          ) : (
            <Button
              onClick={startListening}
              disabled={isProcessing || isSpeaking}
              variant="default"
              size="lg"
            >
              <Mic className="w-5 h-5 mr-2" />
              Start Talking
            </Button>
          )}

          {isSpeaking && (
            <Button
              onClick={stopSpeaking}
              variant="outline"
              size="lg"
            >
              <VolumeX className="w-5 h-5 mr-2" />
              Stop Speaking
            </Button>
          )}
        </div>

        {/* Tips */}
        <div className="text-center text-xs text-muted-foreground space-y-1">
          <p>💡 Tip: Speak naturally in any language - KRIS will respond in the same language</p>
          {continuousMode && <p>🔄 Continuous mode is on - the conversation will flow naturally</p>}
          {autoSend && <p>⚡ Auto-send is on - just speak and pause, no need to click send</p>}
        </div>
      </Card>
    </div>
  );
};