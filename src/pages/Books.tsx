
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Settings, Search as SearchIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Books = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div>
      <header className="sticky top-0 bg-white border-b p-4 z-10">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Poetry Books</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/books/admin')}
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate('/books/create')}
              className="flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Add Book
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4">
        <div className="relative mb-4">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search books..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {filteredBooks?.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            No poetry books available matching your search
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredBooks?.map((book) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm border p-4 cursor-pointer"
                onClick={() => navigate(`/books/${book.id}`)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-20 h-28 bg-gray-100 rounded-md overflow-hidden">
                    {book.cover_image_url ? (
                      <img
                        src={book.cover_image_url}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Cover
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{book.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">
                      by {book.profiles.username}
                    </p>
                    {book.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {book.description}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                        {book.genre || "Uncategorized"}
                      </span>
                      {book.content_type === 'rental' && (
                        <>
                          <span className="text-xs text-gray-500">
                            ${book.rental_price} / rental
                          </span>
                          <span className="text-xs text-gray-500">
                            {book.rental_count} rentals
                          </span>
                        </>
                      )}
                      {book.content_type === 'free' && (
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                          Free
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Books;
