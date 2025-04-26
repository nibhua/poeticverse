
// Navbar.tsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

export function Navbar() {
    const location = useLocation();
    
    return (
        <motion.header 
            className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b z-50 shadow-sm"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
            <div className="container mx-auto flex items-center justify-between px-4 py-3">
                <Link to="/" className="flex items-center">
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
                
                <motion.nav 
                    className="hidden md:flex items-center space-x-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    {[
                        { path: "/", label: "Home" },
                        { path: "/challenges", label: "Challenges" },
                        { path: "/workshops", label: "Workshops" },
                        { path: "/books", label: "Books" },
                        { path: "/audio-library", label: "Audio" }
                    ].map((item) => (
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
            </div>
        </motion.header>
    );
}
