import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  User,
  Globe,
  Moon,
  Sun,
  Bell,
  Shield,
  Palette,
  Save,
  Loader2,
} from "lucide-react";

const languages = [
  { code: "en", name: "English" },
  { code: "hi", name: "हिन्दी (Hindi)" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "zh", name: "中文" },
  { code: "ja", name: "日本語" },
  { code: "ar", name: "العربية" },
];

const Settings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    updates: true,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setUserEmail(user.email || "");
    setUserName(user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || "");
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("light", !isDarkMode);
    toast({
      title: "Theme Changed",
      description: `Switched to ${!isDarkMode ? "light" : "dark"} mode`,
    });
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: userName }
      });
      
      if (error) throw error;
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background circuit-bg">
        <DashboardSidebar />
        <main className="flex-1 overflow-auto">
          <header className="border-b border-primary/30 bg-card/50 backdrop-blur-sm p-4">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-2xl font-bold text-primary neon-glow">Settings</h1>
                <p className="text-sm text-muted-foreground">Manage your preferences</p>
              </div>
            </div>
          </header>

          <div className="p-6 max-w-4xl mx-auto">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="profile" className="gap-2">
                  <User className="w-4 h-4" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="appearance" className="gap-2">
                  <Palette className="w-4 h-4" />
                  Appearance
                </TabsTrigger>
                <TabsTrigger value="notifications" className="gap-2">
                  <Bell className="w-4 h-4" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="privacy" className="gap-2">
                  <Shield className="w-4 h-4" />
                  Privacy
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your personal details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Display Name</Label>
                      <Input
                        id="name"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="Enter your name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={userEmail}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">
                        Email cannot be changed here
                      </p>
                    </div>
                    <Button onClick={saveProfile} disabled={loading} className="gap-2">
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Changes
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="appearance">
                <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                  <CardHeader>
                    <CardTitle>Appearance Settings</CardTitle>
                    <CardDescription>Customize how KRIS looks for you</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="flex items-center gap-2">
                          {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                          Dark Mode
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Toggle between light and dark themes
                        </p>
                      </div>
                      <Switch checked={isDarkMode} onCheckedChange={toggleTheme} />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Language
                      </Label>
                      <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                        <SelectTrigger className="w-full max-w-xs">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          {languages.map((lang) => (
                            <SelectItem key={lang.code} value={lang.code}>
                              {lang.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications">
                <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>Manage how you receive notifications</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications via email
                        </p>
                      </div>
                      <Switch
                        checked={notifications.email}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, email: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive push notifications in browser
                        </p>
                      </div>
                      <Switch
                        checked={notifications.push}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, push: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Product Updates</Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified about new features
                        </p>
                      </div>
                      <Switch
                        checked={notifications.updates}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, updates: checked })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="privacy">
                <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                  <CardHeader>
                    <CardTitle>Privacy & Security</CardTitle>
                    <CardDescription>Manage your account security</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label>Change Password</Label>
                      <p className="text-sm text-muted-foreground mb-2">
                        Update your password to keep your account secure
                      </p>
                      <Button variant="outline">Change Password</Button>
                    </div>
                    <div className="space-y-2">
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground mb-2">
                        Add an extra layer of security to your account
                      </p>
                      <Button variant="outline">Enable 2FA</Button>
                    </div>
                    <div className="space-y-2 pt-4 border-t border-primary/20">
                      <Label className="text-destructive">Danger Zone</Label>
                      <p className="text-sm text-muted-foreground mb-2">
                        Permanently delete your account and all data
                      </p>
                      <Button variant="destructive">Delete Account</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Settings;
