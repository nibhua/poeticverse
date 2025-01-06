import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BottomNav } from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";
import { toast } from "sonner";

interface Profile {
  username: string;
  full_name: string;
  profile_pic_url: string;
}

const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<Profile[]>([]);

  useEffect(() => {
    const searchProfiles = async () => {
      if (searchTerm.length < 2) {
        setResults([]);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("username, full_name, profile_pic_url")
          .ilike("username", `%${searchTerm}%`)
          .limit(10);

        if (error) throw error;
        setResults(data || []);
      } catch (error: any) {
        toast.error(error.message);
      }
    };

    const timeoutId = setTimeout(searchProfiles, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      {/* Sticky top search bar */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
        <div className="relative max-w-md mx-auto">
          <SearchIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            className="pl-10"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Results container */}
      <div className="max-w-md mx-auto mt-4 px-4">
        {/* Wrap results in a card-like container */}
        <div className="bg-white rounded shadow-sm divide-y divide-gray-200">
          {results.map((profile) => (
            <Link
              key={profile.username}
              to={`/profile/${profile.username}`}
              className="flex items-center p-4 hover:bg-gray-50"
            >
              <Avatar className="h-12 w-12 mr-4">
                <AvatarImage src={profile.profile_pic_url} />
                <AvatarFallback>
                  {profile.username[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold leading-tight">
                  {profile.username}
                </div>
                <div className="text-sm text-gray-500">
                  {profile.full_name}
                </div>
              </div>
            </Link>
          ))}
          {/* Show a message if no results and searchTerm is at least 2 chars */}
          {results.length === 0 && searchTerm.length >= 2 && (
            <div className="p-4 text-gray-500 text-center">No users found</div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Search;
