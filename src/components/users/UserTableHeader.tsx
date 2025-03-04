
import { ArrowDown, ArrowUp } from "lucide-react";

type SortField = 'email' | 'full_name' | 'type' | 'lastLogin' | 'totalSearches' | 'savedSearches' | 'totalProspects';
type SortDirection = 'asc' | 'desc';

interface UserTableHeaderProps {
  onSort?: (field: SortField) => void;
  sortField?: SortField;
  sortDirection?: SortDirection;
  isSupervisor?: boolean; // Added prop to adapt header for supervisor view
}

export const UserTableHeader = ({ onSort, sortField, sortDirection, isSupervisor = false }: UserTableHeaderProps) => {
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-3 w-3 ml-1 inline" /> 
      : <ArrowDown className="h-3 w-3 ml-1 inline" />;
  };
  
  const renderSortableHeader = (field: SortField, label: string) => (
    <th 
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
      onClick={() => onSort && onSort(field)}
    >
      <div className="flex items-center">
        {label}
        {renderSortIcon(field)}
      </div>
    </th>
  );

  return (
    <thead className="bg-gray-50">
      <tr>
        {renderSortableHeader('email', 'Email')}
        {renderSortableHeader('full_name', 'Full Name')}
        {!isSupervisor && renderSortableHeader('type', 'Type')}
        {!isSupervisor && (
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Supervisor
          </th>
        )}
        {renderSortableHeader('lastLogin', 'Last Login')}
        {renderSortableHeader('totalSearches', 'Searches (30d)')}
        {renderSortableHeader('savedSearches', 'Saved Searches')}
        {renderSortableHeader('totalProspects', 'Total Prospects')}
        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
          Actions
        </th>
      </tr>
    </thead>
  );
};
