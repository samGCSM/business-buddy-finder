import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { saveUsers } from "@/services/userService";
import type { User } from "@/types/user";

interface AddUserFormProps {
  users: User[];
  setUsers: (users: User[]) => void;
}

export const AddUserForm = ({ users, setUsers }: AddUserFormProps) => {
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserFullName, setNewUserFullName] = useState("");

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      id: users.length + 1,
      email: newUserEmail,
      password: newUserPassword,
      full_name: newUserFullName,
      type: "user",
      lastLogin: null,
      totalSearches: 0,
      savedSearches: 0,
    };
    try {
      console.log('Adding new user:', newUser);
      const updatedUsers = [...users, newUser];
      await saveUsers(updatedUsers);
      setUsers(updatedUsers);
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserFullName("");
      toast({
        title: "Success",
        description: "User added successfully",
      });
    } catch (error) {
      console.error('Error adding user:', error);
      toast({
        title: "Error",
        description: "Failed to add user",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleAddUser} className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <Input
          type="email"
          value={newUserEmail}
          onChange={(e) => setNewUserEmail(e.target.value)}
          placeholder="Enter user email"
          required
        />
        <Input
          type="password"
          value={newUserPassword}
          onChange={(e) => setNewUserPassword(e.target.value)}
          placeholder="Enter user password"
          required
        />
        <Input
          type="text"
          value={newUserFullName}
          onChange={(e) => setNewUserFullName(e.target.value)}
          placeholder="Enter full name"
        />
      </div>
      <Button type="submit">Add User</Button>
    </form>
  );
};