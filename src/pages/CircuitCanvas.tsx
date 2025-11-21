import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Maximize2, Minimize2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

const CircuitCanvas = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const projectName = searchParams.get('projectName');
  const [isFullScreen, setIsFullScreen] = useState(true);
  const [isComponentDialogOpen, setIsComponentDialogOpen] = useState(false);

  useEffect(() => {
    if (projectId && projectName) {
      toast.success(`Working on project: ${projectName}`);
    }
  }, [projectId, projectName]);

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
