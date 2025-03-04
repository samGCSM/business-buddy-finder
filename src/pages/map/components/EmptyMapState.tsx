
import { Button } from "@/components/ui/button";

interface EmptyMapStateProps {
  onReturnClick: () => void;
}

const EmptyMapState = ({ onReturnClick }: EmptyMapStateProps) => {
  return (
    <div className="bg-white p-8 rounded-lg shadow flex flex-col items-center justify-center">
      <p className="text-lg text-gray-600 mb-4">No prospects with addresses found to display on the map.</p>
      <Button onClick={onReturnClick}>Return to Prospects</Button>
    </div>
  );
};

export default EmptyMapState;
