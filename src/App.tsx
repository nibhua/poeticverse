import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Search from "./pages/Search";
import CreatePost from "./pages/CreatePost";

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-gray-50">
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route
                path="/"
                element={session ? <Index /> : <Navigate to="/landing" />}
              />
              <Route
                path="/landing"
                element={!session ? <Landing /> : <Navigate to="/" />}
              />
              <Route
                path="/login"
                element={!session ? <Login /> : <Navigate to="/" />}
              />
              <Route
                path="/signup"
                element={!session ? <Signup /> : <Navigate to="/" />}
              />
              <Route
                path="/profile/:username"
                element={session ? <Profile /> : <Navigate to="/login" />}
              />
              <Route
                path="/profile/:username/edit"
                element={session ? <EditProfile /> : <Navigate to="/login" />}
              />
              <Route
                path="/search"
                element={session ? <Search /> : <Navigate to="/login" />}
              />
              <Route
                path="/create"
                element={session ? <CreatePost /> : <Navigate to="/login" />}
              />
            </Routes>
          </BrowserRouter>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;