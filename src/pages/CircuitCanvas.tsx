import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Maximize2, Minimize2, Plus, History, Menu } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface CircuitHistoryItem {
  id: string;
  name: string;
  date: string;
  preview: string;
}

const CircuitCanvas = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const projectName = searchParams.get('projectName');
  const [isFullScreen, setIsFullScreen] = useState(true);
  const [isComponentDialogOpen, setIsComponentDialogOpen] = useState(false);
  
  // Circuit history state
  const [circuitHistory, setCircuitHistory] = useState<CircuitHistoryItem[]>([
    {
      id: "1",
      name: "LED Blink Circuit",
      date: "2025-11-20 14:30",
      preview: "555 Timer + LED + Resistor"
    },
    {
      id: "2",
      name: "Voltage Divider",
      date: "2025-11-19 10:15",
      preview: "R1-R2 Configuration"
    },
    {
      id: "3",
      name: "Arduino Power Supply",
      date: "2025-11-18 16:45",
      preview: "7805 Regulator Circuit"
    },
    {
      id: "4",
      name: "Motor Driver Circuit",
      date: "2025-11-17 09:20",
      preview: "L298N H-Bridge Setup"
    },
    {
      id: "5",
      name: "Audio Amplifier",
      date: "2025-11-16 13:00",
      preview: "LM386 Based Circuit"
    }
  ]);

  useEffect(() => {
    if (projectId && projectName) {
      toast.success(`Working on project: ${projectName}`);
    }
  }, [projectId, projectName]);

  const handleLoadCircuit = (circuit: CircuitHistoryItem) => {
    toast.success(`Loading circuit: ${circuit.name}`);
    // In a real implementation, this would load the circuit into the canvas
  };

  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      {!isFullScreen && (
        <header className="border-b border-primary/30 bg-card/50 backdrop-blur-sm p-3">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="hover:bg-primary/20"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <h1 className="text-xl font-bold text-primary">Circuit Canvas</h1>
              {projectName && (
                <Badge variant="default" className="text-xs">
                  {projectName}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-primary/50 text-xs">
                Sketch & Circuit Designer
              </Badge>
            </div>
          </div>
        </header>
      )}
      
      <div className="flex-1 relative">
        <iframe
          src="https://sketch-and-circuit.lovable.app/"
          className="w-full h-full border-0"
          title="Sketch and Circuit Designer"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
        
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          {/* Circuit History Sidebar */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="default"
                size="sm"
                className="bg-primary/90 backdrop-blur-sm hover:bg-primary border border-primary/30"
              >
                <History className="w-4 h-4 mr-2" />
                History
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[400px] sm:w-[540px]">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <History className="w-5 h-5 text-primary" />
                  Circuit History
                </SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-100px)] mt-6">
                <div className="space-y-3 pr-4">
                  {circuitHistory.map((circuit) => (
                    <Card
                      key={circuit.id}
                      className="p-4 bg-card/80 border-primary/20 hover:border-primary/50 cursor-pointer transition-colors"
                      onClick={() => handleLoadCircuit(circuit)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-foreground">{circuit.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          #{circuit.id}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{circuit.preview}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{circuit.date}</span>
                        <Button variant="ghost" size="sm" className="h-7 text-xs">
                          Load
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>

          {/* Create Components Dialog */}
          <Dialog open={isComponentDialogOpen} onOpenChange={setIsComponentDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="default"
                size="sm"
                className="bg-primary/90 backdrop-blur-sm hover:bg-primary border border-primary/30"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Components
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl h-[80vh] p-0">
              <DialogHeader className="p-4 border-b">
                <DialogTitle>Create Components - Pinwise AI</DialogTitle>
              </DialogHeader>
              <iframe
                src="https://pinwise-ai.lovable.app/"
                className="w-full h-full border-0 rounded-b-lg"
                title="Pinwise AI Component Creator"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </DialogContent>
          </Dialog>

          {/* Fullscreen Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="bg-background/80 backdrop-blur-sm hover:bg-background border border-primary/30"
            title={isFullScreen ? "Show Header" : "Hide Header"}
          >
            {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CircuitCanvas;