import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import krisLogo from "@/assets/kris-logo.jpg";
import { Sparkles } from "lucide-react";

const Welcome = () => {
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated
    const authStatus = localStorage.getItem("kris_auth");
    if (authStatus) {
      // If already logged in, skip welcome page
      navigate("/dashboard");
      return;
    }

    // Animate content appearance
    setTimeout(() => setShowContent(true), 300);
  }, [navigate]);

  const handleGetStarted = () => {
    navigate("/auth");
  };

  return (
    <main className="min-h-screen bg-background circuit-bg relative overflow-hidden flex items-center justify-center">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Navigation buttons in upper right corner */}
      <nav className={`absolute top-6 right-6 z-20 flex gap-3 transition-all duration-1000 ${showContent ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
        <Button 
          size="sm"
          variant="outline"
          onClick={() => navigate("/about")}
          className="bg-background/80 backdrop-blur-sm hover:bg-background hover:scale-105 transition-all border-primary/20 hover:border-primary/40"
        >
          About
        </Button>
        <Button 
          size="sm"
          variant="outline"
          onClick={() => navigate("/contact")}
          className="bg-background/80 backdrop-blur-sm hover:bg-background hover:scale-105 transition-all border-primary/20 hover:border-primary/40"
        >
          Contact
        </Button>
      </nav>

      {/* Main content */}
      <article className={`relative z-10 text-center max-w-4xl mx-auto px-4 transition-all duration-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <img 
          src={krisLogo} 
          alt="KRIS Laboratory Logo - AI Engineering and Robotics Innovation System" 
          className="w-40 h-40 mx-auto rounded-full neon-border pulse-glow mb-6"
          width="160"
          height="160"
          loading="eager"
        />
        
        <h1 className="text-4xl md:text-6xl font-bold mb-6 neon-glow">
          KRIS Laboratory
        </h1>
        <p className="text-2xl md:text-3xl text-primary/90 mb-6 font-bold tracking-wide">
          Think Beyond. Build Beyond.
        </p>
        
        <section className="mb-8 max-w-3xl mx-auto">
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed text-center">
            A next-generation virtual innovation lab where creators can think, research, simulate, and build with intelligent precision. Powered by advanced engineering AI, KRIS Laboratory transforms raw imagination into engineered reality — enabling innovators to design circuits, generate 3D models, conduct simulations, perform experiments, and build complete projects in one unified space.
          </p>
        </section>

        <div className="flex justify-center">
          <Button 
            size="lg" 
            onClick={handleGetStarted}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-base md:text-lg neon-glow"
            aria-label="Enter KRIS Laboratory virtual engineering workspace"
          >
            Enter Laboratory
            <Sparkles className="ml-2 h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
        
        <footer className="mt-8 text-sm text-muted-foreground">
          <p>
            Intelligent Development System | Digital Lab Innovation | AI-Driven Engineering Workspace
          </p>
        </footer>
      </article>
    </main>
  );
};

export default Welcome;
