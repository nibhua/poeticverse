
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";

export function Navbar() {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [username, setUsername] = useState<string | null>(null);
    const isMobile = useIsMobile();
    
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);
    
    useEffect(() => {
        const fetchUserProfile = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user?.id) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("username")
                    .eq("id", session.user.id)
                    .single();
                
                if (profile) {
                    setUsername(profile.username);
                }
            }
        };

        fetchUserProfile();
    }, []);

    const menuItems = [
        { path: "/", label: "Home" },
        { path: "/search", label: "Search" },
        { path: "/create-post", label: "Create" },
        { path: "/books", label: "Books" },
        { path: "/audio-library", label: "Audio" },
        { path: "/workshops", label: "Workshops" },
        { path: "/competitions", label: "Competitions" },
        { path: "/challenges", label: "Challenges" },
        { path: "/privacy-policy", label: "Privacy Policy" },
        { path: "/contact", label: "Contact" },
        { path: username ? `/profile/${username}` : "/login", label: "Profile" },
        { path: "/login", label: "Sign Out" }
    ];
    
    return (
        <motion.header 
            className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b z-50 shadow-sm h-12"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
            <div className="flex items-center justify-between h-full px-2 mx-auto w-full">
                <Link to="/" className="flex items-center h-full p-0 ml-0">
                    <motion.img 
                        src="/logo1.png" 
                        alt="Poeticverse Logo" 
                        className="h-8"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    />
                    <motion.h1 
                        className="ml-2 text-lg font-bold bg-gradient-to-r from-purple-700 to-blue-500 bg-clip-text text-transparent"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        Poeticverse
                    </motion.h1>
                </Link>
                
                {isMobile && (
                    <button 
                        className="p-1.5 rounded-md hover:bg-gray-100 transition-colors z-50"
                        onClick={toggleMobileMenu}
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? (
                            <X className="h-5 w-5 text-gray-600" />
                        ) : (
                            <Menu className="h-5 w-5 text-gray-600" />
                        )}
                    </button>
                )}

                {/* Desktop navigation */}
                <motion.nav 
                    className="hidden md:flex items-center space-x-1 overflow-x-auto scrollbar-hide pr-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    {menuItems.slice(0, 10).map((item) => (
                        <Link 
                            key={item.path} 
                            to={item.path}
                            className={`relative px-1.5 py-1 text-xs whitespace-nowrap font-medium transition-colors
                                ${location.pathname === item.path ? 
                                "text-primary" : "text-gray-600 hover:text-gray-900"}`}
                        >
                            {item.label}
                            {location.pathname === item.path && (
                                <motion.span 
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                                    layoutId="navbar-indicator"
                                />
                            )}
                        </Link>
                    ))}
                </motion.nav>

                {/* Mobile navigation */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            className="fixed inset-0 z-40 md:hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div className="absolute inset-0 bg-black/50" onClick={toggleMobileMenu} />
                            
                            <motion.div 
                                className="absolute right-2 top-14 w-[calc(100%-1rem)] max-w-xs"
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -20, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            >
                                <Card className="p-2 bg-white/95 backdrop-blur-sm border shadow-lg">
                                    <ScrollArea className="h-[calc(100vh-8rem)]">
                                        <div className="grid grid-cols-2 gap-1 p-1">
                                            {menuItems.map((item) => (
                                                <Link 
                                                    key={item.path} 
                                                    to={item.path}
                                                    className={`px-2 py-1.5 text-xs font-medium rounded-md ${
                                                        location.pathname === item.path ? 
                                                        "bg-primary/10 text-primary" : "text-gray-700 hover:bg-gray-100"
                                                    }`}
                                                    onClick={toggleMobileMenu}
                                                >
                                                    {item.label}
                                                </Link>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </Card>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.header>
    );
}
