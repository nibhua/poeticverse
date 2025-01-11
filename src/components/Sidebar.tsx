import { Home, Search, PlusSquare, UserRound, BookOpen } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export const Sidebar = () => {
  const location = useLocation();
  const username = localStorage.getItem("username") || "";
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 py-6 px-4 z-50 hidden md:block">
      <div className="flex flex-col space-y-6">
        <Link
          to="/"
          className={cn(
            "flex items-center space-x-3 p-2 rounded-lg transition-colors",
            isActive("/") ? "bg-blue-50 text-blue-500" : "text-gray-500 hover:bg-gray-50"
          )}
        >
          <Home className="h-5 w-5" />
          <span>Home</span>
        </Link>

        <Link
          to="/search"
          className={cn(
            "flex items-center space-x-3 p-2 rounded-lg transition-colors",
            isActive("/search") ? "bg-blue-50 text-blue-500" : "text-gray-500 hover:bg-gray-50"
          )}
        >
          <Search className="h-5 w-5" />
          <span>Search</span>
        </Link>

        <Link
          to="/create-post"
          className={cn(
            "flex items-center space-x-3 p-2 rounded-lg transition-colors",
            isActive("/create-post") ? "bg-blue-50 text-blue-500" : "text-gray-500 hover:bg-gray-50"
          )}
        >
          <PlusSquare className="h-5 w-5" />
          <span>Create</span>
        </Link>

        <Link
          to="/books"
          className={cn(
            "flex items-center space-x-3 p-2 rounded-lg transition-colors",
            isActive("/books") ? "bg-blue-50 text-blue-500" : "text-gray-500 hover:bg-gray-50"
          )}
        >
          <BookOpen className="h-5 w-5" />
          <span>Books</span>
        </Link>

        <Link
          to={`/profile/${username}`}
          className={cn(
            "flex items-center space-x-3 p-2 rounded-lg transition-colors",
            location.pathname.startsWith("/profile") ? "bg-blue-50 text-blue-500" : "text-gray-500 hover:bg-gray-50"
          )}
        >
          <UserRound className="h-5 w-5" />
          <span>Profile</span>
        </Link>
      </div>
    </nav>
  );
};