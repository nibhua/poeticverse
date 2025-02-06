import { useLocation, useNavigate } from "react-router-dom";
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
  Loader2,
  X,
} from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SidebarMenu } from "./sidebar/SidebarMenu";
import { SidebarOverlay } from "./sidebar/SidebarOverlay";
import { useIsMobile } from "@/hooks/use-mobile";

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toggleSidebar, state } = useSidebar();
  const [username, setUsername] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const isMobile = useIsMobile();

  useEffect(() => {
    let isMounted = true;
    let retryTimeout: NodeJS.Timeout;

    const checkSession = async () => {
      try {
        console.log("Checking session...");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session error:", error);
          throw error;
        }

        if (!session) {
          console.log("No session found");
          if (isMounted) {
            setIsAuthenticated(false);
            setIsLoading(false);
            if (!['/login', '/signup'].includes(location.pathname)) {
              navigate('/login');
            }
          }
          return;
        }

        console.log("Session found:", session);
        if (isMounted) {
          setIsAuthenticated(true);
        }

        if (session.user?.id) {
          console.log("Fetching profile for user:", session.user.id);
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", session.user.id)
            .single();

          if (profileError) {
            console.error("Error fetching profile:", profileError);
            throw profileError;
          }

          if (profile && isMounted) {
            console.log("Profile found:", profile);
            setUsername(profile.username);
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
        if (isMounted && retryCount < 3) {
          console.log(`Retrying... Attempt ${retryCount + 1} of 3`);
          setRetryCount(prev => prev + 1);
          retryTimeout = setTimeout(checkSession, 1000);
        } else if (isMounted) {
          console.log("Max retries reached or critical error");
          setIsAuthenticated(false);
          toast.error("Failed to verify authentication. Please try logging in again.");
          if (!['/login', '/signup'].includes(location.pathname)) {
            navigate('/login');
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
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
        }
      }
    });

    // Close sidebar on mobile when route changes
    const handleRouteChange = () => {
      if (isMobile) {
        toggleSidebar();
      }
    };

    window.addEventListener('popstate', handleRouteChange);

    return () => {
      isMounted = false;
      clearTimeout(retryTimeout);
      subscription.unsubscribe();
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [navigate, location.pathname, retryCount, isMobile, toggleSidebar]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/50">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">
            {retryCount > 0 ? `Retrying... (${retryCount}/3)` : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && (location.pathname === '/login' || location.pathname === '/signup')) {
    return null;
  }

  const menuItems = [
    { title: "Home", icon: Home, path: "/" },
    { title: "Search", icon: Search, path: "/search" },
    { title: "Create", icon: PlusSquare, path: "/create-post" },
    { title: "Books", icon: BookOpen, path: "/books" },
    { title: "Audio Library", icon: Headphones, path: "/audio-library" },
    { title: "Licensing", icon: Copyright, path: "/licensing" },
    { title: "Workshops", icon: Users, path: "/workshops" },
    { title: "Competitions", icon: Trophy, path: "/competitions" },
    { title: "Challenges", icon: ListChecks, path: "/challenges" },
    { title: "Profile", icon: UserRound, path: username ? `/profile/${username}` : "/login" },
  ];

  return (
    <>
      {isAuthenticated && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 bg-background md:hidden"
          onClick={toggleSidebar}
        >
          {state === "collapsed" ? (
            <Menu className="h-5 w-5" />
          ) : (
            <X className="h-5 w-5" />
          )}
        </Button>
      )}

      {isAuthenticated && (
        <nav 
          className={cn(
            "fixed top-0 left-0 h-full bg-background border-r w-64 transform transition-transform duration-200 ease-in-out z-40",
            state === "collapsed" ? "-translate-x-full" : "translate-x-0",
            "md:translate-x-0 md:relative md:w-64"
          )}
        >
          <div className="h-full flex flex-col">
            <div className="h-14" />
            <SidebarMenu items={menuItems} />
          </div>
        </nav>
      )}

      {isAuthenticated && (
        <SidebarOverlay 
          isOpen={state !== "collapsed" && isMobile} 
          onClose={toggleSidebar}
        />
      )}
    </>
  );
}