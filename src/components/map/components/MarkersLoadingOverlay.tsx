
import { Loader2 } from 'lucide-react';

const MarkersLoadingOverlay = () => {
  return (
    <div className="absolute inset-0 bg-black/30 flex justify-center items-center z-10 rounded-lg">
      <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium">Placing markers on map...</p>
      </div>
    </div>
  );
};

export default MarkersLoadingOverlay;
