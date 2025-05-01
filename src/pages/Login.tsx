
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { User, Mail, Lock } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw new Error(error.message);

      toast.success("Successfully logged in!");
      navigate("/");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
      });
      if (error) throw new Error(error.message);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error("Google login failed: " + error.message);
      } else {
        toast.error("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-white to-purple-50">
      <motion.div 
        className="max-w-md w-full perspective-1000"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="glass-card p-8 transform-preserve-3d">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <motion.div 
              className="flex justify-center mb-4"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 400 }}
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/30 to-purple-400/30 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
            </motion.div>
            
            <h2 className="text-3xl font-bold text-gradient-subtle mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to continue to Poeticverse</p>
          </motion.div>
          
          <form className="mt-8 space-y-5" onSubmit={handleLogin}>
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 rounded-xl search-modern"
                  required
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 rounded-xl search-modern"
                  required
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Button 
                className="w-full h-12 btn-gradient rounded-xl font-medium"
                type="submit" 
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <Button
                className="w-full h-12 mt-4 bg-white border border-gray-200 text-gray-800 hover:bg-gray-100 rounded-xl font-medium flex items-center justify-center"
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <img src="/google-icon.svg" alt="Google" className="w-5 h-5 mr-2" />
                {loading ? "Signing in with Google..." : "Sign in with Google"}
              </Button>
            </motion.div>

            <motion.div 
              className="text-center text-sm text-gray-600 mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <p>
                Don't have an account?{" "}
                <Link to="/signup" className="font-medium text-primary hover:text-primary/80 transition-colors duration-200">
                  Sign up
                </Link>
              </p>
              <div className="flex justify-center space-x-4 mt-4">
                <Link to="/privacy-policy" className="text-gray-500 hover:text-gray-700 transition-colors duration-200">
                  Privacy Policy
                </Link>
                <Link to="/contact" className="text-gray-500 hover:text-gray-700 transition-colors duration-200">
                  Contact Us
                </Link>
              </div>
            </motion.div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
