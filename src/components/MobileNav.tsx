import { Home, Search, PlusSquare, UserRound, BookOpen } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export const MobileNav = () => {
  const location = useLocation();
  const username = localStorage.getItem("username") || "";
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 px-6 z-50 md:hidden">
      <div className="max-w-lg mx-auto flex justify-between items-center">
        <Link
          to="/"
          className={cn(
            "flex flex-col items-center text-xs",
            isActive("/") ? "text-blue-500" : "text-gray-500"
          )}
        >
          <Home className="h-6 w-6 mb-1" />
          <span>Home</span>
        </Link>

        <Link
          to="/search"
          className={cn(
            "flex flex-col items-center text-xs",
            isActive("/search") ? "text-blue-500" : "text-gray-500"
          )}
        >
          <Search className="h-6 w-6 mb-1" />
          <span>Search</span>
        </Link>

        <Link
          to="/create-post"
          className={cn(
            "flex flex-col items-center text-xs",
            isActive("/create-post") ? "text-blue-500" : "text-gray-500"
          )}
        >
          <PlusSquare className="h-6 w-6 mb-1" />
          <span>Create</span>
        </Link>

        <Link
          to="/books"
          className={cn(
            "flex flex-col items-center text-xs",
            isActive("/books") ? "text-blue-500" : "text-gray-500"
          )}
        >
          <BookOpen className="h-6 w-6 mb-1" />
          <span>Books</span>
        </Link>

        <Link
          to={`/profile/${username}`}
          className={cn(
            "flex flex-col items-center text-xs",
            location.pathname.startsWith("/profile") ? "text-blue-500" : "text-gray-500"
          )}
        >
          <UserRound className="h-6 w-6 mb-1" />
          <span>Profile</span>
        </Link>
      </div>
    </nav>
  );
};