import { Button } from "@/components/ui/button";
import { saveUsers } from "@/services/userService";
import type { User } from "@/types/user";
import { toast } from "@/hooks/use-toast";
import { UserTableHeader } from "./UserTableHeader";
import { UserTableRow } from "./UserTableRow";
import { formatDate, getNumericValue } from "./UserTableUtils";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

interface UserTableProps {
  users: User[];
  setUsers: (users: User[]) => void;
  setSelectedUserId: (id: string | null) => void;
}

export const UserTable = ({ users, setUsers, setSelectedUserId }: UserTableProps) => {
  useEffect(() => {
    const fetchLatestUserData = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*');
        
        if (error) {
          throw error;
        }

        if (data) {
          console.log('Latest user data from Supabase:', data);
          // Transform the data to ensure proper typing
          const transformedUsers = data.map(user => ({
            id: user.id,
            email: user.email || '',
            type: user.type || 'user',
            password: user.password || '',
            lastLogin: user.lastLogin || null,
            totalSearches: typeof user.totalSearches === 'number' ? user.totalSearches : 0,
            savedSearches: typeof user.savedSearches === 'number' ? user.savedSearches : 0
          }));
          setUsers(transformedUsers);
        }
      } catch (error) {
        console.error('Error fetching latest user data:', error);
        toast({
          title: "Error",
          description: "Failed to fetch latest user data",
          variant: "destructive",
        });
      }
    };

    fetchLatestUserData();
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

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <UserTableHeader />
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <UserTableRow
              key={user.id}
              user={user}
              formatDate={formatDate}
              getNumericValue={getNumericValue}
              onDelete={handleDeleteUser}
              onChangePassword={setSelectedUserId}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};