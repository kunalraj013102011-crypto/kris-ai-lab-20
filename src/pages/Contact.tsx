import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Phone, MapPin, ExternalLink } from "lucide-react";
import krisLogo from "@/assets/kris-logo.jpg";

const quickLinks = [
  { title: "Services", url: "/services" },
  { title: "Products", url: "/products" },
  { title: "Research", url: "/research" },
  { title: "Innovation", url: "/innovation" },
  { title: "Collaboration", url: "/collaboration" },
  { title: "Careers", url: "/careers" },
  { title: "FAQ", url: "/faq" },
  { title: "Privacy Policy", url: "/privacy" },
  { title: "Terms of Service", url: "/terms" },
];

const Contact = () => {
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
            alt="KRIS Laboratory - Contact Information" 
            className="w-32 h-32 mx-auto rounded-full neon-border pulse-glow mb-6"
            width="128"
            height="128"
          />
          <h1 className="text-4xl md:text-5xl font-bold mb-4 neon-glow">
            Contact Us
          </h1>
          <p className="text-xl text-muted-foreground">
            Get in touch with KRIS Laboratory
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="space-y-6">
            {/* Email */}
            <section className="bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-primary/20">
              <div className="flex items-start gap-4">
                <Mail className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-2 text-foreground">Email Address</h2>
                  <a 
                    href="mailto:kris.kr1310@gmail.com"
                    className="text-lg text-primary hover:text-primary/80 transition-colors break-all"
                  >
                    kris.kr1310@gmail.com
                  </a>
                  <p className="text-sm text-muted-foreground mt-2">
                    For inquiries, support, or collaboration opportunities
                  </p>
                </div>
              </div>
            </section>

            {/* Phone */}
            <section className="bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-primary/20">
              <div className="flex items-start gap-4">
                <Phone className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-2 text-foreground">Phone Number</h2>
                  <a 
                    href="tel:+919870452707"
                    className="text-lg text-primary hover:text-primary/80 transition-colors"
                  >
                    +91 9870452707
                  </a>
                  <p className="text-sm text-muted-foreground mt-2">
                    Available for direct communication
                  </p>
                </div>
              </div>
            </section>

            {/* Location */}
            <section className="bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-primary/20">
              <div className="flex items-start gap-4">
                <MapPin className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-2 text-foreground">Location</h2>
                  <p className="text-lg text-muted-foreground">
                    India
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Virtual AI Engineering Laboratory
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <section className="bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-primary/20">
              <h2 className="text-xl font-bold mb-4 text-foreground">Quick Links</h2>
              <div className="grid grid-cols-2 gap-3">
                {quickLinks.map((link) => (
                  <Link
                    key={link.url}
                    to={link.url}
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors p-2 rounded-md hover:bg-primary/10"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {link.title}
                  </Link>
                ))}
              </div>
            </section>

            {/* About Creator */}
            <section className="bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-primary/20">
              <h2 className="text-xl font-bold mb-3 text-foreground">About the Creator</h2>
              <p className="text-muted-foreground leading-relaxed">
                <strong>KRIS Laboratory</strong> was created by <strong>Kunal Raj</strong>, an innovative engineer 
                dedicated to building intelligent systems that empower creativity and accelerate technical development. 
                For project inquiries, technical support, or collaboration opportunities, feel free to reach out through 
                the contact information provided.
              </p>
            </section>

            {/* Response Time Notice */}
            <div className="text-center p-4 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-sm text-muted-foreground">
                We typically respond to inquiries within 24-48 hours
              </p>
            </div>
          </div>
        </div>
      </article>
    </main>
  );
};

export default Contact;