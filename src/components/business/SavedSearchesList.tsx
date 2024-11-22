import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Business } from "@/types/business";

interface SavedSearch {
  id: string;
  date: string;
  location: string;
  keyword: string;
  results: Business[];
}

interface SavedSearchesListProps {
  savedSearches: SavedSearch[];
  onLoadSearch: (search: SavedSearch) => void;
  onBackToSearch: () => void;
  onExport: () => void;
}

const SavedSearchesList = ({ savedSearches, onLoadSearch, onBackToSearch, onExport }: SavedSearchesListProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Saved Searches</h3>
        <Button variant="outline" onClick={onBackToSearch}>
          Back to Search
        </Button>
      </div>
      {savedSearches.length === 0 ? (
        <p className="text-gray-500">No saved searches found.</p>
      ) : (
        <div className="grid gap-4">
          {savedSearches.map((search) => (
            <div
              key={search.id}
              className="bg-white p-4 rounded-lg shadow space-y-2"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">
                    {search.location} - {search.keyword}
                  </p>
                  <p className="text-sm text-gray-500">
                    Saved on: {search.date}
                  </p>
                </div>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => onLoadSearch(search)}
                  >
                    View Results
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onExport}
                  >
                    Export
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedSearchesList;