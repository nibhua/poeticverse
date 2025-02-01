import { useLocation, Link, useNavigate } from "react-router-dom";
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
import { toast } from "sonner";

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toggleSidebar, state } = useSidebar();
  const [username, setUsername] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session error:", error);
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        if (!session) {
          console.log("No session found");
          setIsAuthenticated(false);
          setIsLoading(false);
          if (!['/login', '/signup'].includes(location.pathname)) {
            navigate('/login');
          }
          return;
        }

        setIsAuthenticated(true);

        if (session.user?.id) {
          try {
            const { data: profile, error: profileError } = await supabase
              .from("profiles")
              .select("username")
              .eq("id", session.user.id)
              .single();

            if (profileError) {
              console.error("Error fetching profile:", profileError);
              toast.error("Error loading profile");
            } else if (profile) {
              console.log("Found profile:", profile);
              setUsername(profile.username);
            }
          } catch (error) {
            console.error("Profile fetch error:", error);
            toast.error("Error loading profile data");
          }
        }
      } catch (error) {
        console.error("Auth error:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);
      
      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setUsername(null);
        navigate('/login');
        return;
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setIsAuthenticated(true);
        if (session?.user?.id) {
          try {
            const { data: profile, error: profileError } = await supabase
              .from("profiles")
              .select("username")
              .eq("id", session.user.id)
              .single();
            
            if (profileError) {
              console.error("Error fetching profile:", profileError);
              toast.error("Error loading profile");
            } else if (profile) {
              setUsername(profile.username);
            }
          } catch (error) {
            console.error("Profile fetch error:", error);
            toast.error("Error loading profile data");
          }
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  // Show loading state
  if (isLoading) {
    return null;
  }

  // Don't render the sidebar on login/signup pages or when not authenticated
  if (!isAuthenticated && (location.pathname === '/login' || location.pathname === '/signup')) {
    return null;
  }

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
      {isAuthenticated && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 bg-background md:block"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}

      {isAuthenticated && (
        <nav 
          className={cn(
            "fixed top-0 left-0 h-full bg-background border-r w-64 transform transition-transform duration-200 ease-in-out z-40",
            state === "collapsed" ? "-translate-x-full" : "translate-x-0"
          )}
        >
          <div className="h-full flex flex-col">
            <div className="h-14" />
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
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </nav>
      )}

      {isAuthenticated && (
        <div 
          className={cn(
            "fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-200",
            state === "collapsed" ? "opacity-0 pointer-events-none" : "opacity-100 lg:opacity-0 lg:pointer-events-none"
          )}
          onClick={toggleSidebar}
        />
      )}

      {isAuthenticated && (
        <div 
          className={cn(
            "min-h-screen transition-all duration-200 ease-in-out",
            state === "collapsed" ? "ml-0" : "ml-64"
          )}
        >
          <div className="container mx-auto px-4 py-8">
            {/* Your main content goes here */}
          </div>
        </div>
      )}
    </>
  );
}