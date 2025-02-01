import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { uploadImage } from "@/utils/imageUpload";

export default function CreateWorkshop() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [duration, setDuration] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [qrCodeFile, setQrCodeFile] = useState<File | null>(null);
  const [meetingLink, setMeetingLink] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("Not authenticated");

      let qrCodeUrl = null;
      if (qrCodeFile && isPaid) {
        qrCodeUrl = await uploadImage(qrCodeFile, "workshop-payments", `qr-codes/${Date.now()}`);
        if (!qrCodeUrl) throw new Error("Failed to upload QR code");
      }

      const { error } = await supabase.from("workshops").insert({
        host_id: user.id,
        title,
        description,
        scheduled_at: date,
        duration: parseInt(duration),
        is_paid: isPaid,
        price: isPaid ? parseFloat(price) : null,
        max_participants: parseInt(maxParticipants),
        payment_qr_code_url: qrCodeUrl,
        meeting_link: meetingLink,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Workshop created successfully",
      });
      navigate("/workshops");
    } catch (error) {
      console.error("Create workshop error:", error);
      toast({
        title: "Error",
        description: "Failed to create workshop",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Create Workshop</h1>
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
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <Input
          type="number"
          placeholder="Duration (minutes)"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          required
        />
        <div className="flex items-center space-x-2">
          <Switch checked={isPaid} onCheckedChange={setIsPaid} />
          <span>Paid Workshop</span>
        </div>
        {isPaid && (
          <>
            <Input
              type="number"
              placeholder="Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
            <div className="space-y-2">
              <label className="block text-sm font-medium">Payment QR Code</label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setQrCodeFile(e.target.files?.[0] || null)}
                required={isPaid}
              />
            </div>
          </>
        )}
        <Input
          type="number"
          placeholder="Maximum Participants"
          value={maxParticipants}
          onChange={(e) => setMaxParticipants(e.target.value)}
          required
        />
        <Input
          type="url"
          placeholder="Meeting Link"
          value={meetingLink}
          onChange={(e) => setMeetingLink(e.target.value)}
          required
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Workshop"}
        </Button>
      </form>
    </div>
  );
}