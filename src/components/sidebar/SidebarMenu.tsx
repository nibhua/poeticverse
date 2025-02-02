import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MenuItem {
  title: string;
  icon: LucideIcon;
  path: string;
}

interface SidebarMenuProps {
  items: MenuItem[];
}

export function SidebarMenu({ items }: SidebarMenuProps) {
  const location = useLocation();

  return (
    <div className="flex-1 overflow-y-auto px-4 py-2">
      {items.map((item) => (
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
  );
}