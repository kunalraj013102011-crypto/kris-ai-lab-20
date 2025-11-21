import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Play, Upload, FileText, AlertCircle, CheckCircle2, Activity, X, Beaker } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SimulationResult {
  status: "success" | "warning" | "error";
  functionality: number;
  issues: string[];
  recommendations: string[];
}

const Simulation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const projectName = searchParams.get('projectName');
  
  const [projectDetails, setProjectDetails] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [experimentDescription, setExperimentDescription] = useState("");
  const [isRunningExperiment, setIsRunningExperiment] = useState(false);
  const [experimentResult, setExperimentResult] = useState<string>("");

  useEffect(() => {
    if (projectId && projectName) {
      toast({
        title: "Project Context",
        description: `Simulating: ${projectName}`,
      });
    }
  }, [projectId, projectName]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
      toast({
        title: "Files Added",
        description: `${newFiles.length} file(s) uploaded successfully`,
      });
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleRunSimulation = async () => {
    if (!projectDetails.trim()) {
      toast({
        title: "Input Required",
        description: "Please provide project details before running simulation",
        variant: "destructive",
      });
      return;
    }

    setIsSimulating(true);
    setSimulationProgress(0);
    setResult(null);

    // Simulate progress
    const interval = setInterval(() => {
      setSimulationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 300);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Login required", description: "Please log in to run simulation.", variant: "destructive" });
        clearInterval(interval);
        setIsSimulating(false);
        return;
      }
      
      const { data, error } = await supabase.functions.invoke('simulate-project', {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: { 
          projectDetails,
          projectId,
          projectContext: projectName ? `Project: ${projectName}` : undefined
        }
      });

      clearInterval(interval);
      setSimulationProgress(100);

      if (error) throw error;

      setIsSimulating(false);
      setResult(data);
      toast({
        title: "Simulation Complete",
        description: "AI-powered analysis results are ready",
      });
    } catch (error: any) {
      clearInterval(interval);
      setIsSimulating(false);
      console.error('Simulation error:', error);
      toast({
        title: "Simulation Failed",
        description: error.message || "Failed to run simulation",
        variant: "destructive",
      });
    }
  };

  const handleRunExperiment = async () => {
    if (!experimentDescription.trim()) {
      toast({
        title: "Input Required",
        description: "Please provide experiment description",
        variant: "destructive",
      });
      return;
    }

    setIsRunningExperiment(true);
    setExperimentResult("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Login required", description: "Please log in to run experiment.", variant: "destructive" });
        setIsRunningExperiment(false);
        return;
      }
      
      const { data, error } = await supabase.functions.invoke('experiment-ai', {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: { 
          experimentDescription,
          projectId,
        }
      });

      if (error) throw error;

      setIsRunningExperiment(false);
      setExperimentResult(data.content);
      toast({
        title: "Experiment Complete",
        description: "Truth-first analysis ready",
      });
    } catch (error: any) {
      setIsRunningExperiment(false);
      console.error('Experiment error:', error);
      toast({
        title: "Experiment Failed",
        description: error.message || "Failed to run experiment",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background circuit-bg">
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
            <h1 className="text-2xl font-bold text-primary neon-glow">Simulation Engine</h1>
            {projectName && (
              <Badge variant="default" className="ml-2">
                {projectName}
              </Badge>
            )}
          </div>
          <Badge variant="outline" className="border-primary/50">
            Realistic Testing AI
          </Badge>
        </div>
      </header>
      
      <main className="container mx-auto p-6">
        <Tabs defaultValue="simulation" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6">
            <TabsTrigger value="simulation">Circuit Simulation</TabsTrigger>
            <TabsTrigger value="experiment">
              <Beaker className="w-4 h-4 mr-2" />
              Experiment AI
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="simulation">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card className="bg-card/80 backdrop-blur-sm border-primary/30 p-6">
            <h2 className="text-xl font-semibold text-primary mb-4">Project Input</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Project Details & Specifications
                </label>
                <Textarea
                  value={projectDetails}
                  onChange={(e) => setProjectDetails(e.target.value)}
                  placeholder="Describe your project in detail: circuit design, components, specifications, expected behavior, power requirements, etc."
                  className="min-h-[200px] bg-background/50 border-primary/20"
                />
              </div>

              <div className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,.pdf,.txt,.doc,.docx"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Circuit Diagram
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Attach Specifications
                </Button>

                {uploadedFiles.length > 0 && (
                  <div className="space-y-2 mt-3">
                    <p className="text-sm text-muted-foreground font-medium">Uploaded Files:</p>
                    <div className="space-y-1">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-muted/50 p-2 rounded-lg border border-primary/20">
                          <span className="text-sm truncate flex-1">{file.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="h-7 w-7 p-0"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Button
                onClick={handleRunSimulation}
                disabled={isSimulating}
                className="w-full bg-primary hover:bg-primary/90 h-12 text-lg"
              >
                <Play className="w-5 h-5 mr-2" />
                {isSimulating ? "Simulating..." : "Run Simulation"}
              </Button>
            </div>

            {isSimulating && (
              <div className="mt-6 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Simulation Progress</span>
                  <span className="text-primary font-semibold">{simulationProgress}%</span>
                </div>
                <Progress value={simulationProgress} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Analyzing circuit behavior and performance...
                </p>
              </div>
            )}
          </Card>

          {/* Results Section */}
          <Card className="bg-card/80 backdrop-blur-sm border-primary/30 p-6">
            <h2 className="text-xl font-semibold text-primary mb-4">Simulation Results</h2>
            
            {!result && !isSimulating && (
              <div className="text-center py-12">
                <Activity className="w-16 h-16 text-primary/30 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Results will appear here after simulation
                </p>
              </div>
            )}

            {result && (
              <div className="space-y-6">
                {/* Status Overview */}
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                    <div>
                      <div className="font-semibold text-foreground">Simulation Complete</div>
                      <div className="text-sm text-muted-foreground">Realistic analysis generated</div>
                    </div>
                  </div>
                  <Badge variant="default" className="text-lg px-4 py-2">
                    {result.functionality}% Functional
                  </Badge>
                </div>

                {/* Issues Found */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-5 h-5 text-destructive" />
                    <h3 className="font-semibold text-foreground">Issues Detected</h3>
                  </div>
                  <div className="space-y-2">
                    {result.issues.map((issue, index) => (
                      <div
                        key={index}
                        className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm"
                      >
                        {issue}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Recommendations</h3>
                  </div>
                  <div className="space-y-2">
                    {result.recommendations.map((rec, index) => (
                      <div
                        key={index}
                        className="p-3 bg-primary/10 border border-primary/30 rounded-lg text-sm"
                      >
                        • {rec}
                      </div>
                    ))}
                  </div>
                </div>

                <Button variant="outline" className="w-full">
                  <FileText className="w-4 h-4 mr-2" />
                  Export Detailed Report
                </Button>
              </div>
            )}
          </Card>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card className="bg-muted/30 border-primary/20 p-4">
            <h4 className="font-semibold text-primary mb-2">Realistic Testing</h4>
            <p className="text-sm text-muted-foreground">
              Yields real-world results rather than theoretical outcomes
            </p>
          </Card>
          <Card className="bg-muted/30 border-primary/20 p-4">
            <h4 className="font-semibold text-primary mb-2">Failure Analysis</h4>
            <p className="text-sm text-muted-foreground">
              Identifies potential issues before physical implementation
            </p>
          </Card>
          <Card className="bg-muted/30 border-primary/20 p-4">
            <h4 className="font-semibold text-primary mb-2">Performance Metrics</h4>
            <p className="text-sm text-muted-foreground">
              Comprehensive evaluation of project functionality
            </p>
          </Card>
            </div>
          </TabsContent>

          <TabsContent value="experiment">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Experiment Input Section */}
              <Card className="bg-card/80 backdrop-blur-sm border-primary/30 p-6">
                <h2 className="text-xl font-semibold text-primary mb-4">Experiment Description</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                      Describe Your Experiment
                    </label>
                    <Textarea
                      value={experimentDescription}
                      onChange={(e) => setExperimentDescription(e.target.value)}
                      placeholder="Describe what you want to test or experiment with. The AI will provide a truth-first, scientific analysis based on validated principles..."
                      className="min-h-[300px] bg-background/50 border-primary/20"
                    />
                  </div>

                  <Button
                    onClick={handleRunExperiment}
                    disabled={isRunningExperiment}
                    className="w-full bg-primary hover:bg-primary/90 h-12 text-lg"
                  >
                    <Beaker className="w-5 h-5 mr-2" />
                    {isRunningExperiment ? "Analyzing..." : "Run Experiment"}
                  </Button>
                </div>

                <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-primary/20">
                  <h4 className="font-semibold text-sm mb-2">⚠️ Safety & Truth First</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• This AI prioritizes TRUTH over convenience</li>
                    <li>• Only provides high-level, safe experiment plans</li>
                    <li>• Virtual simulations only - no hazardous procedures</li>
                    <li>• Explicitly states uncertainties and assumptions</li>
                  </ul>
                </div>
              </Card>

              {/* Experiment Results Section */}
              <Card className="bg-card/80 backdrop-blur-sm border-primary/30 p-6">
                <h2 className="text-xl font-semibold text-primary mb-4">Experiment Analysis</h2>
                
                {!experimentResult && !isRunningExperiment && (
                  <div className="text-center py-12">
                    <Beaker className="w-16 h-16 text-primary/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Truth-first analysis will appear here
                    </p>
                  </div>
                )}

                {isRunningExperiment && (
                  <div className="text-center py-12">
                    <Activity className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
                    <p className="text-muted-foreground">
                      Analyzing based on scientific principles...
                    </p>
                  </div>
                )}

                {experimentResult && (
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/30 rounded-lg border border-primary/20 whitespace-pre-wrap text-sm">
                      {experimentResult}
                    </div>

                    <Button variant="outline" className="w-full">
                      <FileText className="w-4 h-4 mr-2" />
                      Export Analysis Report
                    </Button>
                  </div>
                )}
              </Card>
            </div>

            {/* Experiment AI Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <Card className="bg-muted/30 border-primary/20 p-4">
                <h4 className="font-semibold text-primary mb-2">Truth-First AI</h4>
                <p className="text-sm text-muted-foreground">
                  No hallucinations - only verified scientific principles
                </p>
              </Card>
              <Card className="bg-muted/30 border-primary/20 p-4">
                <h4 className="font-semibold text-primary mb-2">Safety Focused</h4>
                <p className="text-sm text-muted-foreground">
                  High-level plans only, no hazardous step-by-step procedures
                </p>
              </Card>
              <Card className="bg-muted/30 border-primary/20 p-4">
                <h4 className="font-semibold text-primary mb-2">Transparent Uncertainty</h4>
                <p className="text-sm text-muted-foreground">
                  Clear confidence levels and stated assumptions
                </p>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Simulation;
