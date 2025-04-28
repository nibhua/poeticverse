
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState("");
  const [subject, setSubject] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send this to your backend
    console.log({ name, email, message });
    toast({
      title: "Message sent!",
      description: "We'll get back to you as soon as possible.",
    });
    setName("");
    setEmail("");
    setMessage("");
  };

  const handleFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ subject, feedback, email });
    toast({
      title: "Feedback submitted!",
      description: "Thank you for helping us improve.",
    });
    setSubject("");
    setFeedback("");
    setEmail("");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Contact Us</h1>
      
      <Tabs defaultValue="contact" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>
        
        <TabsContent value="contact" className="space-y-4">
          <p className="text-gray-600">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                Message
              </label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                className="mt-1"
                rows={4}
              />
            </div>
            
            <Button type="submit" className="w-full">
              Send Message
            </Button>
          </form>
        </TabsContent>
        
        <TabsContent value="feedback" className="space-y-4">
          <p className="text-gray-600">
            We value your feedback! Let us know how we can improve our services.
          </p>
          
          <form onSubmit={handleFeedback} className="space-y-4">
            <div>
              <label htmlFor="feedback-email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                id="feedback-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                Subject
              </label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            
            <div>
              <label htmlFor="feedback" className="block text-sm font-medium text-gray-700">
                Feedback
              </label>
              <Textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                required
                className="mt-1"
                rows={4}
              />
            </div>
            
            <Button type="submit" className="w-full">
              Submit Feedback
            </Button>
          </form>
        </TabsContent>
      </Tabs>

      <div className="mt-8 pt-8 border-t">
        <h2 className="text-lg font-semibold">Other Ways to Reach Us</h2>
        <div className="mt-4 space-y-3">
          <p className="text-gray-600">
            <strong>Email:</strong> support@poeticverse.com
          </p>
          <p className="text-gray-600">
            <strong>Hours:</strong> Monday - Friday, 9am - 5pm EST
          </p>
          <p className="text-gray-600">
            <strong>Address:</strong> 123 Poetry Lane, Literary City, PC 12345
          </p>
          <p className="text-gray-600">
            <strong>Social Media:</strong> @poeticverse on Twitter, Instagram, and Facebook
          </p>
        </div>
      </div>
    </div>
  );
}
