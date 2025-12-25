import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import Welcome from "./pages/Welcome";

import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AIScientist from "./pages/AIScientist";
import LearningHub from "./pages/LearningHub";
import Simulation from "./pages/Simulation";
import ThreeDLab from "./pages/ThreeDLab";
import CircuitCanvas from "./pages/CircuitCanvas";
import ProjectManager from "./pages/ProjectManager";
import Workspace from "./pages/Workspace";
import WorkspaceDetail from "./pages/WorkspaceDetail";
import WorkspaceProjectDashboard from "./pages/WorkspaceProjectDashboard";
import Settings from "./pages/Settings";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Services from "./pages/Services";
import Products from "./pages/Products";
import Research from "./pages/Research";
import Innovation from "./pages/Innovation";
import Collaboration from "./pages/Collaboration";
import Careers from "./pages/Careers";
import FAQ from "./pages/FAQ";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import { ContextualHelp } from "./components/ContextualHelp";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div className="min-h-screen bg-background circuit-bg flex items-center justify-center"><div className="text-primary">Loading...</div></div>;
  
  return session ? (
    <>
      {children}
      <ContextualHelp />
    </>
  ) : (
    <Navigate to="/auth" replace />
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/try-lab" element={<Dashboard />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/services" element={<Services />} />
          <Route path="/products" element={<Products />} />
          <Route path="/research" element={<Research />} />
          <Route path="/innovation" element={<Innovation />} />
          <Route path="/collaboration" element={<Collaboration />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/ai-scientist" element={<ProtectedRoute><AIScientist /></ProtectedRoute>} />
          <Route path="/learning-hub" element={<ProtectedRoute><LearningHub /></ProtectedRoute>} />
          <Route path="/simulation" element={<ProtectedRoute><Simulation /></ProtectedRoute>} />
          <Route path="/3d-lab" element={<ProtectedRoute><ThreeDLab /></ProtectedRoute>} />
          <Route path="/circuit-canvas" element={<ProtectedRoute><CircuitCanvas /></ProtectedRoute>} />
          <Route path="/project-manager" element={<ProtectedRoute><ProjectManager /></ProtectedRoute>} />
          <Route path="/workspace" element={<ProtectedRoute><Workspace /></ProtectedRoute>} />
          <Route path="/workspace/:workspaceId" element={<ProtectedRoute><WorkspaceDetail /></ProtectedRoute>} />
          <Route path="/workspace/:workspaceId/project/:projectId" element={<ProtectedRoute><WorkspaceProjectDashboard /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
