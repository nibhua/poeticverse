
import { Link } from "react-router-dom";
import React from "react";

interface NavItemProps {
  children: React.ReactNode;
  icon: React.ReactNode;
  to: string;
}

export function NavItem({ children, icon, to }: NavItemProps) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-primary/10 hover:text-primary"
    >
      <span className="h-4 w-4">{icon}</span>
      <span>{children}</span>
    </Link>
  );
}
