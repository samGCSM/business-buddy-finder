
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MapHeaderProps {
  prospectCount: number;
  onBackClick: () => void;
}

const MapHeader = ({ prospectCount, onBackClick }: MapHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBackClick} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Prospects
        </Button>
        <h1 className="text-2xl font-bold">
          Prospect Map ({prospectCount} locations)
        </h1>
      </div>
    </div>
  );
};

export default MapHeader;
