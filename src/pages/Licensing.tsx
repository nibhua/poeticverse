import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, FileText, Clock, DollarSign } from "lucide-react";

export default function Licensing() {
  const { data: licenses, isLoading } = useQuery({
    queryKey: ["licenses"],
    queryFn: async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("licenses")
        .select(`
          *,
          requester:requester_id(id, username),
          owner:owner_id(id, username)
        `)
        .or(`requester_id.eq.${user.id},owner_id.eq.${user.id}`)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-[200px]">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Licensing</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Register Copyright
        </Button>
      </div>

      <Tabs defaultValue="requests" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="requests">License Requests</TabsTrigger>
          <TabsTrigger value="copyrights">My Copyrights</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="mt-6">
          <div className="grid gap-4">
            {licenses?.map((license) => (
              <Card key={license.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      License Request from {license.requester?.username}
                    </h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p className="flex items-center">
                        <FileText className="mr-2 h-4 w-4" />
                        Purpose: {license.purpose}
                      </p>
                      <p className="flex items-center">
                        <Clock className="mr-2 h-4 w-4" />
                        Requested: {new Date(license.created_at).toLocaleDateString()}
                      </p>
                      {license.price && (
                        <p className="flex items-center">
                          <DollarSign className="mr-2 h-4 w-4" />
                          Offered Price: ${license.price}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-x-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    {license.status === "pending" && (
                      <>
                        <Button variant="default" size="sm">
                          Accept
                        </Button>
                        <Button variant="destructive" size="sm">
                          Decline
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="copyrights">
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="mx-auto h-12 w-12 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Copyrighted Works Yet</h3>
            <p className="mb-4">Start by registering your poems for copyright protection.</p>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Register New Copyright
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="transactions">
          <div className="text-center py-8 text-muted-foreground">
            <DollarSign className="mx-auto h-12 w-12 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Transactions Yet</h3>
            <p>Your licensing transactions will appear here.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}