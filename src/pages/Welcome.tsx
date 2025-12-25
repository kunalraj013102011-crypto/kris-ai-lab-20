import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import krisLogo from "@/assets/kris-logo.jpg";
import { 
  Sparkles, 
  Brain, 
  Cpu, 
  Box, 
  CircuitBoard, 
  BookOpen,
  Zap,
  Users,
  Globe,
  ArrowRight,
  CheckCircle2
} from "lucide-react";

const features = [
  {
    icon: <Brain className="w-6 h-6" />,
    title: "AI-Powered Guidance",
    description: "Get expert help from KRIS AI for any project or idea"
  },
  {
    icon: <Cpu className="w-6 h-6" />,
    title: "Virtual Simulations",
    description: "Test and simulate projects before building"
  },
  {
    icon: <Box className="w-6 h-6" />,
    title: "3D Engineering Lab",
    description: "Design and visualize in 3D space"
  },
  {
    icon: <CircuitBoard className="w-6 h-6" />,
    title: "Circuit Designer",
    description: "Create electronic circuits virtually"
  },
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: "Learning Hub",
    description: "Daily lessons on AI, engineering & tech"
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Instant Results",
    description: "See your ideas come to life in seconds"
  }
];

const stats = [
  { icon: <Users className="w-5 h-5" />, value: "10K+", label: "Students & Innovators" },
  { icon: <Globe className="w-5 h-5" />, value: "50+", label: "Countries" },
  { icon: <Zap className="w-5 h-5" />, value: "100K+", label: "Projects Created" },
];

const Welcome = () => {
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    setTimeout(() => setShowContent(true), 300);
  }, []);

  const handleTryLab = () => {
    navigate("/try-lab");
  };

  const handleSignUp = () => {
    navigate("/auth");
  };

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card to-background" />
      
      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
              backgroundColor: i % 3 === 0 ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.3)',
              boxShadow: '0 0 10px hsl(var(--primary) / 0.5)',
            }}
          />
        ))}
      </div>

      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary) / 0.2) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--primary) / 0.2) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Navigation */}
      <nav className={`absolute top-6 right-6 z-20 flex gap-3 transition-all duration-1000 ${showContent ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
        <Button 
          size="sm"
          variant="outline"
          onClick={() => navigate("/about")}
          className="bg-transparent backdrop-blur-sm hover:bg-primary/10 border-primary/30 hover:border-primary"
        >
          About
        </Button>
        <Button 
          size="sm"
          variant="outline"
          onClick={() => navigate("/contact")}
          className="bg-transparent backdrop-blur-sm hover:bg-primary/10 border-primary/30 hover:border-primary"
        >
          Contact
        </Button>
        <Button 
          size="sm"
          onClick={handleSignUp}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Sign In
        </Button>
      </nav>

      {/* Hero Section */}
      <section className={`relative z-10 pt-20 pb-16 px-4 transition-all duration-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="max-w-6xl mx-auto text-center">
          {/* Logo */}
          <div className="relative mb-8 inline-block">
            <div className="absolute inset-0 blur-2xl bg-primary/30 rounded-full scale-150" />
            <img 
              src={krisLogo} 
              alt="KRIS AI Lab - Virtual Innovation Laboratory" 
              className="w-28 h-28 md:w-36 md:h-36 mx-auto rounded-full relative z-10 neon-border"
              width="144"
              height="144"
              loading="eager"
            />
          </div>
          
          {/* Badge */}
          <Badge className="mb-6 bg-primary/20 text-primary border-primary/50">
            <Sparkles className="w-3 h-3 mr-1" />
            Virtual Innovation Lab
          </Badge>
          
          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-foreground leading-tight">
            Build Anything.{" "}
            <span className="text-primary">Virtually.</span>
          </h1>
          
          {/* Sub-headline */}
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            KRIS AI Lab is your virtual innovation playground. Ideate, build, simulate, and prototype — all without any physical setup. Perfect for students, developers, and innovators.
          </p>
          
          {/* CTAs */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <Button 
              size="lg" 
              onClick={handleTryLab}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg rounded-full neon-border"
            >
              Try the Lab
              <Sparkles className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={handleSignUp}
              className="border-primary/50 hover:bg-primary/10 px-8 py-6 text-lg rounded-full"
            >
              Sign Up Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex justify-center gap-8 flex-wrap">
            {stats.map((stat, index) => (
              <div key={index} className="flex items-center gap-2 text-muted-foreground">
                <div className="text-primary">{stat.icon}</div>
                <span className="font-semibold text-foreground">{stat.value}</span>
                <span className="text-sm">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={`relative z-10 py-16 px-4 transition-all duration-1000 delay-300 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
            Everything You Need to <span className="text-primary">Innovate</span>
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            From idea validation to working prototype — all in one virtual lab.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-card/50 backdrop-blur-sm border border-primary/20 rounded-xl p-6 hover:border-primary/50 transition-all hover:scale-105"
              >
                <div className="text-primary mb-4">{feature.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className={`relative z-10 py-16 px-4 transition-all duration-1000 delay-500 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-12">
            Start Building in <span className="text-primary">3 Simple Steps</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Describe Your Idea", desc: "Tell KRIS AI what you want to build" },
              { step: "2", title: "Build & Simulate", desc: "Use virtual labs to create and test" },
              { step: "3", title: "Get Your Prototype", desc: "Export designs and specifications" },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="w-12 h-12 rounded-full bg-primary/20 text-primary font-bold text-xl flex items-center justify-center mx-auto mb-4 border border-primary/50">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`relative z-10 py-16 px-4 transition-all duration-1000 delay-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="max-w-4xl mx-auto text-center bg-card/50 backdrop-blur-sm border border-primary/30 rounded-2xl p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to Start Innovating?
          </h2>
          <p className="text-muted-foreground mb-6">
            No credit card required. No physical setup. Just pure innovation.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
            <Button 
              size="lg" 
              onClick={handleTryLab}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8"
            >
              Try the Lab Now
              <Sparkles className="ml-2 h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              Free to try
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              No setup needed
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              Beginner friendly
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-4 border-t border-primary/20">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-xs text-muted-foreground">
            KRIS AI Lab — Virtual Innovation Lab | AI Research | Engineering | Technology | Created by Kunal Raj
          </p>
        </div>
      </footer>
    </main>
  );
};

export default Welcome;