import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    let retryTimeout: NodeJS.Timeout;

    const checkSession = async () => {
      try {
        console.log("Checking initial session state...");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          throw error;
        }

        if (session && isMounted) {
          console.log("Active session found, redirecting to home");
          navigate("/");
          return;
        }

        console.log("No active session found");
      } catch (error) {
        console.error("Session check failed:", error);
        if (isMounted && retryCount < MAX_RETRIES) {
          console.log(`Retrying session check... Attempt ${retryCount + 1} of ${MAX_RETRIES}`);
          setRetryCount(prev => prev + 1);
          retryTimeout = setTimeout(checkSession, RETRY_DELAY);
        } else {
          console.log("Max retries reached or critical error in session check");
          toast.error("Failed to verify session. Please try again.");
        }
      } finally {
        if (isMounted) {
          setInitialCheckDone(true);
        }
      }
    };

    checkSession();

    return () => {
      isMounted = false;
      clearTimeout(retryTimeout);
    };
  }, [navigate, retryCount]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    console.log("Attempting login for email:", email);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error);
        throw error;
      }
      
      console.log("Login successful, redirecting...");
      toast.success("Successfully logged in!");
      navigate("/");
    } catch (error: any) {
      console.error("Login failed:", error);
      toast.error(error.message || "Failed to log in");
    } finally {
      setLoading(false);
    }
  };

  if (!initialCheckDone) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">
            {retryCount > 0 ? `Checking session... (${retryCount}/${MAX_RETRIES})` : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
          <p className="mt-2 text-gray-600">Please sign in to your account</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <Button 
            className="w-full relative" 
            type="submit" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>

          <p className="text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link 
              to="/signup" 
              className="font-medium text-blue-600 hover:text-blue-500"
              tabIndex={loading ? -1 : 0}
            >
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;