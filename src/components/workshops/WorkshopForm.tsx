import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
  );
}