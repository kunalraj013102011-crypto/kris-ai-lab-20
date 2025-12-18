import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background circuit-bg">
      <header className="border-b border-primary/30 bg-card/50 backdrop-blur-sm p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/dashboard")} className="hover:bg-primary/20">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-primary neon-glow">Terms of Service</h1>
          </div>
          <Badge variant="outline" className="border-primary/50">KRIS Laboratory</Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="prose prose-invert max-w-none">
          <p className="text-muted-foreground mb-8">Last updated: December 2024</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing or using KRIS Laboratory, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using this service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">2. Use License</h2>
            <p className="text-muted-foreground mb-4">
              Permission is granted to use KRIS Laboratory for personal and commercial purposes, subject to the following conditions:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>You must not use the service for any illegal activities</li>
              <li>You must not attempt to reverse engineer or compromise the system</li>
              <li>You must not use the service to harm others</li>
              <li>You retain ownership of content you create</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">3. User Accounts</h2>
            <p className="text-muted-foreground">
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">4. Intellectual Property</h2>
            <p className="text-muted-foreground">
              Content you create using KRIS Laboratory remains your property. KRIS Laboratory and its original content, features, and functionality are owned by Kunal Raj and are protected by international copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">5. Disclaimer</h2>
            <p className="text-muted-foreground">
              KRIS Laboratory is provided "as is" without warranties of any kind. We do not guarantee the accuracy of AI-generated content and recommend independent verification for critical applications.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">6. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              In no event shall KRIS Laboratory or its creators be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">7. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We reserve the right to modify these terms at any time. We will provide notice of significant changes. Continued use of the service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">8. Contact</h2>
            <p className="text-muted-foreground">
              For questions about these Terms of Service, please contact us at legal@krislab.dev or through our Contact page.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Terms;
