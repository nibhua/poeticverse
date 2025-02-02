import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { uploadImage } from "@/utils/imageUpload";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

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
    
    if (isPaid && !qrCodeFile) {
      toast({
        title: "Error",
        description: "Please upload a payment QR code for paid workshops",
        variant: "destructive",
      });
      return;
    }

    if (!meetingLink) {
      toast({
        title: "Error",
        description: "Please provide a meeting link",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error("Auth error:", userError);
        toast({
          title: "Error",
          description: "Please log in to create a workshop",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      console.log("Creating workshop for user:", user.id);

      let qrCodeUrl = null;
      if (qrCodeFile && isPaid) {
        console.log("Uploading QR code...");
        qrCodeUrl = await uploadImage(qrCodeFile, "workshop-payments", `qr-codes/${Date.now()}`);
        if (!qrCodeUrl) {
          throw new Error("Failed to upload QR code");
        }
        console.log("QR code uploaded successfully:", qrCodeUrl);
      }

      const { error: workshopError } = await supabase.from("workshops").insert({
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
        status: 'scheduled',
      });

      if (workshopError) {
        console.error("Workshop creation error:", workshopError);
        throw workshopError;
      }

      console.log("Workshop created successfully");
      
      toast({
        title: "Success",
        description: "Workshop created successfully",
      });
      navigate("/workshops");
    } catch (error: any) {
      console.error("Create workshop error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create workshop. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <div className="mb-6 flex items-center">
        <Button 
          variant="ghost" 
          className="mr-4"
          onClick={() => navigate("/workshops")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Workshops
        </Button>
      </div>
      <Card>
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold mb-6">Create Workshop</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                placeholder="Workshop Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Workshop Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date and Time</label>
              <Input
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Duration (minutes)</label>
              <Input
                type="number"
                placeholder="Duration in minutes"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
                min="1"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch checked={isPaid} onCheckedChange={setIsPaid} />
              <span className="text-sm font-medium">Paid Workshop</span>
            </div>

            {isPaid && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price</label>
                  <Input
                    type="number"
                    placeholder="Workshop Price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Payment QR Code</label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setQrCodeFile(e.target.files?.[0] || null)}
                    required={isPaid}
                  />
                  <p className="text-sm text-muted-foreground">
                    Upload a QR code for payment (required for paid workshops)
                  </p>
                </div>
              </>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Maximum Participants</label>
              <Input
                type="number"
                placeholder="Maximum number of participants"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
                required
                min="1"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Meeting Link</label>
              <Input
                type="url"
                placeholder="Meeting Link (Zoom, Google Meet, etc.)"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                required
              />
              <p className="text-sm text-muted-foreground">
                This will only be visible to approved participants
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Workshop"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}