import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Lightbulb, Rocket, Award, TrendingUp } from "lucide-react";

const Innovation = () => {
  const navigate = useNavigate();

  const caseStudies = [
    {
      title: "Smart Agriculture Monitoring",
      category: "IoT & Sensors",
      description: "AI-powered crop monitoring system using sensor networks and machine learning for optimal irrigation and pest detection.",
      impact: "40% water savings, 25% yield increase",
    },
    {
      title: "Autonomous Security Drone",
      category: "Robotics & AI",
      description: "Self-navigating surveillance drone with real-time threat detection and automated patrol capabilities.",
      impact: "24/7 automated monitoring",
    },
    {
      title: "Solar Energy Optimizer",
      category: "Renewable Energy",
      description: "MPPT controller with AI-based weather prediction for maximizing solar panel efficiency.",
      impact: "15% efficiency improvement",
    },
    {
      title: "Biomedical Wearable",
      category: "Healthcare Tech",
      description: "Continuous health monitoring device with early disease detection algorithms.",
      impact: "Early warning for 3 conditions",
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
            <h1 className="text-2xl font-bold text-primary neon-glow">Innovation Hub</h1>
          </div>
          <Badge variant="outline" className="border-primary/50">KRIS Laboratory</Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-primary mb-4">Innovation & Case Studies</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Real-world applications and success stories from our innovation laboratory.
          </p>
        </div>

        {/* Innovation Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { icon: <Lightbulb />, label: "Ideas Generated", value: "500+" },
            { icon: <Rocket />, label: "Projects Launched", value: "150+" },
            { icon: <Award />, label: "Patents Filed", value: "25" },
            { icon: <TrendingUp />, label: "Success Rate", value: "87%" },
          ].map((stat, index) => (
            <Card key={index} className="bg-card/80 backdrop-blur-sm border-primary/30 text-center">
              <CardContent className="pt-6">
                <div className="text-primary mb-2 flex justify-center">{stat.icon}</div>
                <div className="text-2xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Case Studies */}
        <h3 className="text-2xl font-semibold text-primary mb-6">Featured Case Studies</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {caseStudies.map((study, index) => (
            <Card key={index} className="bg-card/80 backdrop-blur-sm border-primary/30 hover:border-primary/60 transition-all">
              <CardHeader>
                <Badge variant="secondary" className="w-fit mb-2">{study.category}</Badge>
                <CardTitle className="text-xl">{study.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{study.description}</p>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-500 font-medium">{study.impact}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button onClick={() => navigate("/contact")} size="lg">
            Share Your Innovation Idea
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Innovation;
