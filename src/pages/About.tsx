import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import krisLogo from "@/assets/kris-logo.jpg";

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

        {/* Main Content */}
        <section className="bg-card/50 backdrop-blur-sm rounded-lg p-8 border border-primary/20 space-y-6">
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
