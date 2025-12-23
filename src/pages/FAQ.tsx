import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const FAQ = () => {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "What is KRIS Laboratory?",
      answer: "KRIS (Kunal Raj Intelligence System) Laboratory is a virtual innovation platform that combines AI-powered tools for research, learning, and project development. It includes modules for circuit design, 3D modeling, simulation, and an AI scientist team for expert guidance.",
    },
    {
      question: "How do I get started with KRIS?",
      answer: "Simply create an account and you'll have access to the dashboard with all available modules. You can start by clicking on the KRIS logo to chat with our AI assistant, which will guide you through the features and help you get started on your projects.",
    },
    {
      question: "Is KRIS Laboratory free to use?",
      answer: "KRIS Laboratory offers a free tier with access to basic features. Premium features and advanced capabilities are available through subscription plans. Contact us for enterprise pricing.",
    },
    {
      question: "What kind of projects can I work on?",
      answer: "You can work on a wide range of STEM projects including electronics, robotics, IoT devices, renewable energy systems, biomedical devices, software applications, and more. Our AI tools support the full project lifecycle from concept to prototype.",
    },
    {
      question: "How does the AI Scientist Team work?",
      answer: "The AI Scientist Team consists of specialized AI experts in physics, chemistry, engineering, and software. You can consult with individual experts or the entire team for comprehensive project guidance, technical analysis, and design validation.",
    },
    {
      question: "Can I save and export my work?",
      answer: "Yes! All your projects, circuit designs, 3D models, and learning progress are automatically saved. You can export designs in various formats for further development or 3D printing.",
    },
    {
      question: "Is my data secure?",
      answer: "We take security seriously. All data is encrypted and stored securely. We follow industry best practices for data protection. See our Privacy Policy for more details.",
    },
    {
      question: "How do I report issues or get support?",
      answer: "You can reach out through our Contact page or email support@krislab.dev. For technical issues, please include as much detail as possible about the problem you're experiencing.",
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
            <h1 className="text-2xl font-bold text-primary neon-glow">FAQ</h1>
          </div>
          <Badge variant="outline" className="border-primary/50">KRIS Laboratory</Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-primary mb-4">Frequently Asked Questions</h2>
          <p className="text-muted-foreground text-lg">
            Find answers to common questions about KRIS Laboratory.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card 
              key={index} 
              className={`bg-card/80 backdrop-blur-sm border-primary/30 transition-all cursor-pointer ${openIndex === index ? 'border-primary/60' : ''}`}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">{faq.question}</h3>
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-primary" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                {openIndex === index && (
                  <p className="mt-4 text-muted-foreground">{faq.answer}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">Still have questions?</p>
          <Button onClick={() => navigate("/contact")}>Contact Support</Button>
        </div>
      </main>
    </div>
  );
};

export default FAQ;
