import {
  Home,
  Search,
  PlusSquare,
  User,
  X as CloseIcon,
  Menu as MenuIcon,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const BottomNav = () => {
  const location = useLocation();
  const [username, setUsername] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const getProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .single();

        if (data) {
          setUsername(data.username);
        }
      }
    };
    getProfile();
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Toggle button for menu */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 p-2 bg-white text-black rounded-md shadow z-50"
      >
        {isOpen ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
      </button>

      {/* Sidebar container */}
      <div
        className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 py-6 px-4
          ${isOpen ? "w-64" : "w-16"} transition-all duration-300 ease-in-out z-40`}
      >
        <nav className="flex flex-col h-full justify-between">
          <div>
            {/* Header section */}
            <div
              className={`flex items-center justify-between mb-6 transition-opacity
              ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            >
              <div className="text-2xl font-bold">PoiticVerse</div>
            </div>

            {/* Navigation links */}
            <div className="space-y-4">
              <Link
                to="/"
                className={`flex items-center ${isOpen ? "space-x-3" : "justify-center"} 
                ${isActive("/") ? "text-social-primary font-semibold" : "text-gray-500"}`}
              >
                <Home size={24} />
                {isOpen && <span>Home</span>}
              </Link>
              <Link
                to="/search"
                className={`flex items-center ${isOpen ? "space-x-3" : "justify-center"} 
                ${isActive("/search") ? "text-social-primary font-semibold" : "text-gray-500"}`}
              >
                <Search size={24} />
                {isOpen && <span>Search</span>}
              </Link>
              <Link
                to="/create"
                className={`flex items-center ${isOpen ? "space-x-3" : "justify-center"} 
                ${isActive("/create") ? "text-social-primary font-semibold" : "text-gray-500"}`}
              >
                <PlusSquare size={24} />
                {isOpen && <span>Post</span>}
              </Link>
              <Link
                to={username ? `/profile/${username}` : "#"}
                className={`flex items-center ${isOpen ? "space-x-3" : "justify-center"} 
                ${isActive(`/profile/${username}`) ? "text-social-primary font-semibold" : "text-gray-500"}`}
              >
                <User size={24} />
                {isOpen && <span>Profile</span>}
              </Link>
            </div>
          </div>

          {/* Footer section */}
          <div
            className={`text-gray-400 text-xs mt-6 transition-opacity 
            ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          >
            <p>&copy; 2025 PoiticVerse</p>
          </div>
        </nav>
      </div>
    </>
  );
};
