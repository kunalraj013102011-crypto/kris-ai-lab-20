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
            About Kris Laboratory
          </h1>
        </div>

        <section className="bg-card/50 backdrop-blur-sm rounded-lg p-8 border border-primary/20 space-y-6 mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">Our Mission</h2>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            Kris Laboratory is a professional Engineering and AI Research Laboratory dedicated to advancing the frontiers of technology through innovative research, development, and applied science.
          </p>
          
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 mt-8">Research Focus</h2>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            Our research initiatives span multiple domains including AI Systems Innovation, Engineering Simulations, Automation & Robotics Research, and Applied Artificial Intelligence. We combine cutting-edge research methodologies with practical engineering applications to solve complex technological challenges.
          </p>
          
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 mt-8">Innovation & Development</h2>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            Through advanced simulation environments, intelligent development systems, and comprehensive research tools, Kris Laboratory empowers researchers, engineers, and innovators to conduct groundbreaking work in artificial intelligence and engineering domains.
          </p>
          
          <p className="text-base md:text-lg text-foreground font-semibold leading-relaxed mt-8">
            Vision Statement:<br />
            Advancing engineering and artificial intelligence research to shape the future of technology and innovation.
          </p>
        </section>

        {/* Creator Section */}
        <section className="bg-card/50 backdrop-blur-sm rounded-lg p-8 border border-primary/20">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center text-primary neon-glow">
            Research Director
          </h2>
          
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-shrink-0">
              <img 
                src={creatorPhoto} 
                alt="Kris Laboratory Research Director" 
                className="w-48 h-48 md:w-56 md:h-56 rounded-lg neon-border object-cover"
                width="224"
                height="224"
              />
            </div>
            
            <div className="flex-1 space-y-4 text-center md:text-left">
              <h3 className="text-2xl font-bold text-foreground">
                Principal Researcher & Laboratory Director
              </h3>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                Leading Kris Laboratory's research initiatives in engineering and artificial intelligence, our Research Director brings extensive expertise in AI systems, robotics research, and advanced engineering methodologies. The laboratory's research programs are designed to push the boundaries of what's possible in applied technology and innovation.
              </p>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                With a focus on practical applications of theoretical research, the laboratory bridges academic rigor with real-world engineering challenges, creating a comprehensive research environment that fosters innovation across multiple technological domains.
              </p>
              
              <div className="flex gap-4 justify-center md:justify-start pt-4">
                <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate("/contact")}>
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
            <strong>Keywords:</strong> Engineering Laboratory | Research Lab | AI Lab | Innovation Lab | AI Research Center | 
            Engineering R&D | Artificial Intelligence Research | Technology Lab | Applied Research | Engineering Innovation
          </p>
        </footer>
      </article>
    </main>
  );
};

export default About;