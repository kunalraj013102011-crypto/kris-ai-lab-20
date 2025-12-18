import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Brain,
  BookOpen,
  Cpu,
  Box,
  CircuitBoard,
  FolderKanban,
  Home,
  Settings,
  User,
  Globe,
  Info,
  Briefcase,
  ShoppingBag,
  Microscope,
  Lightbulb,
  Users,
  UserPlus,
  Mail,
  HelpCircle,
  Shield,
  FileText,
  ChevronDown,
  LogOut,
  Moon,
  Sun,
  Layers,
} from "lucide-react";
import krisLogo from "@/assets/kris-logo.jpg";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const mainModules = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "AI Scientist", url: "/ai-scientist", icon: Brain },
  { title: "Learning Hub", url: "/learning-hub", icon: BookOpen },
  { title: "Simulation", url: "/simulation", icon: Cpu },
  { title: "3D Lab", url: "/3d-lab", icon: Box },
  { title: "Circuit Canvas", url: "/circuit-canvas", icon: CircuitBoard },
  { title: "Project Manager", url: "/project-manager", icon: FolderKanban },
  { title: "Workspace", url: "/workspace", icon: Layers },
];

const professionalPages = [
  { title: "About Us", url: "/about", icon: Info },
  { title: "Services", url: "/services", icon: Briefcase },
  { title: "Products & Platforms", url: "/products", icon: ShoppingBag },
  { title: "Research Domains", url: "/research", icon: Microscope },
  { title: "Innovation Hub", url: "/innovation", icon: Lightbulb },
  { title: "Collaboration", url: "/collaboration", icon: Users },
  { title: "Careers", url: "/careers", icon: UserPlus },
  { title: "Contact Us", url: "/contact", icon: Mail },
];

const supportPages = [
  { title: "FAQ", url: "/faq", icon: HelpCircle },
  { title: "Privacy Policy", url: "/privacy", icon: Shield },
  { title: "Terms of Service", url: "/terms", icon: FileText },
];

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

export function DashboardSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || null);
        // Try to get name from user metadata
        const fullName = user.user_metadata?.full_name || 
                         user.user_metadata?.name ||
                         user.email?.split('@')[0] || 
                         'User';
        setUserName(fullName);
      }
    };
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "Successfully logged out from KRIS Laboratory.",
    });
    navigate("/auth");
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("light", !isDarkMode);
    toast({
      title: "Theme Changed",
      description: `Switched to ${!isDarkMode ? "light" : "dark"} mode`,
    });
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon" className="border-r border-primary/20">
      <SidebarHeader className="border-b border-primary/20 p-4">
        <div className="flex items-center gap-3">
          <img
            src={krisLogo}
            alt="KRIS"
            className="w-10 h-10 rounded-full border-2 border-primary"
          />
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold text-primary">KRIS LAB</h1>
              <p className="text-xs text-muted-foreground">Virtual Innovation</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Modules */}
        <SidebarGroup>
          <SidebarGroupLabel>Modules</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainModules.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.url)}
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Professional Pages */}
        <SidebarGroup>
          <SidebarGroupLabel>Company</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {professionalPages.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.url)}
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Support Pages */}
        <SidebarGroup>
          <SidebarGroupLabel>Support</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {supportPages.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.url)}
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings */}
        {!collapsed && (
          <SidebarGroup>
            <SidebarGroupLabel>Settings</SidebarGroupLabel>
            <SidebarGroupContent className="px-2 space-y-4">
              {/* Theme Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isDarkMode ? (
                    <Moon className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Sun className="w-4 h-4 text-muted-foreground" />
                  )}
                  <Label className="text-sm">Dark Mode</Label>
                </div>
                <Switch checked={isDarkMode} onCheckedChange={toggleTheme} />
              </div>

              {/* Language Selector */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <Label className="text-sm">Language</Label>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-between"
                    >
                      {languages.find((l) => l.code === selectedLanguage)?.name}
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {languages.map((lang) => (
                      <DropdownMenuItem
                        key={lang.code}
                        onClick={() => {
                          setSelectedLanguage(lang.code);
                          toast({
                            title: "Language Changed",
                            description: `Language set to ${lang.name}`,
                          });
                        }}
                      >
                        {lang.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-primary/20 p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <User className="w-4 h-4" />
              {!collapsed && <span className="truncate">{userName || 'Profile'}</span>}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/profile")}>
              <User className="w-4 h-4 mr-2" />
              My Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}