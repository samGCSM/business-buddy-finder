
import Header from "@/components/layout/Header";
import MapView from "@/components/map/MapView";
import RoutePlanner from "@/components/map/components/RoutePlanner";
import { useMapbox } from "@/components/map/hooks/useMapbox";
import { useProspectMapData } from "./map/hooks/useProspectMapData";
import MapFilterControls from "./map/components/MapFilterControls";
import MapHeader from "./map/components/MapHeader";
import EmptyMapState from "./map/components/EmptyMapState";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const ProspectMap = () => {
  const {
    filteredProspects,
    territories,
    userRole,
    selectedTerritory,
    setSelectedTerritory,
    searchTerm,
    setSearchTerm,
    isLoading,
    handleLogout,
    navigate
  } = useProspectMapData();

  const { map, setMap, loading, mapboxToken, isSatelliteView, setIsSatelliteView } = useMapbox();

  const openGoogleMaps = () => {
    const withAddress = filteredProspects.filter(p => p.business_address);
    if (withAddress.length === 0) {
      toast({ title: "No prospect addresses available", variant: "destructive" });
      return;
    }
    const addresses = withAddress.slice(0, 10).map(p => encodeURIComponent(p.business_address!));
    const origin = addresses[0];
    const destination = addresses[addresses.length - 1];
    const waypoints = addresses.slice(1, -1).join('|');
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${waypoints ? `&waypoints=${waypoints}` : ''}`;
    window.open(url, '_blank');
  };

  const openAppleMaps = () => {
    const withAddress = filteredProspects.filter(p => p.business_address);
    if (withAddress.length === 0) {
      toast({ title: "No prospect addresses available", variant: "destructive" });
      return;
    }
    const addresses = withAddress.slice(0, 10).map(p => encodeURIComponent(p.business_address!));
    const daddr = addresses.join('+to:');
    const url = `https://maps.apple.com/?daddr=${daddr}&dirflg=d`;
    window.open(url, '_blank');
  };
  
  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header isAdmin={userRole === 'admin'} onLogout={handleLogout} />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <MapHeader 
          prospectCount={filteredProspects.length} 
          onBackClick={() => navigate('/prospects')} 
        />
        
        {/* Unified toolbar row */}
        <div className="flex flex-wrap items-start gap-2 mb-4">
          <MapFilterControls
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedTerritory={selectedTerritory}
            setSelectedTerritory={setSelectedTerritory}
            territories={territories}
          />
          
          <RoutePlanner map={map} mapboxToken={mapboxToken} prospects={filteredProspects} />

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-1.5" onClick={openGoogleMaps}>
                  <ExternalLink className="h-3.5 w-3.5" />
                  Google Maps
                </Button>
              </TooltipTrigger>
              <TooltipContent>Open in Google Maps</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-1.5" onClick={openAppleMaps}>
                  <ExternalLink className="h-3.5 w-3.5" />
                  Apple Maps
                </Button>
              </TooltipTrigger>
              <TooltipContent>Open in Apple Maps</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {filteredProspects.length > 0 ? (
          <div className="bg-white p-4 rounded-lg shadow">
            <MapView
              prospects={filteredProspects}
              map={map}
              setMap={setMap}
              mapboxToken={mapboxToken}
              loading={loading}
              isSatelliteView={isSatelliteView}
              setIsSatelliteView={setIsSatelliteView}
            />
          </div>
        ) : (
          <EmptyMapState onReturnClick={() => navigate('/prospects')} />
        )}
      </div>
    </div>
  );
};

export default ProspectMap;
