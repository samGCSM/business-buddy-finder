
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { getUsers, getCurrentUser } from "@/services/userService";
import type { User } from "@/types/user";
import PasswordChangeForm from "@/components/auth/PasswordChangeForm";
import { UserTable } from "@/components/users/UserTable";
import { AddUserForm } from "@/components/users/AddUserForm";
import Header from "@/components/layout/Header";
import { useUserState } from "@/hooks/useUserState";

const Users = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { userRole, userId } = useUserState();

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const loadedUsers = await getUsers();
        setUsers(loadedUsers);
        
        // Get current user info
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('Error loading users:', error);
        toast({
          title: "Error",
          description: "Failed to load users",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadUsers();
  }, []);

  useEffect(() => {
    // Redirect regular users away from this page
    if (!isLoading && userRole === 'user') {
      navigate('/');
      toast({
        title: "Access Denied",
        description: "You don't have permission to view this page",
        variant: "destructive",
      });
    }
  }, [isLoading, userRole, navigate]);

  const handleLogout = async () => {
    try {
      localStorage.removeItem('currentUser');
      navigate("/login");
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  const isAdmin = userRole === 'admin';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header isAdmin={isAdmin} onLogout={handleLogout} />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">
            {isAdmin ? 'Manage Users' : 'My Team Members'}
          </h2>
          
          {/* Only show the Add User form for admins */}
          {isAdmin && <AddUserForm users={users} setUsers={setUsers} />}
          
          <UserTable 
            users={users} 
            setUsers={setUsers}
            setSelectedUserId={setSelectedUserId}
            userRole={userRole}
            userId={userId}
          />

          {selectedUserId && isAdmin && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                <PasswordChangeForm
                  userId={selectedUserId}
                  onClose={() => setSelectedUserId(null)}
                  isAdmin={true}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Users;
