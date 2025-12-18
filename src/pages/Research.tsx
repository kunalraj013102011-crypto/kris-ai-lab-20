import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Atom, Zap, Cpu, FlaskConical, Leaf, Shield } from "lucide-react";

const Research = () => {
  const navigate = useNavigate();

  const domains = [
    {
      icon: <Atom className="w-8 h-8" />,
      title: "Physics & Electronics",
      description: "Mechanics, electromagnetism, quantum systems, and advanced electronic circuit design.",
      topics: ["Quantum Computing", "Semiconductor Physics", "Electromagnetic Systems", "Optoelectronics"],
    },
    {
      icon: <FlaskConical className="w-8 h-8" />,
      title: "Chemistry & Materials",
      description: "Material science, chemical reactions, sustainable compounds, and nanotechnology.",
      topics: ["Nanomaterials", "Green Chemistry", "Polymer Science", "Electrochemistry"],
    },
    {
      icon: <Cpu className="w-8 h-8" />,
      title: "Computer Science & AI",
      description: "Machine learning, embedded systems, IoT, and intelligent automation.",
      topics: ["Deep Learning", "Edge Computing", "Natural Language Processing", "Computer Vision"],
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Energy Systems",
      description: "Renewable energy, power electronics, and sustainable energy solutions.",
      topics: ["Solar Technology", "Battery Systems", "Smart Grids", "Energy Harvesting"],
    },
    {
      icon: <Leaf className="w-8 h-8" />,
      title: "Biotechnology",
      description: "Biomedical engineering, bioinformatics, and sustainable bio-solutions.",
      topics: ["Genetic Engineering", "Biosensors", "Drug Delivery", "Tissue Engineering"],
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Defense Research",
      description: "Advanced defense systems, security technologies, and strategic applications.",
      topics: ["Surveillance Systems", "Secure Communications", "Autonomous Systems", "Protective Materials"],
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
            <h1 className="text-2xl font-bold text-primary neon-glow">Research Domains</h1>
          </div>
          <Badge variant="outline" className="border-primary/50">KRIS Laboratory</Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-primary mb-4">Areas of Research</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Exploring the frontiers of science and technology through AI-powered research and innovation.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {domains.map((domain, index) => (
            <Card key={index} className="bg-card/80 backdrop-blur-sm border-primary/30 hover:border-primary/60 transition-all">
              <CardHeader>
                <div className="text-primary mb-4 p-3 bg-primary/10 rounded-lg w-fit">{domain.icon}</div>
                <CardTitle className="text-xl">{domain.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm">{domain.description}</p>
                <div className="flex flex-wrap gap-1">
                  {domain.topics.map((topic, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs border-primary/30">
                      {topic}
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

export default Research;
