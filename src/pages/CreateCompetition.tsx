import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export default function CreateCompetition() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [prizeDescription, setPrizeDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("competitions").insert({
        title,
        description,
        category,
        start_date: startDate,
        end_date: endDate,
        prize_description: prizeDescription,
        created_by: user.id,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Competition created successfully",
      });
      navigate("/competitions");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create competition",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Create Competition</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <Textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <Input
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        />
        <Input
          type="datetime-local"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />
        <Input
          type="datetime-local"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          required
        />
        <Textarea
          placeholder="Prize Description"
          value={prizeDescription}
          onChange={(e) => setPrizeDescription(e.target.value)}
          required
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Competition"}
        </Button>
      </form>
    </div>
  );
}