import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface BusinessSearchFormProps {
  onSearch: (location: string, keyword: string) => void;
  isLoading: boolean;
  initialLocation?: string;
  initialKeyword?: string;
}

const BusinessSearchForm = ({ onSearch, isLoading, initialLocation = "", initialKeyword = "" }: BusinessSearchFormProps) => {
  const [location, setLocation] = useState(initialLocation);
  const [keyword, setKeyword] = useState(initialKeyword);

  useEffect(() => {
    setLocation(initialLocation);
    setKeyword(initialKeyword);
  }, [initialLocation, initialKeyword]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (location && keyword) {
      onSearch(location, keyword);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="location" className="text-sm font-medium">
            Location
          </label>
          <Input
            id="location"
            placeholder="Enter location..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="keyword" className="text-sm font-medium">
            Business Type
          </label>
          <Input
            id="keyword"
            placeholder="Enter business type..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            required
          />
        </div>
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Searching..." : "Search"}
      </Button>
    </form>
  );
};

export default BusinessSearchForm;