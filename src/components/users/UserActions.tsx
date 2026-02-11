import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types/user";
import { saveUsers } from "@/services/userService";
import { getUsers } from "@/services/userService";

export const useUserActions = (users: User[], setUsers: (users: User[]) => void) => {
  const handleDeleteUser = async (id: number) => {
    try {
      const updatedUsers = users.filter((user) => user.id !== id);
      await saveUsers(updatedUsers);
      setUsers(updatedUsers);
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const handleReassignAndDelete = async (userId: number, reassignToId: number | null) => {
    try {
      // Reassign prospects if needed
      if (reassignToId) {
        const { error: reassignError } = await supabase
          .from('prospects')
          .update({ user_id: reassignToId })
          .eq('user_id', userId);
        if (reassignError) throw reassignError;
      }

      // Clean up related data
      await supabase.from('territories').delete().eq('user_id', userId);
      await supabase.from('saved_searches').delete().eq('user_id', userId);
      await supabase.from('notifications').delete().eq('user_id', userId);
      await supabase.from('ai_insights').delete().eq('user_id', userId);
      await supabase.from('user_insights_tracking').delete().eq('user_id', userId);

      // Delete the user
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);
      if (deleteError) throw deleteError;

      // Refresh user list
      const refreshed = await getUsers();
      setUsers(refreshed);

      toast({
        title: "Success",
        description: "User deleted and prospects reassigned successfully",
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const handleUpdateUser = async (id: number, updates: Partial<User>) => {
    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User updated successfully",
      });
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
    }
  };

  return {
    handleDeleteUser,
    handleReassignAndDelete,
    handleUpdateUser
  };
};