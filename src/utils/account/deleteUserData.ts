import { supabase } from "@/integrations/supabase/client";
import { deleteLikes } from "./operations/deleteLikes";
import { deleteComments } from "./operations/deleteComments";
import { deleteSharedPosts } from "./operations/deleteSharedPosts";
import { deleteTemporaryPosts } from "./operations/deleteTemporaryPosts";
import { deletePosts } from "./operations/deletePosts";
import { deleteFollowers } from "./operations/deleteFollowers";
import { deleteProfile } from "./operations/deleteProfile";

export const deleteUserData = async (userId: string) => {
  console.log("Starting account deletion process");

  try {
    await deleteLikes(userId);
    await deleteComments(userId);
    await deleteSharedPosts(userId);
    await deleteTemporaryPosts(userId);
    await deletePosts(userId);
    await deleteFollowers(userId);
    await deleteProfile(userId);
  } catch (error) {
    console.error("Error in deleteUserData:", error);
    throw error;
  }
};