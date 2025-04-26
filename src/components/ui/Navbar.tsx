
// Navbar.tsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";

export function Navbar() {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const menuItems = [
        { path: "/", label: "Home" },
        { path: "/challenges", label: "Challenges" },
        { path: "/workshops", label: "Workshops" },
        { path: "/books", label: "Books" },
        { path: "/audio-library", label: "Audio" }
    ];
    
    return (
        <motion.header 
            className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b z-50 shadow-sm"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
            <div className="container mx-auto flex items-center justify-between px-4 py-3">
                <Link to="/" className="flex items-center z-20">
                    <motion.img 
                        src="/logo1.png" 
                        alt="Poeticverse Logo" 
                        className="h-10"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    />
                    <motion.h1 
                        className="ml-3 text-xl font-bold bg-gradient-to-r from-purple-700 to-blue-500 bg-clip-text text-transparent"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        Poeticverse
                    </motion.h1>
                </Link>
                
                {/* Mobile menu button */}
                <button 
                    className="md:hidden z-20 p-2 rounded-md hover:bg-gray-100 transition-colors"
                    onClick={toggleMobileMenu}
                    aria-label="Toggle menu"
                >
                    {isMobileMenuOpen ? (
                        <X className="h-6 w-6 text-gray-600" />
                    ) : (
                        <Menu className="h-6 w-6 text-gray-600" />
                    )}
                </button>

                {/* Desktop navigation */}
                <motion.nav 
                    className="hidden md:flex items-center space-x-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    {menuItems.map((item) => (
                        <Link 
                            key={item.path} 
                            to={item.path}
                            className={`relative px-2 py-1 text-sm font-medium transition-colors
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
                {isMobileMenuOpen && (
                    <motion.div
                        className="fixed inset-0 bg-white z-10 md:hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="flex flex-col items-center justify-center h-full">
                            <motion.div 
                                className="flex flex-col items-center space-y-6"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                {menuItems.map((item, index) => (
                                    <Link 
                                        key={item.path} 
                                        to={item.path}
                                        className={`text-xl font-medium ${
                                            location.pathname === item.path ? 
                                            "text-primary" : "text-gray-600"
                                        }`}
                                        onClick={toggleMobileMenu}
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.header>
    );
}
