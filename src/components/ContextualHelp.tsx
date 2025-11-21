import { useState } from "react";
import { HelpCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import krisLogo from "@/assets/kris-logo.jpg";

interface ContextualHelpProps {
  selectedElement?: string;
  elementContext?: string;
}

export const ContextualHelp = ({ selectedElement, elementContext }: ContextualHelpProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const askKris = async (customQuestion?: string) => {
    setIsLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to ask KRIS",
          variant: "destructive"
        });
        return;
      }

      const questionToAsk = customQuestion || question || `What is ${selectedElement || "this"}? Please explain it to me.`;
      
      const contextPrompt = elementContext 
        ? `The user is asking about: ${selectedElement}\nContext: ${elementContext}\n\nQuestion: ${questionToAsk}`
        : `Question: ${questionToAsk}`;

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/kris-chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: "You are KRIS, a helpful AI assistant. Provide clear, concise explanations about features and elements in the app. Keep responses under 150 words." },
            { role: "user", content: contextPrompt }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to get response: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6).trim();
            if (jsonStr === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                fullResponse += content;
                setResponse(fullResponse); // Update progressively
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      if (!fullResponse) {
        setResponse("I'm here to help! What would you like to know?");
      }
    } catch (error: any) {
      console.error('Error asking KRIS:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to get response from KRIS",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    if (selectedElement && !response) {
      askKris();
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="fixed bottom-20 right-4 z-50 rounded-full shadow-lg hover:shadow-xl transition-all"
          onClick={handleOpen}
        >
          <HelpCircle className="w-4 h-4 mr-2" />
          Ask KRIS
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-80 p-0" 
        side="left" 
        align="end"
      >
        <Card className="border-0">
          <div className="p-4 border-b bg-primary/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img 
                src={krisLogo} 
                alt="KRIS" 
                className="w-8 h-8 rounded-full object-cover"
              />
              <div>
                <h3 className="font-semibold text-sm">Ask KRIS</h3>
                <p className="text-xs text-muted-foreground">Quick help assistant</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="h-64 p-4">
            {selectedElement && (
              <div className="mb-3 p-2 bg-muted rounded-md">
                <p className="text-xs font-medium mb-1">Selected:</p>
                <p className="text-xs text-muted-foreground">{selectedElement}</p>
              </div>
            )}

            {response ? (
              <div className="prose prose-sm max-w-none">
                <p className="text-sm whitespace-pre-wrap">{response}</p>
              </div>
            ) : isLoading ? (
              <div className="flex flex-col items-center justify-center h-32 gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                <p className="text-sm text-muted-foreground">KRIS is thinking...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 gap-2 text-center">
                <HelpCircle className="w-12 h-12 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">Ask KRIS anything about this app!</p>
              </div>
            )}
          </ScrollArea>

          <div className="p-3 border-t space-y-2">
            <Textarea
              placeholder="Ask a follow-up question..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="min-h-[60px] resize-none text-sm"
              disabled={isLoading}
            />
            <Button 
              onClick={() => askKris(question)} 
              disabled={isLoading || !question.trim()}
              className="w-full"
              size="sm"
            >
              {isLoading ? "Asking..." : "Ask"}
            </Button>
          </div>
        </Card>
      </PopoverContent>
    </Popover>
  );
};
