import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Briefcase, Target, Users, Award, Zap, Globe } from "lucide-react";

const Services = () => {
  const navigate = useNavigate();

  const services = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "AI-Powered Research",
      description: "Leverage cutting-edge AI to accelerate your research and innovation process with intelligent analysis and insights.",
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Project Development",
      description: "End-to-end project development support from concept ideation to prototype creation and testing.",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Expert Consultation",
      description: "Access our AI scientist team for specialized guidance in physics, chemistry, engineering, and software.",
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Virtual Innovation Lab",
      description: "A complete virtual environment for circuit design, 3D modeling, and simulation testing.",
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Learning & Development",
      description: "Structured educational content and personalized learning paths for STEM subjects.",
    },
    {
      icon: <Briefcase className="w-8 h-8" />,
      title: "Enterprise Solutions",
      description: "Custom AI solutions for organizations looking to enhance their R&D capabilities.",
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
            <h1 className="text-2xl font-bold text-primary neon-glow">Our Services</h1>
          </div>
          <Badge variant="outline" className="border-primary/50">KRIS Laboratory</Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-primary mb-4">What We Offer</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Comprehensive AI-powered services designed to accelerate innovation and bring your ideas to life.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <Card key={index} className="bg-card/80 backdrop-blur-sm border-primary/30 hover:border-primary/60 transition-all hover:scale-105">
              <CardHeader>
                <div className="text-primary mb-4">{service.icon}</div>
                <CardTitle className="text-xl">{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{service.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h3 className="text-2xl font-semibold text-primary mb-4">Ready to Get Started?</h3>
          <p className="text-muted-foreground mb-6">Contact us to discuss how KRIS Laboratory can help with your projects.</p>
          <Button onClick={() => navigate("/contact")} size="lg">
            Contact Us
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Services;
