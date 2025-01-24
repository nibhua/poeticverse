import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Index from "@/pages/Index";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Search from "@/pages/Search";
import Profile from "@/pages/Profile";
import EditProfile from "@/pages/EditProfile";
import CreatePost from "@/pages/CreatePost";
import Books from "@/pages/Books";
import CreateBook from "@/pages/CreateBook";
import AdminBooks from "@/pages/AdminBooks";
import BookDetails from "@/pages/BookDetails";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Increase stale time to reduce refetches
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider defaultOpen={false}>
          <div className="min-h-screen flex w-full bg-background">
            <BrowserRouter>
              <div className="flex w-full">
                <AppSidebar />
                <main className="flex-1 transition-all duration-200 ease-in-out">
                  <div className="max-w-[600px] mx-auto px-4 py-6 w-full">
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/landing" element={<Landing />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/signup" element={<Signup />} />
                      <Route path="/search" element={<Search />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/profile/:username" element={<Profile />} />
                      <Route path="/profile/:username/edit" element={<EditProfile />} />
                      <Route path="/create-post" element={<CreatePost />} />
                      <Route path="/books" element={<Books />} />
                      <Route path="/books/create" element={<CreateBook />} />
                      <Route path="/books/admin" element={<AdminBooks />} />
                      <Route path="/books/:id" element={<BookDetails />} />
                    </Routes>
                  </div>
                </main>
              </div>
              <Toaster />
            </BrowserRouter>
          </div>
        </SidebarProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;