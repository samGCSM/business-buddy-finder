import type { User } from "@/types/user";
import { UserTableHeader } from "./UserTableHeader";
import { UserTableRow } from "./UserTableRow";
import { formatDate, getNumericValue } from "./UserTableUtils";
import { useUserData } from "@/hooks/useUserData";
import { useUserActions } from "./UserActions";
import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

interface UserTableProps {
  users: User[];
  setUsers: (users: User[]) => void;
  setSelectedUserId: (id: string | null) => void;
  userRole?: string | null;
  userId?: number | null;
}

type SortField = 'email' | 'full_name' | 'type' | 'lastLogin' | 'totalSearches' | 'savedSearches' | 'totalProspects';
type SortDirection = 'asc' | 'desc';
type LoginFilter = 'all' | 'recent' | 'inactive' | 'never';

export const UserTable = ({ users, setUsers, setSelectedUserId, userRole = 'admin', userId }: UserTableProps) => {
  const { isLoading } = useUserData(setUsers);
  const { handleDeleteUser, handleReassignAndDelete, handleUpdateUser } = useUserActions(users, setUsers);
  const [sortField, setSortField] = useState<SortField>('email');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [loginFilter, setLoginFilter] = useState<LoginFilter>('all');
  
  const isSupervisor = userRole === 'supervisor';

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedUsers = useMemo(() => {
    // First filter the users based on supervisor relationship if applicable
    let filtered = [...users];
    
    // If logged in as supervisor, only show team members
    if (isSupervisor && userId) {
      filtered = filtered.filter(user => user.supervisor_id === userId);
    }
    
    if (loginFilter !== 'all') {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      filtered = filtered.filter(user => {
        if (loginFilter === 'never') {
          return !user.lastLogin;
        } else if (loginFilter === 'recent') {
          return user.lastLogin && new Date(user.lastLogin) >= oneDayAgo;
        } else if (loginFilter === 'inactive') {
          return user.lastLogin && new Date(user.lastLogin) < sevenDaysAgo;
        }
        return true;
      });
    }

    // Then sort the users
    return filtered.sort((a, b) => {
      let valueA, valueB;

      // Handle special cases for stats
      if (sortField === 'totalProspects') {
        valueA = a.stats?.total_prospects || 0;
        valueB = b.stats?.total_prospects || 0;
      } else {
        valueA = a[sortField] || '';
        valueB = b[sortField] || '';
      }

      // Convert to appropriate types for comparison
      if (sortField === 'lastLogin') {
        valueA = valueA ? new Date(valueA).getTime() : 0;
        valueB = valueB ? new Date(valueB).getTime() : 0;
      } else if (sortField === 'totalSearches' || sortField === 'savedSearches' || sortField === 'totalProspects') {
        valueA = typeof valueA === 'number' ? valueA : 0;
        valueB = typeof valueB === 'number' ? valueB : 0;
      } else {
        valueA = String(valueA).toLowerCase();
        valueB = String(valueB).toLowerCase();
      }

      // Compare based on sort direction
      if (sortDirection === 'asc') {
        return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
      } else {
        return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
      }
    });
  }, [users, sortField, sortDirection, loginFilter, isSupervisor, userId]);

  if (isLoading) {
    return <div className="flex justify-center items-center">Loading...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center">
            <span className="mr-2 text-sm font-medium">Login Status:</span>
            <Select value={loginFilter} onValueChange={(value) => setLoginFilter(value as LoginFilter)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by login" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="recent">Recent Login (24h)</SelectItem>
                <SelectItem value="inactive">Inactive (7d+)</SelectItem>
                <SelectItem value="never">Never Logged In</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center">
            <span className="mr-2 text-sm font-medium">Sort by:</span>
            <Select value={sortField} onValueChange={(value) => setSortField(value as SortField)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full_name">Full Name</SelectItem>
                {!isSupervisor && <SelectItem value="type">Role</SelectItem>}
                <SelectItem value="lastLogin">Last Login</SelectItem>
                <SelectItem value="totalSearches">Searches (30d)</SelectItem>
                <SelectItem value="savedSearches">Saved Searches</SelectItem>
                <SelectItem value="totalProspects">Total Prospects</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
            className="flex items-center gap-1"
          >
            <ArrowUpDown className="h-4 w-4" />
            {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
          </Button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <UserTableHeader 
            onSort={handleSort} 
            sortField={sortField} 
            sortDirection={sortDirection}
            isSupervisor={isSupervisor}
          />
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedUsers.map((user) => (
              <UserTableRow
                key={user.id}
                user={user}
                users={users}
                formatDate={formatDate}
                getNumericValue={getNumericValue}
                onDelete={handleDeleteUser}
                onReassignAndDelete={handleReassignAndDelete}
                onChangePassword={() => setSelectedUserId(user.id.toString())}
                onUpdateUser={handleUpdateUser}
                isSupervisor={isSupervisor}
                currentUserId={userId}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
