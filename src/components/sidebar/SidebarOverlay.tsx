import { cn } from "@/lib/utils";

interface SidebarOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SidebarOverlay({ isOpen, onClose }: SidebarOverlayProps) {
  return (
    <div 
      className={cn(
        "fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-200",
        isOpen ? "opacity-100 lg:opacity-0 lg:pointer-events-none" : "opacity-0 pointer-events-none"
      )}
      onClick={onClose}
    />
  );
}