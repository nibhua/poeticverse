import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/gif"];

export const uploadImage = async (
  file: File,
  bucket: string,
  path: string
): Promise<string | null> => {
  if (!file) {
    toast.error("Please select an image to upload");
    return null;
  }

  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    toast.error("Please upload a valid image file (JPEG, PNG, or GIF)");
    return null;
  }

  if (file.size > MAX_FILE_SIZE) {
    toast.error("File size must be less than 5MB");
    return null;
  }

  try {
    const fileExt = file.name.split(".").pop();
    const filePath = `${path}/${Date.now()}.${fileExt}`;

    const { error: uploadError, data } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error: any) {
    console.error("Error uploading image:", error);
    toast.error("Failed to upload image");
    return null;
  }
};