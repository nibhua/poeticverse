
import { useQuery } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Search as SearchIcon, Users, Calendar, Clock, DollarSign, Tag } from "lucide-react";
import { motion } from "framer-motion";

export default function Workshops() {
  const [searchTerm, setSearchTerm] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const { data: workshops, isLoading } = useQuery({
    queryKey: ["workshops"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workshops")
        .select("*")
        .order("scheduled_at", { ascending: true });
      
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

  const filteredWorkshops = workshops?.filter(workshop =>
    workshop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workshop.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-t-4 border-primary animate-spin"></div>
          <Users className="absolute inset-0 m-auto h-10 w-10 text-primary/50" />
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
            Poetry Workshops
          </motion.h1>
          <motion.p 
            className="text-gray-600 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Learn, create, and connect with other poets
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Link to="/workshops/create">
            <Button className="btn-gradient rounded-full px-6 py-2 h-auto font-medium">
              <Users className="h-4 w-4 mr-2" />
              Create Workshop
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
          placeholder="Search workshops by title or description..."
          className="search-modern w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </motion.div>

      <div className="grid gap-6">
        {filteredWorkshops?.length === 0 ? (
          <motion.div 
            className="flex flex-col items-center justify-center py-16 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Users className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-xl font-medium text-gray-400">No workshops found</p>
            <p className="text-gray-500 mt-2">Try adjusting your search or create a new workshop</p>
          </motion.div>
        ) : (
          filteredWorkshops?.map((workshop, index) => (
            <motion.div
              key={workshop.id}
              className="card-3d group perspective-1000 cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
            >
              <Link to={`/workshops/${workshop.id}`} className="block">
                <div className="glass-card p-6 h-full transform-preserve-3d">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-blue text-white">
                      <Users className="h-8 w-8" />
                    </div>
                    
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold group-hover:text-primary transition-colors duration-300">
                        {workshop.title}
                      </h2>
                      
                      <p className="mt-2 text-gray-600 line-clamp-2">{workshop.description}</p>
                      
                      <div className="mt-4 flex flex-wrap gap-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-1 text-primary/70" />
                          <span>{new Date(workshop.scheduled_at).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-1 text-primary/70" />
                          <span>{workshop.duration} minutes</span>
                        </div>
                        
                        {workshop.is_paid ? (
                          <div className="flex items-center text-sm text-gray-600">
                            <DollarSign className="h-4 w-4 mr-1 text-primary/70" />
                            <span>${workshop.price}</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-sm text-gray-600">
                            <Tag className="h-4 w-4 mr-1 text-green-500" />
                            <span className="text-green-600 font-medium">Free</span>
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
