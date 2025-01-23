import { useLocation, Link } from "react-router-dom";
import { Home, Search, PlusSquare, UserRound, BookOpen, Menu } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function AppSidebar() {
  const location = useLocation();
  const { toggleSidebar } = useSidebar();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Check auth state on mount and auth changes
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Current session:", session);
      setUserId(session?.user?.id || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed:", session);
      setUserId(session?.user?.id || null);
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
      path: "/create-post",
    },
    {
      title: "Books",
      icon: BookOpen,
      path: "/books",
    },
    {
      title: "Profile",
      icon: UserRound,
      path: userId ? `/profile` : "/login",
    },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 bg-background md:block"
        onClick={toggleSidebar}
      >
        <Menu className="h-5 w-5" />
      </Button>
      
      <Sidebar className="fixed left-0 top-0 h-full w-64 bg-background border-r">
        <SidebarContent>
          <SidebarGroup>
            <div className="flex items-center justify-between p-4">
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarTrigger />
            </div>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.path)}
                      tooltip={item.title}
                    >
                      <Link
                        to={item.path}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-md hover:bg-accent",
                          isActive(item.path) && "bg-accent font-medium"
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </>
  );
}