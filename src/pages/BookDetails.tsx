import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, BookOpen, Clock } from "lucide-react";
import { motion } from "framer-motion";

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: book, isLoading } = useQuery({
    queryKey: ['book', id],
    queryFn: async () => {
      console.log("Fetching book details for:", id);
      const { data, error } = await supabase
        .from('poetry_books')
        .select(`
          *,
          profiles:user_id (username, profile_pic_url)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const handleRentBook = async () => {
    try {
      // Here we would implement the rental logic
      // For now, just show a toast
      toast({
        title: "Coming Soon",
        description: "Book rental functionality will be available soon!",
      });
    } catch (error) {
      console.error("Error renting book:", error);
      toast({
        title: "Error",
        description: "Failed to rent book. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-semibold mb-4">Book not found</h1>
        <Button onClick={() => navigate('/books')}>Back to Books</Button>
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
          <h1 className="text-xl font-semibold">Book Details</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm overflow-hidden"
        >
          {book.cover_image_url && (
            <img
              src={book.cover_image_url}
              alt={book.title}
              className="w-full h-48 object-cover"
            />
          )}

          <div className="p-6">
            <h1 className="text-2xl font-semibold mb-2">{book.title}</h1>
            <p className="text-gray-600 text-sm mb-4">
              By {book.profiles.username}
            </p>

            {book.description && (
              <p className="text-gray-700 mb-6">{book.description}</p>
            )}

            <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                <span>{book.genre || "Uncategorized"}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{new Date(book.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            {book.content_type === 'rental' && (
              <div className="mb-6">
                <p className="text-sm font-semibold mb-1">Rental Price</p>
                <p className="text-lg">${book.rental_price}</p>
              </div>
            )}

            {book.content_type === 'rental' && (
              <Button
                onClick={handleRentBook}
                className="w-full"
              >
                Rent Book
              </Button>
            )}

            {book.content_type === 'free' && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="font-semibold mb-4">Preview Content</h2>
                <p className="whitespace-pre-wrap text-gray-700">{book.content}</p>
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default BookDetails;