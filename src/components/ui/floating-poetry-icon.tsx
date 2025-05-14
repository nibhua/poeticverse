
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Book } from "lucide-react";

export const FloatingPoetryIcon = () => {
  return (
    <Link to="/poetry-assistant">
      <motion.div
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 shadow-lg hover:shadow-xl"
        initial={{ scale: 0, rotate: 0 }}
        animate={{ 
          scale: 1, 
          rotate: 360,
          y: [0, -10, 0],
        }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          rotate: { duration: 1 },
          y: { 
            repeat: Infinity, 
            duration: 2,
            ease: "easeInOut"
          }
        }}
        whileHover={{ 
          scale: 1.1,
          boxShadow: "0 0 15px rgba(139, 92, 246, 0.8)" 
        }}
        whileTap={{ scale: 0.9 }}
      >
        <div className="relative flex items-center justify-center">
          <Book className="h-6 w-6 text-white" />
          <motion.div
            className="absolute h-full w-full rounded-full border-2 border-white opacity-60"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.6, 0.2, 0.6],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
      </motion.div>
    </Link>
  );
};
