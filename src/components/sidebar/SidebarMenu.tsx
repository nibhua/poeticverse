import {
  Home,
  Book,
  Audio,
  Users,
  ListChecks,
  Trophy,
  Sparkles,
  Settings,
  HelpCircle,
  LogOut,
  User,
} from "lucide-react";
import { NavItem } from "./NavItem";
import { useUser } from "@/hooks/useUser";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

export function SidebarMenu() {
  const { user, isLoading } = useUser();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      // Handle error (e.g., display an error message)
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-3">
        <Link to="/">
          <h2 className="font-bold text-lg">Textiverse</h2>
        </Link>
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="outline-none focus:outline-none">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback>{user?.email?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link to={`/profile/${user?.user_metadata?.username}`}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/profile/edit">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Support</span>
              </DropdownMenuItem>
              <DropdownMenuItem disabled={isLoggingOut} onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>

      <div>
        <h3 className="px-3 text-sm font-semibold text-gray-500">Navigation</h3>
        <div className="space-y-1 mt-1">
          <NavItem to="/" icon={<Home />}>
            Home
          </NavItem>
          {user ? (
            <NavItem to={`/profile/${user?.user_metadata?.username}`} icon={<User />}>
              Profile
            </NavItem>
          ) : null}
        </div>
      </div>

      <div>
        <h3 className="px-3 text-sm font-semibold text-gray-500">Content</h3>
        <div className="space-y-1 mt-1">
          <NavItem to="/books" icon={<Book />}>
            Books
          </NavItem>
          <NavItem to="/audio" icon={<Audio />}>
            Audio
          </NavItem>
          <NavItem to="/workshops" icon={<Users />}>
            Workshops
          </NavItem>
          <NavItem to="/challenges" icon={<ListChecks />}>
            Challenges
          </NavItem>
          <NavItem to="/competitions" icon={<Trophy />}>
            Competitions
          </NavItem>
          <NavItem to="/poetry-assistant" icon={<Sparkles />}>
            Poetry Assistant
          </NavItem>
        </div>
      </div>

      <div className="mt-auto px-3 py-2 text-center text-xs text-gray-500">
        <p>&copy; {new Date().getFullYear()} Textiverse</p>
        <a href="/privacy-policy" className="hover:underline">
          Privacy Policy
        </a>
      </div>
    </div>
  );
}
