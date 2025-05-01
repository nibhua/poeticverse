
import { useQuery } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Settings, Search as SearchIcon, BookOpen, User, Tag, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Books = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  
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
  
  const { data: books, isLoading } = useQuery({
    queryKey: ['poetry-books'],
    queryFn: async () => {
      console.log("Fetching poetry books");
      const { data, error } = await supabase
        .from('poetry_books')
        .select(`
          *,
          profiles:user_id (username, profile_pic_url)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching books:", error);
        throw error;
      }

      return data;
    },
  });

  const filteredBooks = books?.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.genre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.profiles.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-t-4 border-primary animate-spin"></div>
          <BookOpen className="absolute inset-0 m-auto h-10 w-10 text-primary/50" />
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
            Poetry Books
          </motion.h1>
          <motion.p 
            className="text-gray-600 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Explore our collection of poetry publications
          </motion.p>
        </div>
        
        <div className="flex gap-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/books/admin')}
              className="rounded-full h-10 w-10"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Button
              className="btn-gradient rounded-full px-6 py-2 h-auto font-medium"
              onClick={() => navigate('/books/create')}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Book
            </Button>
          </motion.div>
        </div>
      </motion.div>

      <motion.div 
        className="relative z-10 group"
        ref={searchRef}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors duration-200" />
        <Input
          type="search"
          placeholder="Search books by title, author, genre or description..."
          className="search-modern w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </motion.div>

      <div className="grid gap-6">
        {filteredBooks?.length === 0 ? (
          <motion.div 
            className="flex flex-col items-center justify-center py-16 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <BookOpen className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-xl font-medium text-gray-400">No books found</p>
            <p className="text-gray-500 mt-2">Try adjusting your search or add a new book</p>
          </motion.div>
        ) : (
          filteredBooks?.map((book, index) => (
            <motion.div
              key={book.id}
              className="card-3d cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
              onClick={() => navigate(`/books/${book.id}`)}
            >
              <div className="glass-card overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="relative w-full md:w-40 h-40 md:h-auto bg-gradient-to-br from-purple-100 to-blue-100">
                    {book.cover_image_url ? (
                      <img
                        src={book.cover_image_url}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="h-16 w-16 text-gray-300" />
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6 flex-1">
                    <div className="flex flex-col md:flex-row gap-2 md:items-center justify-between">
                      <h2 className="text-2xl font-bold hover:text-primary transition-colors duration-300">
                        {book.title}
                      </h2>
                      
                      {book.genre && (
                        <div className="px-3 py-1 rounded-full bg-purple-100 text-primary text-xs font-medium">
                          {book.genre}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center mt-2">
                      <User className="h-3 w-3 mr-1 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        by {book.profiles.username}
                      </span>
                    </div>
                    
                    {book.description && (
                      <p className="mt-3 text-gray-600 line-clamp-2">
                        {book.description}
                      </p>
                    )}
                    
                    <div className="mt-4 flex flex-wrap gap-3">
                      {book.content_type === 'free' && (
                        <div className="flex items-center text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                          <Tag className="h-3 w-3 mr-1" />
                          <span>Free</span>
                        </div>
                      )}
                      
                      {book.content_type === 'rental' && (
                        <div className="flex items-center text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                          <DollarSign className="h-3 w-3 mr-1" />
                          <span>${book.rental_price} / rental</span>
                        </div>
                      )}
                      
                      {book.rental_count > 0 && (
                        <div className="flex items-center text-xs text-gray-500">
                          <span>{book.rental_count} rentals</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

export default Books;
