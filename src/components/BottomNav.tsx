import { Home, Search, PlusSquare, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export const BottomNav = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 px-6">
      <div className="flex justify-between items-center max-w-lg mx-auto">
        <Link to="/" className={`flex flex-col items-center ${isActive('/') ? 'text-social-primary' : 'text-gray-500'}`}>
          <Home size={24} />
          <span className="text-xs mt-1">Home</span>
        </Link>
        <Link to="/search" className={`flex flex-col items-center ${isActive('/search') ? 'text-social-primary' : 'text-gray-500'}`}>
          <Search size={24} />
          <span className="text-xs mt-1">Search</span>
        </Link>
        <Link to="/create" className={`flex flex-col items-center ${isActive('/create') ? 'text-social-primary' : 'text-gray-500'}`}>
          <PlusSquare size={24} />
          <span className="text-xs mt-1">Post</span>
        </Link>
        <Link to="/profile" className={`flex flex-col items-center ${isActive('/profile') ? 'text-social-primary' : 'text-gray-500'}`}>
          <User size={24} />
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </div>
    </div>
  );
};