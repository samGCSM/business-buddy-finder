import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

interface User {
  id: string;
  email: string;
  type: 'admin' | 'user';
}

const Users = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([
    { id: '1', email: 'admin@example.com', type: 'admin' },
    { id: '2', email: 'user@example.com', type: 'user' },
  ]);
  const [newUserEmail, setNewUserEmail] = useState('');

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      id: (users.length + 1).toString(),
      email: newUserEmail,
      type: 'user',
    };
    setUsers([...users, newUser]);
    setNewUserEmail('');
    toast({
      title: "Success",
      description: "User added successfully",
    });
  };

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter(user => user.id !== id));
    toast({
      title: "Success",
      description: "User deleted successfully",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Manage Users</h2>
            <Button variant="outline" onClick={() => navigate('/')}>
              Back to Search
            </Button>
          </div>

          <form onSubmit={handleAddUser} className="space-y-4">
            <div className="flex gap-4">
              <Input
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="Enter user email"
                required
              />
              <Button type="submit">Add User</Button>
            </div>
          </form>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {user.type !== 'admin' && (
                        <Button
                          variant="destructive"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          Delete
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;