import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
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

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-gray-50">
          <BrowserRouter>
            <div className="flex">
              <Sidebar />
              <main className="flex-1 md:ml-64 pb-20 md:pb-0">
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
              </main>
            </div>
            <MobileNav />
            <Toaster />
          </BrowserRouter>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;