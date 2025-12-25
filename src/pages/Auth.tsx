import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import krisLogo from "@/assets/kris-logo.jpg";
import { Loader2 } from "lucide-react";
import welcomeSound from "@/assets/kris-welcome.mp3";

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/dashboard");
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) navigate("/dashboard");
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const playWelcomeSound = () => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(welcomeSound);
      }
      audioRef.current.play().catch(err => {
        console.log('Audio autoplay prevented:', err);
      });
    } catch (error) {
      console.log('Error playing welcome sound:', error);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        playWelcomeSound();
        toast({ title: "Welcome back!", description: "Successfully logged in to KRIS Laboratory." });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/dashboard` },
        });
        if (error) {
          if (error.message.includes('For security purposes')) {
            toast({ 
              title: "Please wait", 
              description: "Too many sign-up attempts. Please wait a moment and try again.", 
              variant: "destructive" 
            });
          } else {
            throw error;
          }
        } else {
          toast({ 
            title: "Account created!", 
            description: "Please check your email to confirm your account, then log in." 
          });
          setIsLogin(true);
        }
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background circuit-bg flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-primary/30 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={krisLogo} alt="KRIS" className="w-24 h-24 rounded-full neon-border pulse-glow" />
          </div>
          <CardTitle className="text-2xl text-primary">KRIS LABORATORY</CardTitle>
          <CardDescription>
            {isLogin ? "Sign in to access the laboratory" : "Create an account to get started"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="your.email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} className="border-primary/30" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} className="border-primary/30" minLength={6} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Please wait</> : (isLogin ? "Sign In" : "Sign Up")}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-sm text-primary hover:underline" disabled={loading}>
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
