import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Linkedin, Github } from "lucide-react";
import krisLogo from "@/assets/kris-logo.jpg";
import creatorPhoto from "@/assets/creator-photo.jpg";

const About = () => {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-background circuit-bg relative overflow-hidden">
      {/* Header */}
      <header className="border-b border-primary/30 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <article className="container mx-auto px-4 py-12 max-w-4xl">
        {/* KRIS Lab Section */}
        <div className="text-center mb-12">
          <img 
            src={krisLogo} 
            alt="KRIS Laboratory Logo - AI Engineering and Robotics Innovation System" 
            className="w-32 h-32 mx-auto rounded-full neon-border pulse-glow mb-6"
            width="128"
            height="128"
          />
          <h1 className="text-4xl md:text-5xl font-bold mb-6 neon-glow">
            About Kris AI Lab
          </h1>
        </div>

        <section className="bg-card/50 backdrop-blur-sm rounded-lg p-8 border border-primary/20 space-y-6 mb-12">
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            Kris AI Lab is a future-driven innovation platform designed to accelerate how people learn, think, and create.
          </p>
          
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            We combine advanced AI systems with human creativity, enabling students, makers, and researchers to transform raw ideas into functional prototypes, smart systems, and real-world solutions.
          </p>
          
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            From intelligent explanations to autonomous project generation, Kris acts as your personal innovation engine — guiding you, teaching you, and building with you.
          </p>
          
          <p className="text-base md:text-lg text-foreground font-semibold leading-relaxed">
            Our vision is simple:<br />
            To unlock a world where anyone can invent the future.
          </p>
        </section>

        {/* Creator Section */}
        <section className="bg-card/50 backdrop-blur-sm rounded-lg p-8 border border-primary/20">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center text-primary neon-glow">
            About the Creator
          </h2>
          
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-shrink-0">
              <img 
                src={creatorPhoto} 
                alt="KRIS Laboratory Creator" 
                className="w-48 h-48 md:w-56 md:h-56 rounded-lg neon-border object-cover"
                width="224"
                height="224"
              />
            </div>
            
            <div className="flex-1 space-y-4 text-center md:text-left">
              <h3 className="text-2xl font-bold text-foreground">
                Innovator & Engineering Enthusiast
              </h3>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                The visionary behind KRIS Laboratory, dedicated to democratizing advanced engineering tools and making innovation accessible to everyone. With a passion for AI, robotics, and education, the creator has built this platform to empower the next generation of inventors and problem-solvers.
              </p>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                Combining expertise in artificial intelligence, circuit design, and software development, KRIS Lab represents years of work toward creating an all-in-one innovation ecosystem that bridges the gap between imagination and reality.
              </p>
              
              <div className="flex gap-4 justify-center md:justify-start pt-4">
                <Button variant="outline" size="sm" className="gap-2">
                  <Mail className="w-4 h-4" />
                  Contact
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Github className="w-4 h-4" />
                  GitHub
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Keywords Footer */}
        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            <strong>Keywords:</strong> Think Beyond Build Beyond | Virtual Innovation Lab | AI Engineering | KRIS Lab | 
            Intelligent Precision | Circuit Design | 3D Modeling | Engineering Simulation | Project Innovation | AI Lab System
          </p>
        </footer>
      </article>
    </main>
  );
};

export default About;