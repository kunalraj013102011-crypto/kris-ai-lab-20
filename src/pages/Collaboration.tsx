import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Building2, GraduationCap, Globe } from "lucide-react";

const Collaboration = () => {
  const navigate = useNavigate();

  const partnerTypes = [
    {
      icon: <Building2 className="w-10 h-10" />,
      title: "Industry Partners",
      description: "Collaborate with us on cutting-edge R&D projects and access our AI-powered innovation tools.",
      benefits: ["Joint research projects", "Technology licensing", "Custom solutions", "Co-development"],
    },
    {
      icon: <GraduationCap className="w-10 h-10" />,
      title: "Academic Institutions",
      description: "Partner with universities and research institutions for knowledge exchange and student programs.",
      benefits: ["Research collaboration", "Student internships", "Joint publications", "Lab access"],
    },
    {
      icon: <Users className="w-10 h-10" />,
      title: "Startups & Innovators",
      description: "Support emerging entrepreneurs with mentorship, resources, and our innovation platform.",
      benefits: ["Mentorship programs", "Resource access", "Networking events", "Pitch support"],
    },
    {
      icon: <Globe className="w-10 h-10" />,
      title: "Global Networks",
      description: "Join our international network of innovators, researchers, and technology enthusiasts.",
      benefits: ["Global community", "Knowledge sharing", "Cross-border projects", "Events access"],
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
            <h1 className="text-2xl font-bold text-primary neon-glow">Collaboration</h1>
          </div>
          <Badge variant="outline" className="border-primary/50">KRIS Laboratory</Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-primary mb-4">Partner With Us</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Join our ecosystem of innovators and researchers. Together, we can push the boundaries of what's possible.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {partnerTypes.map((partner, index) => (
            <Card key={index} className="bg-card/80 backdrop-blur-sm border-primary/30 hover:border-primary/60 transition-all">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="text-primary p-3 bg-primary/10 rounded-lg">{partner.icon}</div>
                  <div>
                    <CardTitle className="text-xl">{partner.title}</CardTitle>
                    <CardDescription className="mt-2">{partner.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <h4 className="text-sm font-semibold mb-3">Benefits:</h4>
                <div className="flex flex-wrap gap-2">
                  {partner.benefits.map((benefit, idx) => (
                    <Badge key={idx} variant="secondary" className="bg-primary/10">
                      {benefit}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 bg-card/60 backdrop-blur-sm rounded-xl p-8 border border-primary/30 text-center">
          <h3 className="text-2xl font-semibold text-primary mb-4">Ready to Collaborate?</h3>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Whether you're an industry leader, academic researcher, or passionate innovator, we'd love to hear from you.
          </p>
          <Button onClick={() => navigate("/contact")} size="lg">
            Get in Touch
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Collaboration;
