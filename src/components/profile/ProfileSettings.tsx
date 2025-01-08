import { LogOut, Settings, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface ProfileSettingsProps {
  userId: string;
}

export const ProfileSettings = ({ userId }: ProfileSettingsProps) => {
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error);
      toast.error("Error logging out");
      return;
    }
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const handleDeleteAccount = async () => {
    try {
      console.log("Starting account deletion process");
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("No user found");
        toast.error("No user found");
        return;
      }

      // Delete likes first
      console.log("Deleting user likes");
      const { error: likesDeleteError } = await supabase
        .from('likes')
        .delete()
        .eq('user_id', user.id);

      if (likesDeleteError) {
        console.error("Error deleting likes:", likesDeleteError);
        toast.error("Failed to delete account");
        return;
      }

      // Delete comments
      console.log("Deleting user comments");
      const { error: commentsDeleteError } = await supabase
        .from('comments')
        .delete()
        .eq('user_id', user.id);

      if (commentsDeleteError) {
        console.error("Error deleting comments:", commentsDeleteError);
        toast.error("Failed to delete account");
        return;
      }

      // Delete shared posts
      console.log("Deleting shared posts");
      const { error: sharedPostsDeleteError } = await supabase
        .from('shared_posts')
        .delete()
        .eq('shared_by_user_id', user.id);

      if (sharedPostsDeleteError) {
        console.error("Error deleting shared posts:", sharedPostsDeleteError);
        toast.error("Failed to delete account");
        return;
      }

      // Delete temporary posts
      console.log("Deleting temporary posts");
      const { error: tempPostsDeleteError } = await supabase
        .from('temporary_posts')
        .delete()
        .eq('user_id', user.id);

      if (tempPostsDeleteError) {
        console.error("Error deleting temporary posts:", tempPostsDeleteError);
        toast.error("Failed to delete account");
        return;
      }

      // Delete posts
      console.log("Deleting user posts");
      const { error: postsDeleteError } = await supabase
        .from('posts')
        .delete()
        .eq('user_id', user.id);

      if (postsDeleteError) {
        console.error("Error deleting posts:", postsDeleteError);
        toast.error("Failed to delete account");
        return;
      }

      // Delete followers/following relationships
      console.log("Deleting follower relationships");
      const { error: followersDeleteError } = await supabase
        .from('followers')
        .delete()
        .or(`follower_id.eq.${user.id},followed_id.eq.${user.id}`);

      if (followersDeleteError) {
        console.error("Error deleting followers:", followersDeleteError);
        toast.error("Failed to delete account");
        return;
      }

      // Now delete the profile
      console.log("Deleting user profile");
      const { error: profileDeleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (profileDeleteError) {
        console.error("Error deleting profile:", profileDeleteError);
        toast.error("Failed to delete account");
        return;
      }

      // Sign out the user
      console.log("Signing out user");
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        console.error("Error signing out:", signOutError);
      }

      // Finally, delete the auth user
      console.log("Deleting auth user");
      const { error: authDeleteError } = await supabase.rpc('delete_auth_user');
      if (authDeleteError) {
        console.error("Error deleting auth user:", authDeleteError);
        toast.error("Failed to completely delete account");
        return;
      }

      console.log("Account deletion successful");
      toast.success("Account deleted successfully");
      navigate("/login");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account");
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setShowDeleteDialog(true)} 
            className="text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Delete Account</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove all your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};