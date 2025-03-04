
import { Loader2 } from 'lucide-react';

const MapLoader = () => {
  return (
    <div className="flex justify-center items-center h-full min-h-[400px]">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p>Loading map...</p>
      </div>
    </div>
  );
};

export default MapLoader;
