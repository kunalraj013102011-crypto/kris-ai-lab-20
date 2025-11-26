import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const LearningHub = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen to auth state changes and sync with iframe
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (iframeRef.current?.contentWindow) {
        // Send auth state to iframe
        iframeRef.current.contentWindow.postMessage(
          {
            type: 'KRIS_AUTH_SYNC',
            event,
            session: session ? {
              access_token: session.access_token,
              refresh_token: session.refresh_token,
              user: session.user,
              expires_at: session.expires_at
            } : null
          },
          'https://forge-ai-mentor.lovable.app'
        );
      }
    });

    // Send initial auth state on mount
    const syncInitialAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (iframeRef.current?.contentWindow && session) {
        iframeRef.current.contentWindow.postMessage(
          {
            type: 'KRIS_AUTH_SYNC',
            event: 'INITIAL_SESSION',
            session: {
              access_token: session.access_token,
              refresh_token: session.refresh_token,
              user: session.user,
              expires_at: session.expires_at
            }
          },
          'https://forge-ai-mentor.lovable.app'
        );
      }
    };

    // Wait for iframe to load before sending initial auth
    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener('load', syncInitialAuth);
    }

    return () => {
      subscription.unsubscribe();
      if (iframe) {
        iframe.removeEventListener('load', syncInitialAuth);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full">
      <Button
        onClick={() => navigate("/dashboard")}
        className="absolute top-4 right-4 z-50 bg-background/80 backdrop-blur-sm hover:bg-background/90"
        size="sm"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>
      <iframe
        ref={iframeRef}
        src="https://forge-ai-mentor.lovable.app"
        className="w-full h-full border-0"
        title="Learning Hub"
        allow="camera; microphone; clipboard-read; clipboard-write"
      />
    </div>
  );
};

export default LearningHub;