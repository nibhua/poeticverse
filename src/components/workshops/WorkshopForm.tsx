import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface WorkshopFormProps {
  onSubmit: (formData: {
    title: string;
    description: string;
    date: string;
    duration: string;
    isPaid: boolean;
    price: string;
    maxParticipants: string;
    qrCodeFile: File | null;
    meetingLink: string;
  }) => void;
  isLoading: boolean;
}

export function WorkshopForm({ onSubmit, isLoading }: WorkshopFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [duration, setDuration] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [qrCodeFile, setQrCodeFile] = useState<File | null>(null);
  const [meetingLink, setMeetingLink] = useState("");

  const validateForm = () => {
    if (!title.trim()) {
      toast.error("Please enter a workshop title");
      return false;
    }
    if (!description.trim()) {
      toast.error("Please enter a workshop description");
      return false;
    }
    if (!date) {
      toast.error("Please select a date and time");
      return false;
    }
    if (!duration || parseInt(duration) <= 0) {
      toast.error("Please enter a valid duration");
      return false;
    }
    if (isPaid) {
      if (!price || parseFloat(price) <= 0) {
        toast.error("Please enter a valid price");
        return false;
      }
      if (!qrCodeFile) {
        toast.error("Please upload a payment QR code");
        return false;
      }
    }
    if (!maxParticipants || parseInt(maxParticipants) <= 0) {
      toast.error("Please enter a valid number of maximum participants");
      return false;
    }
    if (!meetingLink.trim()) {
      toast.error("Please enter a meeting link");
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) {
      console.log("Form submission prevented - already loading");
      return;
    }

    console.log("Validating form data...");
    if (!validateForm()) {
      return;
    }

    console.log("Form validation passed, submitting...");
    onSubmit({
      title,
      description,
      date,
      duration,
      isPaid,
      price,
      maxParticipants,
      qrCodeFile,
      meetingLink,
    });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              placeholder="Workshop Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="Workshop Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Date and Time</label>
            <Input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              disabled={isLoading}
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
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch 
              checked={isPaid} 
              onCheckedChange={setIsPaid}
              disabled={isLoading}
            />
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
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Payment QR Code</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setQrCodeFile(e.target.files?.[0] || null)}
                  required={isPaid}
                  disabled={isLoading}
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
              disabled={isLoading}
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
              disabled={isLoading}
            />
            <p className="text-sm text-muted-foreground">
              This will only be visible to approved participants
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating Workshop...
              </span>
            ) : (
              "Create Workshop"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}