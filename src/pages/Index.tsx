
import { useQuery } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { Clock, Heart, MessageCircle, Share2, MoreHorizontal, Image as ImageIcon, UserRound, Send } from "lucide-react";

export default function Index() {
  const [selectedTab, setSelectedTab] = useState<"following" | "discover">("following");
  
  const { data: posts, isLoading } = useQuery({
    queryKey: ["home-posts", selectedTab],
    queryFn: async () => {
      let query = supabase
        .from("posts")
        .select(`
          *,
          profiles:user_id (username, profile_pic_url)
        `)
        .order("created_at", { ascending: false });
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const { data: temporaryPosts } = useQuery({
    queryKey: ["temporary-posts"],
    queryFn: async () => {
      // Get current time to check against expiry
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from("temporary_posts")
        .select(`
          *,
          profiles:user_id (username, profile_pic_url)
        `)
        .gt("expires_at", now)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const tabVariants = {
    active: { 
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 } 
    },
    inactive: { 
      opacity: 0.5, 
      y: 5,
      transition: { duration: 0.3 } 
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-t-4 border-primary animate-spin"></div>
          <Send className="absolute inset-0 m-auto h-10 w-10 text-primary/50" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Story/Temporary Posts Row */}
      {temporaryPosts && temporaryPosts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="overflow-x-auto hide-scrollbar">
            <div className="flex space-x-3 py-2 px-1 min-w-max">
              <Link to="/create-post" className="flex-shrink-0">
                <motion.div 
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-200 transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-2xl text-gray-400">+</span>
                </motion.div>
                <p className="text-xs text-center mt-1 text-gray-600">Add Story</p>
              </Link>
              
              {temporaryPosts.map((post, index) => (
                <div key={post.id} className="flex-shrink-0">
                  <motion.div
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 p-1 cursor-pointer"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="w-full h-full rounded-full bg-white overflow-hidden">
                      {post.image_url ? (
                        <img 
                          src={post.image_url} 
                          alt="Story" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                          <UserRound className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                  <p className="text-xs text-center mt-1 truncate max-w-16 md:max-w-20">{post.profiles.username}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab Selection */}
      <motion.div 
        className="flex space-x-8 border-b"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <motion.button
          className={`px-4 py-2 relative font-medium ${selectedTab === "following" ? "text-primary" : "text-gray-500"}`}
          onClick={() => setSelectedTab("following")}
          variants={tabVariants}
          animate={selectedTab === "following" ? "active" : "inactive"}
        >
          Following
          {selectedTab === "following" && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              layoutId="tabIndicator"
            />
          )}
        </motion.button>
        <motion.button
          className={`px-4 py-2 relative font-medium ${selectedTab === "discover" ? "text-primary" : "text-gray-500"}`}
          onClick={() => setSelectedTab("discover")}
          variants={tabVariants}
          animate={selectedTab === "discover" ? "active" : "inactive"}
        >
          Discover
          {selectedTab === "discover" && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              layoutId="tabIndicator"
            />
          )}
        </motion.button>
      </motion.div>

      {/* Posts */}
      {posts?.length === 0 ? (
        <motion.div 
          className="flex flex-col items-center justify-center py-16 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Send className="h-16 w-16 text-gray-300 mb-4" />
          <p className="text-xl font-medium text-gray-400">No posts yet</p>
          <p className="text-gray-500 mt-2">Follow users or create a post to see content here</p>
          <Button className="mt-6 btn-gradient rounded-full" asChild>
            <Link to="/create-post">Create Post</Link>
          </Button>
        </motion.div>
      ) : (
        <motion.div 
          className="grid gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {posts?.map((post) => (
            <motion.div
              key={post.id}
              className="card-3d group perspective-1000"
              variants={itemVariants}
            >
              <div className="glass-card p-4 transform-preserve-3d">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={post.profiles?.profile_pic_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {post.profiles?.username ? post.profiles.username[0].toUpperCase() : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Link to={`/profile/${post.profiles?.username}`} className="font-medium hover:text-primary transition-colors duration-200">
                        {post.profiles?.username}
                      </Link>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(post.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <button className="text-gray-500 hover:text-gray-700 transition-colors">
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="mt-3">
                  {post.content_type === "text" && post.content_text && (
                    <p className="text-gray-800 whitespace-pre-wrap">{post.content_text}</p>
                  )}
                  
                  {post.content_type === "image" && post.image_url && (
                    <div className="space-y-3">
                      {post.caption && <p className="text-gray-800">{post.caption}</p>}
                      <div className="rounded-xl overflow-hidden bg-gray-100 mt-2">
                        <img 
                          src={post.image_url} 
                          alt="Post" 
                          className="w-full h-auto object-cover" 
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex space-x-4">
                    <button className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors">
                      <Heart className="h-5 w-5" />
                      <span className="text-sm">0</span>
                    </button>
                    <button className="flex items-center space-x-1 text-gray-500 hover:text-primary transition-colors">
                      <MessageCircle className="h-5 w-5" />
                      <span className="text-sm">0</span>
                    </button>
                    <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors">
                      <Share2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
