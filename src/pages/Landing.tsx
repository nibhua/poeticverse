import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-100 px-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Welcome to Textiverse</h1>
        <p className="text-lg text-gray-600 mb-8">
          Connect with friends, share your thoughts, and discover amazing content from around the world.
        </p>
        <div className="space-x-4">
          <Button asChild>
            <Link to="/login">Login</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/signup">Sign Up</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Landing;