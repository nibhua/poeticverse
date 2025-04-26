import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { uploadImage } from "@/utils/imageUpload";
import { UserRound, X } from "lucide-react";

const Signup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    fullName: "",
  });
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);
  const [passwordValid, setPasswordValid] = useState({
    length: false,
    uppercase: false,
    number: false,
  });

  const handleProfilePicSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePic(file);
      setProfilePicPreview(URL.createObjectURL(file));
    }
  };

  const removeProfilePic = () => {
    setProfilePic(null);
    setProfilePicPreview(null);
  };

  const validatePassword = (password: string) => {
    setPasswordValid({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
    });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!passwordValid.length || !passwordValid.uppercase || !passwordValid.number) {
      toast.error("Password must be at least 8 characters long, contain one uppercase letter, and one number.");
      setLoading(false);
      return;
    }

    try {
      const { error: signUpError, data } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username,
            full_name: formData.fullName,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (profilePic && data.user) {
        const profilePicUrl = await uploadImage(
          profilePic,
          "user-images",
          `profiles/${data.user.id}`
        );

        if (profilePicUrl) {
          const { error: updateError } = await supabase
            .from("profiles")
            .update({ profile_pic_url: profilePicUrl })
            .eq("id", data.user.id);

          if (updateError) throw updateError;
        }
      }

      toast.success("Successfully signed up! Please check your email to verify your account.");
      navigate("/login");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Create an account</h2>
          <p className="mt-2 text-gray-600">Join our community today</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSignup}>
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
            <Input
              type="text"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />
            <Input
              type="email"
              placeholder="Email address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
                validatePassword(e.target.value);
              }}
              required
            />
            <div className="text-sm text-gray-600">
              <p className={passwordValid.length ? "text-green-600" : "text-red-600"}>• At least 8 characters</p>
              <p className={passwordValid.uppercase ? "text-green-600" : "text-red-600"}>• At least one uppercase letter</p>
              <p className={passwordValid.number ? "text-green-600" : "text-red-600"}>• At least one number</p>
            </div>
          </div>
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Sign up"}
          </Button>
          <p className="text-center text-sm text-gray-600">
            Already have an account? {" "}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
