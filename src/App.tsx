
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
import AudioLibrary from "@/pages/AudioLibrary";
import CreateAudio from "@/pages/CreateAudio";
import Licensing from "@/pages/Licensing";
import Workshops from "@/pages/Workshops";
import CreateWorkshop from "@/pages/CreateWorkshop";
import WorkshopDetails from "@/pages/WorkshopDetails";
import Competitions from "@/pages/Competitions";
import CreateCompetition from "@/pages/CreateCompetition";
import CompetitionDetails from "@/pages/CompetitionDetails";
import Challenges from "@/pages/Challenges";
import CreateChallenge from "@/pages/CreateChallenge";
import ChallengeDetails from "@/pages/ChallengeDetails";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/ui/Navbar";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider defaultOpen={false}>
          <div className="min-h-screen flex w-full bg-background">
            <BrowserRouter>
              <Navbar />
              <div className="flex w-full relative">
                {user && <AppSidebar />} {/* Sidebar only if logged in */}
                <main className="flex-1 transition-all duration-200 ease-in-out relative z-0">
                  <div className="max-w-[600px] mx-auto px-6 py-8 w-full">
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

                      {/* Books routes */}
                      <Route path="/books" element={<Books />} />
                      <Route path="/books/create" element={<CreateBook />} />
                      <Route path="/books/admin" element={<AdminBooks />} />
                      <Route path="/books/:id" element={<BookDetails />} />

                      {/* Audio Library routes */}
                      <Route path="/audio-library" element={<AudioLibrary />} />
                      <Route path="/audio-library/create" element={<CreateAudio />} />

                      {/* Licensing routes */}
                      <Route path="/licensing" element={<Licensing />} />

                      {/* Workshops routes */}
                      <Route path="/workshops" element={<Workshops />} />
                      <Route path="/workshops/create" element={<CreateWorkshop />} />
                      <Route path="/workshops/:id" element={<WorkshopDetails />} />

                      {/* Competitions routes */}
                      <Route path="/competitions" element={<Competitions />} />
                      <Route path="/competitions/create" element={<CreateCompetition />} />
                      <Route path="/competitions/:id" element={<CompetitionDetails />} />

                      {/* Challenges routes */}
                      <Route path="/challenges" element={<Challenges />} />
                      <Route path="/challenges/create" element={<CreateChallenge />} />
                      <Route path="/challenges/:id" element={<ChallengeDetails />} />
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
