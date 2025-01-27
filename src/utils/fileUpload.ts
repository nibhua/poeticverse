import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_PDF_TYPES = ["application/pdf"];

export const uploadPDF = async (
  file: File,
  bucket: string = "books"
): Promise<string | null> => {
  if (!file) {
    toast({
      title: "Error",
      description: "Please select a PDF file to upload",
      variant: "destructive",
    });
    return null;
  }

  if (!ALLOWED_PDF_TYPES.includes(file.type)) {
    toast({
      title: "Error",
      description: "Please upload a valid PDF file",
      variant: "destructive",
    });
    return null;
  }

  if (file.size > MAX_FILE_SIZE) {
    toast({
      title: "Error",
      description: "File size must be less than 10MB",
      variant: "destructive",
    });
    return null;
  }

  try {
    const fileExt = file.name.split(".").pop();
    const filePath = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

    const { error: uploadError, data } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error: any) {
    console.error("Error uploading PDF:", error);
    toast({
      title: "Error",
      description: "Failed to upload PDF file",
      variant: "destructive",
    });
    return null;
  }
};