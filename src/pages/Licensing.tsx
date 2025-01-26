import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export default function Licensing() {
  const { data: licenses, isLoading } = useQuery({
    queryKey: ["licenses"],
    queryFn: async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("licenses")
        .select("*")
        .or(`requester_id.eq.${user.id},owner_id.eq.${user.id}`);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Licensing</h1>
      <div className="grid gap-4">
        {licenses?.map((license) => (
          <div key={license.id} className="p-4 border rounded-lg">
            <h2 className="font-semibold">License Request</h2>
            <p>Purpose: {license.purpose}</p>
            <p>Status: {license.status}</p>
            {license.price && <p>Price: ${license.price}</p>}
            <div className="mt-2">
              <Button variant="outline">View Details</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}