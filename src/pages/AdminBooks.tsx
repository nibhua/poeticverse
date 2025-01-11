import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const AdminBooks = () => {
  const navigate = useNavigate();
  
  const { data: books, isLoading } = useQuery({
    queryKey: ['admin-books'],
    queryFn: async () => {
      console.log("Fetching admin books");
      const { data, error } = await supabase
        .from('poetry_books')
        .select(`
          *,
          profiles:user_id (username, profile_pic_url)
        `)
        .eq('is_admin_content', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="sticky top-0 bg-white border-b p-4 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold flex-1">Admin Books</h1>
          <Button
            onClick={() => navigate('/books/create')}
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Add Book
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4">
        {books?.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            No admin books available yet
          </div>
        ) : (
          <div className="grid gap-4">
            {books?.map((book) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm border p-4"
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
                      <span className="text-xs text-gray-500">
                        {book.rental_count} rentals
                      </span>
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

export default AdminBooks;