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
    <div className="pb-20">
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            className="pl-10"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {results.map((profile) => (
          <Link
            key={profile.username}
            to={`/profile/${profile.username}`}
            className="flex items-center p-4 hover:bg-gray-50"
          >
            <Avatar className="h-12 w-12 mr-4">
              <AvatarImage src={profile.profile_pic_url} />
              <AvatarFallback>{profile.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold">{profile.username}</div>
              <div className="text-sm text-gray-500">{profile.full_name}</div>
            </div>
          </Link>
        ))}
      </div>

      <BottomNav />
    </div>
  );
};

export default Search;