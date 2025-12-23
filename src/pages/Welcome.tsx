import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import krisLogo from "@/assets/kris-logo.jpg";
import { Sparkles } from "lucide-react";

const Welcome = () => {
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Animate content appearance
    setTimeout(() => setShowContent(true), 300);
  }, []);

  const handleGetStarted = () => {
    navigate("/auth");
  };

  return (
    <main className="min-h-screen bg-[#0a1628] relative overflow-hidden flex items-center justify-center">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628] via-[#0d1e36] to-[#0a1628]" />
      
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
              backgroundColor: i % 3 === 0 ? 'hsl(var(--primary))' : 'rgba(0, 255, 255, 0.3)',
              boxShadow: i % 3 === 0 ? '0 0 10px hsl(var(--primary))' : '0 0 6px rgba(0, 255, 255, 0.5)',
            }}
          />
        ))}
      </div>

      {/* Subtle grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Navigation buttons in upper right corner */}
      <nav className={`absolute top-6 right-6 z-20 flex gap-3 transition-all duration-1000 ${showContent ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
        <Button 
          size="sm"
          variant="outline"
          onClick={() => navigate("/about")}
          className="bg-transparent backdrop-blur-sm hover:bg-primary/10 border-primary/30 hover:border-primary text-foreground"
        >
          About
        </Button>
        <Button 
          size="sm"
          variant="outline"
          onClick={() => navigate("/contact")}
          className="bg-transparent backdrop-blur-sm hover:bg-primary/10 border-primary/30 hover:border-primary text-foreground"
        >
          Contact
        </Button>
      </nav>

      {/* Main content */}
      <article className={`relative z-10 text-center max-w-4xl mx-auto px-4 transition-all duration-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Logo with glow effect */}
        <div className="relative mb-8 inline-block">
          <div className="absolute inset-0 blur-2xl bg-primary/30 rounded-full scale-150" />
          <img 
            src={krisLogo} 
            alt="KRIS Laboratory Logo - AI Engineering and Robotics Innovation System" 
            className="w-32 h-32 md:w-40 md:h-40 mx-auto rounded-full relative z-10"
            style={{
              border: '3px solid hsl(var(--primary))',
              boxShadow: '0 0 30px hsl(var(--primary) / 0.5), 0 0 60px hsl(var(--primary) / 0.3), inset 0 0 20px hsl(var(--primary) / 0.2)'
            }}
            width="160"
            height="160"
            loading="eager"
          />
        </div>
        
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 text-foreground leading-tight">
          KRIS Laboratory — Virtual{" "}
          <span className="block">Innovation Lab & AI Research</span>
          <span className="block">Center</span>
        </h1>
        
        <p className="text-lg md:text-2xl text-primary mb-6 font-semibold tracking-wide">
          Virtual Innovation Lab for Advanced Engineering & AI Research
        </p>
        
        <section className="mb-10 max-w-3xl mx-auto">
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed text-center">
            KRIS Laboratory is a professional Virtual Innovation Lab and AI Engineering Research Center.
            Our virtual laboratory environment enables cutting-edge research in AI systems, robotics
            innovation, engineering simulations, and technology development. Experience the future of
            innovation in our virtual lab - where advanced AI research meets practical engineering solutions.
          </p>
        </section>

        <div className="flex justify-center mb-8">
          <Button 
            size="lg" 
            onClick={handleGetStarted}
            className="bg-transparent hover:bg-primary/20 text-primary px-8 py-6 text-base md:text-lg border-2 border-primary rounded-full"
            style={{
              boxShadow: '0 0 20px hsl(var(--primary) / 0.3)'
            }}
            aria-label="Enter KRIS Laboratory virtual engineering workspace"
          >
            Enter Laboratory
            <Sparkles className="ml-2 h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
        
        <footer className="text-xs md:text-sm text-muted-foreground/70">
          <p>
            Virtual Innovation Lab | AI Research Center | Engineering Innovation | Virtual Laboratory | Technology Research
          </p>
        </footer>
      </article>
    </main>
  );
};

export default Welcome;