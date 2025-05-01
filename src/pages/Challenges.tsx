
import { useQuery } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Search as SearchIcon, ListChecks, Calendar, Sparkles, Paintbrush } from "lucide-react";
import { motion } from "framer-motion";

export default function Challenges() {
  const [searchTerm, setSearchTerm] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const { data: challenges, isLoading } = useQuery({
    queryKey: ["challenges"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("challenges")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const handleScroll = () => {
      if (searchRef.current) {
        if (window.scrollY > 50) {
          searchRef.current.classList.add("sticky-search");
        } else {
          searchRef.current.classList.remove("sticky-search");
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const filteredChallenges = challenges?.filter(challenge =>
    challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    challenge.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    challenge.theme.toLowerCase().includes(searchTerm.toLowerCase()) ||
    challenge.style.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-t-4 border-primary animate-spin"></div>
          <ListChecks className="absolute inset-0 m-auto h-10 w-10 text-primary/50" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div 
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <motion.h1 
            className="text-3xl md:text-4xl font-bold text-gradient-subtle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Poetry Challenges
          </motion.h1>
          <motion.p 
            className="text-gray-600 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Test your creativity with themed writing prompts
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Link to="/challenges/create">
            <Button className="btn-gradient rounded-full px-6 py-2 h-auto font-medium">
              <ListChecks className="h-4 w-4 mr-2" />
              Create Challenge
            </Button>
          </Link>
        </motion.div>
      </motion.div>

      <motion.div 
        className="relative z-10 group"
        ref={searchRef}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors duration-200" />
        <Input
          type="search"
          placeholder="Search challenges by title, description, theme or style..."
          className="search-modern w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </motion.div>

      <div className="grid gap-6">
        {filteredChallenges?.length === 0 ? (
          <motion.div 
            className="flex flex-col items-center justify-center py-16 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <ListChecks className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-xl font-medium text-gray-400">No challenges found</p>
            <p className="text-gray-500 mt-2">Try adjusting your search or create a new challenge</p>
          </motion.div>
        ) : (
          filteredChallenges?.map((challenge, index) => (
            <motion.div
              key={challenge.id}
              className="card-3d group perspective-1000 cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
            >
              <Link to={`/challenges/${challenge.id}`} className="block">
                <div className="glass-card p-6 h-full transform-preserve-3d">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-pink text-white">
                      <ListChecks className="h-8 w-8" />
                    </div>
                    
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold group-hover:text-primary transition-colors duration-300">
                        {challenge.title}
                      </h2>
                      
                      <p className="mt-2 text-gray-600 line-clamp-2">{challenge.description}</p>
                      
                      <div className="mt-4 flex flex-wrap gap-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Sparkles className="h-4 w-4 mr-1 text-primary/70" />
                          <span>Theme: {challenge.theme}</span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <Paintbrush className="h-4 w-4 mr-1 text-primary/70" />
                          <span>Style: {challenge.style}</span>
                        </div>
                        
                        {challenge.deadline && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-1 text-primary/70" />
                            <span>Deadline: {new Date(challenge.deadline).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
