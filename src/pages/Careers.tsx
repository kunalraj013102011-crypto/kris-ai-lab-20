import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Clock, Briefcase } from "lucide-react";

const Careers = () => {
  const navigate = useNavigate();

  const openings = [
    {
      title: "AI Research Scientist",
      department: "Research & Development",
      location: "Remote / Hybrid",
      type: "Full-time",
      description: "Lead AI research initiatives and develop cutting-edge machine learning solutions.",
    },
    {
      title: "Full Stack Developer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      description: "Build and maintain our web platforms using React, TypeScript, and modern technologies.",
    },
    {
      title: "Hardware Engineer",
      department: "Product Development",
      location: "On-site",
      type: "Full-time",
      description: "Design and prototype electronic systems and embedded solutions.",
    },
    {
      title: "Technical Writer",
      department: "Documentation",
      location: "Remote",
      type: "Part-time",
      description: "Create clear, comprehensive documentation for our products and research.",
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
            <h1 className="text-2xl font-bold text-primary neon-glow">Careers</h1>
          </div>
          <Badge variant="outline" className="border-primary/50">KRIS Laboratory</Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-primary mb-4">Join Our Team</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Be part of an innovative team pushing the boundaries of AI and technology.
          </p>
        </div>

        {/* Why Join Us */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            { title: "Innovation First", description: "Work on cutting-edge projects that make a real impact." },
            { title: "Remote Friendly", description: "Flexible work arrangements to suit your lifestyle." },
            { title: "Growth Focused", description: "Continuous learning opportunities and career development." },
          ].map((item, index) => (
            <Card key={index} className="bg-card/80 backdrop-blur-sm border-primary/30 text-center">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-primary mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Open Positions */}
        <h3 className="text-2xl font-semibold text-primary mb-6">Open Positions</h3>
        <div className="space-y-4">
          {openings.map((job, index) => (
            <Card key={index} className="bg-card/80 backdrop-blur-sm border-primary/30 hover:border-primary/60 transition-all">
              <CardContent className="flex flex-col md:flex-row md:items-center justify-between py-6 gap-4">
                <div>
                  <h4 className="text-lg font-semibold">{job.title}</h4>
                  <p className="text-muted-foreground text-sm mb-2">{job.description}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">
                      <Briefcase className="w-3 h-3 mr-1" />
                      {job.department}
                    </Badge>
                    <Badge variant="outline">
                      <MapPin className="w-3 h-3 mr-1" />
                      {job.location}
                    </Badge>
                    <Badge variant="outline">
                      <Clock className="w-3 h-3 mr-1" />
                      {job.type}
                    </Badge>
                  </div>
                </div>
                <Button onClick={() => navigate("/contact")}>Apply Now</Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center text-muted-foreground">
          <p>Don't see a position that fits? <Button variant="link" onClick={() => navigate("/contact")} className="p-0">Send us your resume</Button> anyway!</p>
        </div>
      </main>
    </div>
  );
};

export default Careers;
