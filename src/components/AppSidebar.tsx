
import { useLocation, Link } from "react-router-dom";
import {
  Menu,
  Home,
  Search,
  BookOpen,
  PlusSquare,
  UserRound,
  Headphones,
  Copyright,
  Users,
  Trophy,
  ListChecks,
} from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

export function AppSidebar() {
  const location = useLocation();
  const { toggleSidebar, state } = useSidebar();
  const [username, setUsername] = useState<string | null>(null);
  const isMobile = useIsMobile();

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

  // Close sidebar on route change when in mobile view
  useEffect(() => {
    if (isMobile && state === "expanded") {
      toggleSidebar();
    }
  }, [location.pathname, isMobile]);

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
      path: "/create-post",
    },
    {
      title: "Books",
      icon: BookOpen,
      path: "/books",
    },
    {
      title: "Audio Library",
      icon: Headphones,
      path: "/audio-library",
    },
    {
      title: "Licensing",
      icon: Copyright,
      path: "/licensing",
    },
    {
      title: "Workshops",
      icon: Users,
      path: "/workshops",
    },
    {
      title: "Competitions",
      icon: Trophy,
      path: "/competitions",
    },
    {
      title: "Challenges",
      icon: ListChecks,
      path: "/challenges",
    },
    {
      title: "Profile",
      icon: UserRound,
      path: username ? `/profile/${username}` : "/login",
    },
  ];

  return (
    <>
      {/* Fixed menu button with proper positioning */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-16 left-4 z-40 bg-background shadow-sm"
        onClick={toggleSidebar}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <nav
        className={cn(
          "fixed top-12 left-0 h-[calc(100%-48px)] bg-background border-r w-64 transform transition-transform duration-200 ease-in-out z-30",
          state === "collapsed" ? "-translate-x-full" : "translate-x-0"
        )}
      >
        <div className="h-full flex flex-col">
          {/* Space for menu button */}
          <div className="h-16" />
          <div className="flex-1 overflow-y-auto px-4 py-2">
            {menuItems.map((item) => (
              <Link
                key={item.title}
                to={item.path}
                className={cn(
                  "flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors mb-1",
                  location.pathname === item.path
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
                onClick={() => isMobile && toggleSidebar()}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Overlay when sidebar is open - ensure it's clickable to close the sidebar */}
      <div
        className={cn(
          "fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-200 z-20",
          state === "collapsed" ? "opacity-0 pointer-events-none" : "opacity-100 lg:opacity-0 lg:pointer-events-none"
        )}
        onClick={toggleSidebar}
      />

      {/* Main content margin (updated for better spacing) */}
      <div
        className={cn(
          "min-h-screen transition-all duration-200 ease-in-out pt-12",
          state === "collapsed" ? "ml-0" : "ml-64"
        )}
      >
        <div className="container mx-auto px-4 py-8">
          {/* Your main content goes here */}
        </div>
      </div>
    </>
  );
}
