
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useIsMobile } from "@/hooks/use-mobile";
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
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import Contact from "@/pages/Contact";

// Configure QueryClient with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Protected route wrapper that checks for authentication
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-t-4 border-primary animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Public only routes (redirect to home if logged in)
const PublicOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-t-4 border-primary animate-spin"></div>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {
  const [user, setUser] = useState(null);
  const isMobile = useIsMobile();

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
        <SidebarProvider defaultOpen={!isMobile}>
          <div className="min-h-screen flex w-full bg-gradient-to-br from-white to-purple-50 overflow-x-hidden">
            <BrowserRouter>
              <Navbar />
              <div className="flex w-full relative">
                {user && !isMobile && <AppSidebar />}
                <main className="flex-1 transition-all duration-200 ease-in-out relative z-0 pt-16 max-w-full overflow-x-hidden">
                  <div className="w-full px-2 py-4 sm:py-6 mx-auto max-w-[600px] overflow-x-hidden">
                    <Routes>
                      {/* Public routes */}
                      <Route path="/landing" element={<Landing />} />
                      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                      <Route path="/contact" element={<Contact />} />
                      
                      {/* Routes only for non-authenticated users */}
                      <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
                      <Route path="/signup" element={<PublicOnlyRoute><Signup /></PublicOnlyRoute>} />
                      
                      {/* Protected routes */}
                      <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                      <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
                      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                      <Route path="/profile/:username" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                      <Route path="/profile/:username/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
                      <Route path="/create-post" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />

                      <Route path="/books" element={<ProtectedRoute><Books /></ProtectedRoute>} />
                      <Route path="/books/create" element={<ProtectedRoute><CreateBook /></ProtectedRoute>} />
                      <Route path="/books/admin" element={<ProtectedRoute><AdminBooks /></ProtectedRoute>} />
                      <Route path="/books/:id" element={<ProtectedRoute><BookDetails /></ProtectedRoute>} />

                      <Route path="/audio-library" element={<ProtectedRoute><AudioLibrary /></ProtectedRoute>} />
                      <Route path="/audio-library/create" element={<ProtectedRoute><CreateAudio /></ProtectedRoute>} />

                      <Route path="/licensing" element={<ProtectedRoute><Licensing /></ProtectedRoute>} />

                      <Route path="/workshops" element={<ProtectedRoute><Workshops /></ProtectedRoute>} />
                      <Route path="/workshops/create" element={<ProtectedRoute><CreateWorkshop /></ProtectedRoute>} />
                      <Route path="/workshops/:id" element={<ProtectedRoute><WorkshopDetails /></ProtectedRoute>} />

                      <Route path="/competitions" element={<ProtectedRoute><Competitions /></ProtectedRoute>} />
                      <Route path="/competitions/create" element={<ProtectedRoute><CreateCompetition /></ProtectedRoute>} />
                      <Route path="/competitions/:id" element={<ProtectedRoute><CompetitionDetails /></ProtectedRoute>} />

                      <Route path="/challenges" element={<ProtectedRoute><Challenges /></ProtectedRoute>} />
                      <Route path="/challenges/create" element={<ProtectedRoute><CreateChallenge /></ProtectedRoute>} />
                      <Route path="/challenges/:id" element={<ProtectedRoute><ChallengeDetails /></ProtectedRoute>} />
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
