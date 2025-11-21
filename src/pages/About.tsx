import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Target, Lightbulb, Cpu } from "lucide-react";
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4 neon-glow">
            About KRIS Laboratory
          </h1>
          <p className="text-xl text-primary/90">
            Knowledge Reinforcement and Intelligence System
          </p>
        </div>

        {/* Mission Section */}
        <section className="mb-12 bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-primary/20">
          <div className="flex items-start gap-4 mb-4">
            <Target className="w-8 h-8 text-primary flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold mb-4 text-foreground">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                KRIS Laboratory is a next-generation <strong>virtual AI engineering lab</strong> designed to revolutionize 
                how engineers, researchers, and innovators approach <strong>robotics development</strong>, <strong>circuit design</strong>, 
                and <strong>AI-powered automation</strong>. Our platform combines advanced artificial intelligence with comprehensive 
                engineering tools to create an intelligent development ecosystem.
              </p>
            </div>
          </div>
        </section>

        {/* Creator Section */}
        <section className="mb-12 bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-primary/20">
          <div className="flex items-start gap-4 mb-4">
            <User className="w-8 h-8 text-primary flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold mb-4 text-foreground">The Creator</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                <strong>KRIS Laboratory</strong> was created by <strong>Kunal Raj</strong>, an innovative engineer and AI enthusiast 
                passionate about building intelligent systems that empower creativity and accelerate technical development. 
                With a vision to democratize access to advanced engineering tools, Kunal developed KRIS as a comprehensive 
                platform that bridges the gap between AI capabilities and practical engineering applications.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                The system reflects Kunal's commitment to creating accessible, intelligent, and user-friendly engineering 
                environments that adapt to diverse project needs—from robotics simulation to circuit design and 3D modeling.
              </p>
            </div>
          </div>
        </section>

        {/* Vision Section */}
        <section className="mb-12 bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-primary/20">
          <div className="flex items-start gap-4 mb-4">
            <Lightbulb className="w-8 h-8 text-primary flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold mb-4 text-foreground">Our Vision</h2>
              <p className="text-muted-foreground leading-relaxed">
                We envision a future where <strong>AI-driven virtual laboratories</strong> become the standard for engineering 
                innovation. KRIS Laboratory aims to provide an integrated workspace where ideas transform into reality through 
                intelligent automation, expert AI consultation, and comprehensive simulation capabilities. Our goal is to make 
                advanced engineering accessible to everyone—from students to professional researchers.
              </p>
            </div>
          </div>
        </section>

        {/* Core Technologies */}
        <section className="bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-primary/20">
          <div className="flex items-start gap-4">
            <Cpu className="w-8 h-8 text-primary flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold mb-4 text-foreground">Core Technologies</h2>
              <div className="grid md:grid-cols-2 gap-4 text-muted-foreground">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">AI & Machine Learning</h3>
                  <ul className="space-y-2 list-disc list-inside text-sm">
                    <li>Advanced AI consultation modules</li>
                    <li>Intelligent project analysis</li>
                    <li>Automated learning systems</li>
                    <li>Natural language processing</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Engineering Tools</h3>
                  <ul className="space-y-2 list-disc list-inside text-sm">
                    <li>Circuit design & simulation</li>
                    <li>3D modeling laboratory</li>
                    <li>Robotics workspace</li>
                    <li>Project management system</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Keywords Footer */}
        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            <strong>Keywords:</strong> Virtual Lab | AI Lab | KRIS Lab | Robotics Lab | AI Engineering System | 
            Digital Lab | Engineering Innovation | Automation Lab | AI Robotics Workspace | Intelligent Development System
          </p>
        </footer>
      </article>
    </main>
  );
};

export default About;
