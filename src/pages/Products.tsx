import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Brain, CircuitBoard, Box, Cpu, BookOpen, FolderKanban } from "lucide-react";

const Products = () => {
  const navigate = useNavigate();

  const products = [
    {
      icon: <Brain className="w-10 h-10" />,
      title: "AI Scientist Team",
      description: "Multi-disciplinary AI experts providing guidance in physics, chemistry, engineering, and software development.",
      features: ["Expert consultation", "Technical analysis", "Design validation", "Code review"],
    },
    {
      icon: <CircuitBoard className="w-10 h-10" />,
      title: "Circuit Canvas",
      description: "Interactive circuit design platform for creating, visualizing, and testing electronic circuits.",
      features: ["Component library", "Drag-and-drop design", "Connection validation", "Export schematics"],
    },
    {
      icon: <Box className="w-10 h-10" />,
      title: "3D Lab",
      description: "AI-powered 3D modeling environment for creating enclosures, prototypes, and mechanical designs.",
      features: ["Text-to-3D generation", "Customizable models", "Export for printing", "Design history"],
    },
    {
      icon: <Cpu className="w-10 h-10" />,
      title: "Simulation Engine",
      description: "Virtual testing environment for simulating circuits, physics, and system behavior.",
      features: ["Real-time simulation", "Parameter adjustment", "Performance metrics", "Data visualization"],
    },
    {
      icon: <BookOpen className="w-10 h-10" />,
      title: "Learning Hub",
      description: "Personalized AI-powered educational platform for STEM subjects with structured lessons.",
      features: ["Custom topics", "Interactive lessons", "Progress tracking", "AI tutoring"],
    },
    {
      icon: <FolderKanban className="w-10 h-10" />,
      title: "Project Manager",
      description: "Comprehensive project organization and tracking system integrated with all lab modules.",
      features: ["Phase tracking", "Documentation", "Collaboration", "Progress reports"],
    },
  ];

  return (
    <div className="min-h-screen bg-background circuit-bg">
      <header className="border-b border-primary/30 bg-card/50 backdrop-blur-sm p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/dashboard")} className="hover:bg-primary/20">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-primary neon-glow">Products & Platforms</h1>
          </div>
          <Badge variant="outline" className="border-primary/50">KRIS Laboratory</Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-primary mb-4">Our Platforms</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A complete suite of AI-powered tools for innovation, learning, and project development.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {products.map((product, index) => (
            <Card key={index} className="bg-card/80 backdrop-blur-sm border-primary/30 hover:border-primary/60 transition-all">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="text-primary p-3 bg-primary/10 rounded-lg">{product.icon}</div>
                  <div>
                    <CardTitle className="text-xl">{product.title}</CardTitle>
                    <CardDescription className="mt-2">{product.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {product.features.map((feature, idx) => (
                    <Badge key={idx} variant="secondary" className="bg-primary/10">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Products;
