import { useLocation } from "react-router-dom";
import {
  Menu,
  Home,
  Search,
  BookOpen,
  PlusSquare,
  UserRound,
} from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function AppSidebar() {
  const location = useLocation();
  const { toggleSidebar } = useSidebar();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        console.log("Fetching profile for user:", session.user.id);
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", session.user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
        } else if (profile) {
          console.log("Found profile:", profile);
          setUsername(profile.username);
        }
      }
    };

    fetchUserProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed:", session);
      if (session?.user?.id) {
        fetchUserProfile();
      } else {
        setUsername(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const menuItems = [
    {
      title: "Home",
      icon: Home,
      path: "/",
    },
    {
      title: "Search",
      icon: Search,
      path: "/search",
    },
    {
      title: "Create",
      icon: PlusSquare,
      path: "/create",
    },
    {
      title: "Books",
      icon: BookOpen,
      path: "/books",
    },
    {
      title: "Profile",
      icon: UserRound,
      path: username ? `/profile/${username}` : "/login",
    },
  ];

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 bg-background md:block"
        onClick={toggleSidebar}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <nav className="fixed top-0 left-0 h-full bg-background border-r w-64 transform transition-transform duration-200 ease-in-out">
        <div className="p-4 space-y-4">
          <div className="h-14" /> {/* Spacer for the menu button */}
          {menuItems.map((item) => (
            <a
              key={item.title}
              href={item.path}
              className={cn(
                "flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors",
                location.pathname === item.path
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.title}</span>
            </a>
          ))}
        </div>
      </nav>
    </div>
  );
}