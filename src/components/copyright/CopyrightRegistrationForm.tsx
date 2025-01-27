import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { uploadPDF } from "@/utils/fileUpload";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CopyrightFormData {
  title: string;
  description: string;
  workType: string;
  creationDate: string;
  file?: FileList;
}

export function CopyrightRegistrationForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<CopyrightFormData>();

  const onSubmit = async (data: CopyrightFormData) => {
    try {
      setIsSubmitting(true);
      
      let fileUrl = null;
      if (data.file?.[0]) {
        fileUrl = await uploadPDF(data.file[0]);
        if (!fileUrl) return;
      }

      const { data: session } = await supabase.auth.getSession();
      if (!session?.user) {
        toast({
          title: "Error",
          description: "You must be logged in to register a copyright",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("licenses").insert({
        content_type: data.workType,
        purpose: "copyright_registration",
        content_id: crypto.randomUUID(),
        requester_id: session.user.id,
        status: "pending",
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Copyright registration submitted successfully",
      });

      form.reset();
    } catch (error) {
      console.error("Error submitting copyright registration:", error);
      toast({
        title: "Error",
        description: "Failed to submit copyright registration",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title of Work</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter the title of your work" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Describe your work"
                  className="min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="workType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type of Work</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type of work" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="book">Book</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="artwork">Artwork</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="creationDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date of Creation</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="file"
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem>
              <FormLabel>Upload Work (PDF)</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => onChange(e.target.files)}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Register Copyright"}
        </Button>
      </form>
    </Form>
  );
}