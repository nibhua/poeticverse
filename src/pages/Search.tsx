
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Search as SearchIcon, User, BookOpen, Headphones, Users, Trophy, ListChecks } from "lucide-react";

type SearchResult = {
  type: 'profile' | 'post' | 'book' | 'audio' | 'workshop' | 'competition' | 'challenge';
  id: string;
  title?: string;
  username?: string;
  profile_pic_url?: string;
  description?: string;
  content?: string;
  cover_image_url?: string;
};

export default function Search() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  // Debounce search term
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  // Search profiles
  const { data: profileResults, isLoading: profilesLoading } = useQuery({
    queryKey: ["search-profiles", debouncedSearchTerm],
    queryFn: async () => {
      if (!debouncedSearchTerm) return [];
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .ilike("username", `%${debouncedSearchTerm}%`)
        .limit(5);
      
      if (error) throw error;
      return data.map(profile => ({
        type: 'profile' as const,
        id: profile.id,
        username: profile.username,
        profile_pic_url: profile.profile_pic_url,
        description: profile.bio
      }));
    },
    enabled: Boolean(debouncedSearchTerm) && (selectedCategory === "all" || selectedCategory === "profiles")
  });

  // Search books
  const { data: bookResults, isLoading: booksLoading } = useQuery({
    queryKey: ["search-books", debouncedSearchTerm],
    queryFn: async () => {
      if (!debouncedSearchTerm) return [];
      const { data, error } = await supabase
        .from("poetry_books")
        .select("*")
        .or(`title.ilike.%${debouncedSearchTerm}%, description.ilike.%${debouncedSearchTerm}%`)
        .limit(5);
      
      if (error) throw error;
      return data.map(book => ({
        type: 'book' as const,
        id: book.id,
        title: book.title,
        description: book.description,
        cover_image_url: book.cover_image_url
      }));
    },
    enabled: Boolean(debouncedSearchTerm) && (selectedCategory === "all" || selectedCategory === "books")
  });

  // Search audio poems
  const { data: audioResults, isLoading: audioLoading } = useQuery({
    queryKey: ["search-audio", debouncedSearchTerm],
    queryFn: async () => {
      if (!debouncedSearchTerm) return [];
      const { data, error } = await supabase
        .from("audio_poems")
        .select("*")
        .or(`title.ilike.%${debouncedSearchTerm}%, description.ilike.%${debouncedSearchTerm}%`)
        .limit(5);
      
      if (error) throw error;
      return data.map(audio => ({
        type: 'audio' as const,
        id: audio.id,
        title: audio.title,
        description: audio.description
      }));
    },
    enabled: Boolean(debouncedSearchTerm) && (selectedCategory === "all" || selectedCategory === "audio")
  });

  // Search workshops
  const { data: workshopResults, isLoading: workshopsLoading } = useQuery({
    queryKey: ["search-workshops", debouncedSearchTerm],
    queryFn: async () => {
      if (!debouncedSearchTerm) return [];
      const { data, error } = await supabase
        .from("workshops")
        .select("*")
        .or(`title.ilike.%${debouncedSearchTerm}%, description.ilike.%${debouncedSearchTerm}%`)
        .limit(5);
      
      if (error) throw error;
      return data.map(workshop => ({
        type: 'workshop' as const,
        id: workshop.id,
        title: workshop.title,
        description: workshop.description
      }));
    },
    enabled: Boolean(debouncedSearchTerm) && (selectedCategory === "all" || selectedCategory === "workshops")
  });

  // Search competitions
  const { data: competitionResults, isLoading: competitionsLoading } = useQuery({
    queryKey: ["search-competitions", debouncedSearchTerm],
    queryFn: async () => {
      if (!debouncedSearchTerm) return [];
      const { data, error } = await supabase
        .from("competitions")
        .select("*")
        .or(`title.ilike.%${debouncedSearchTerm}%, description.ilike.%${debouncedSearchTerm}%`)
        .limit(5);
      
      if (error) throw error;
      return data.map(competition => ({
        type: 'competition' as const,
        id: competition.id,
        title: competition.title,
        description: competition.description
      }));
    },
    enabled: Boolean(debouncedSearchTerm) && (selectedCategory === "all" || selectedCategory === "competitions")
  });

  // Search challenges
  const { data: challengeResults, isLoading: challengesLoading } = useQuery({
    queryKey: ["search-challenges", debouncedSearchTerm],
    queryFn: async () => {
      if (!debouncedSearchTerm) return [];
      const { data, error } = await supabase
        .from("challenges")
        .select("*")
        .or(`title.ilike.%${debouncedSearchTerm}%, description.ilike.%${debouncedSearchTerm}%`)
        .limit(5);
      
      if (error) throw error;
      return data.map(challenge => ({
        type: 'challenge' as const,
        id: challenge.id,
        title: challenge.title,
        description: challenge.description
      }));
    },
    enabled: Boolean(debouncedSearchTerm) && (selectedCategory === "all" || selectedCategory === "challenges")
  });

  // Combine all search results
  useEffect(() => {
    let combinedResults: SearchResult[] = [];
    
    if (profileResults && (selectedCategory === "all" || selectedCategory === "profiles")) {
      combinedResults = [...combinedResults, ...profileResults];
    }
    
    if (bookResults && (selectedCategory === "all" || selectedCategory === "books")) {
      combinedResults = [...combinedResults, ...bookResults];
    }
    
    if (audioResults && (selectedCategory === "all" || selectedCategory === "audio")) {
      combinedResults = [...combinedResults, ...audioResults];
    }
    
    if (workshopResults && (selectedCategory === "all" || selectedCategory === "workshops")) {
      combinedResults = [...combinedResults, ...workshopResults];
    }
    
    if (competitionResults && (selectedCategory === "all" || selectedCategory === "competitions")) {
      combinedResults = [...combinedResults, ...competitionResults];
    }
    
    if (challengeResults && (selectedCategory === "all" || selectedCategory === "challenges")) {
      combinedResults = [...combinedResults, ...challengeResults];
    }
    
    setSearchResults(combinedResults);
  }, [
    profileResults, 
    bookResults, 
    audioResults, 
    workshopResults, 
    competitionResults, 
    challengeResults,
    selectedCategory
  ]);

  const isLoading = profilesLoading || booksLoading || audioLoading || workshopsLoading || competitionsLoading || challengesLoading;

  const renderSearchResult = (result: SearchResult) => {
    switch (result.type) {
      case 'profile':
        return (
          <Link to={`/profile/${result.username}`} className="block">
            <motion.div 
              className="glass-card p-4 transform-preserve-3d"
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={result.profile_pic_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {result.username ? result.username[0].toUpperCase() : "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{result.username}</div>
                  {result.description && <p className="text-sm text-gray-500 line-clamp-1">{result.description}</p>}
                </div>
              </div>
            </motion.div>
          </Link>
        );
        
      case 'book':
        return (
          <Link to={`/books/${result.id}`} className="block">
            <motion.div 
              className="glass-card p-4 transform-preserve-3d"
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-md flex items-center justify-center overflow-hidden">
                  {result.cover_image_url ? (
                    <img src={result.cover_image_url} alt={result.title} className="w-full h-full object-cover" />
                  ) : (
                    <BookOpen className="h-6 w-6 text-primary/60" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{result.title}</div>
                  {result.description && <p className="text-sm text-gray-500 line-clamp-1">{result.description}</p>}
                </div>
              </div>
            </motion.div>
          </Link>
        );
        
      case 'audio':
        return (
          <Link to={`/audio-library`} className="block">
            <motion.div 
              className="glass-card p-4 transform-preserve-3d"
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-100 to-green-100 rounded-md flex items-center justify-center">
                  <Headphones className="h-6 w-6 text-primary/60" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{result.title}</div>
                  {result.description && <p className="text-sm text-gray-500 line-clamp-1">{result.description}</p>}
                </div>
              </div>
            </motion.div>
          </Link>
        );
        
      case 'workshop':
        return (
          <Link to={`/workshops/${result.id}`} className="block">
            <motion.div 
              className="glass-card p-4 transform-preserve-3d"
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-100 to-yellow-100 rounded-md flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary/60" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{result.title}</div>
                  {result.description && <p className="text-sm text-gray-500 line-clamp-1">{result.description}</p>}
                </div>
              </div>
            </motion.div>
          </Link>
        );
        
      case 'competition':
        return (
          <Link to={`/competitions/${result.id}`} className="block">
            <motion.div 
              className="glass-card p-4 transform-preserve-3d"
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-md flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-primary/60" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{result.title}</div>
                  {result.description && <p className="text-sm text-gray-500 line-clamp-1">{result.description}</p>}
                </div>
              </div>
            </motion.div>
          </Link>
        );
        
      case 'challenge':
        return (
          <Link to={`/challenges/${result.id}`} className="block">
            <motion.div 
              className="glass-card p-4 transform-preserve-3d"
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-md flex items-center justify-center">
                  <ListChecks className="h-6 w-6 text-primary/60" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{result.title}</div>
                  {result.description && <p className="text-sm text-gray-500 line-clamp-1">{result.description}</p>}
                </div>
              </div>
            </motion.div>
          </Link>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        className="flex flex-col space-y-2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h1
          className="text-3xl font-bold text-gradient-subtle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Search
        </motion.h1>
        <motion.p
          className="text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Discover poetry, books, and people
        </motion.p>
      </motion.div>

      <motion.div
        className="relative group"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors duration-200" />
        <Input
          type="search"
          placeholder="Search for people, poems, books, events..."
          className="search-modern pl-12 h-14 text-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <Tabs defaultValue="all" onValueChange={setSelectedCategory}>
          <TabsList className="w-full justify-start overflow-x-auto hide-scrollbar p-1 mb-4">
            <TabsTrigger value="all" className="px-4">All</TabsTrigger>
            <TabsTrigger value="profiles" className="px-4">Profiles</TabsTrigger>
            <TabsTrigger value="books" className="px-4">Books</TabsTrigger>
            <TabsTrigger value="audio" className="px-4">Audio</TabsTrigger>
            <TabsTrigger value="workshops" className="px-4">Workshops</TabsTrigger>
            <TabsTrigger value="competitions" className="px-4">Competitions</TabsTrigger>
            <TabsTrigger value="challenges" className="px-4">Challenges</TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>

      {!debouncedSearchTerm ? (
        <motion.div
          className="flex flex-col items-center justify-center py-16 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <SearchIcon className="h-16 w-16 text-gray-300 mb-4" />
          <p className="text-xl font-medium text-gray-400">Start typing to search</p>
          <p className="text-gray-500 mt-2">Search for profiles, books, audio, and more</p>
        </motion.div>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-t-4 border-primary animate-spin"></div>
            <SearchIcon className="absolute inset-0 m-auto h-8 w-8 text-primary/50" />
          </div>
        </div>
      ) : searchResults.length === 0 ? (
        <motion.div
          className="flex flex-col items-center justify-center py-16 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <SearchIcon className="h-16 w-16 text-gray-300 mb-4" />
          <p className="text-xl font-medium text-gray-400">No results found</p>
          <p className="text-gray-500 mt-2">Try a different search term or category</p>
        </motion.div>
      ) : (
        <motion.div
          className="space-y-4"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          initial="hidden"
          animate="show"
        >
          <AnimatePresence>
            {searchResults.map((result) => (
              <motion.div
                key={`${result.type}-${result.id}`}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  show: { opacity: 1, y: 0 }
                }}
                exit={{ opacity: 0, y: -10 }}
                className="card-3d group perspective-1000"
              >
                {renderSearchResult(result)}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
