import { Button } from "@/components/ui/button";
import { saveUsers } from "@/services/userService";
import type { User } from "@/types/user";
import { toast } from "@/hooks/use-toast";
import { UserTableHeader } from "./UserTableHeader";
import { UserTableRow } from "./UserTableRow";
import { formatDate, getNumericValue } from "./UserTableUtils";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

interface UserTableProps {
  users: User[];
  setUsers: (users: User[]) => void;
  setSelectedUserId: (id: string | null) => void;
}

export const UserTable = ({ users, setUsers, setSelectedUserId }: UserTableProps) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLatestUserData = async () => {
      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*');
        
        if (userError) throw userError;

        // Fetch user stats
        const { data: statsData, error: statsError } = await supabase
          .from('user_stats')
          .select('*');

        if (statsError) throw statsError;

        // Combine user data with stats
        const enrichedUsers = userData.map(user => ({
          ...user,
          stats: statsData.find(stat => stat.id === user.id)
        }));

        console.log('Enriched user data:', enrichedUsers);
        setUsers(enrichedUsers);
      } catch (error) {
        console.error('Error fetching latest user data:', error);
        toast({
          title: "Error",
          description: "Failed to fetch latest user data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatestUserData();

    const subscription = supabase
      .channel('users_channel')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'users' 
        }, 
        fetchLatestUserData
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [setUsers]);

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

  if (isLoading) {
    return <div className="flex justify-center items-center">Loading...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <UserTableHeader />
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <UserTableRow
                key={user.id}
                user={user}
                users={users}
                formatDate={formatDate}
                getNumericValue={getNumericValue}
                onDelete={handleDeleteUser}
                onChangePassword={setSelectedUserId}
                onUpdateUser={handleUpdateUser}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};