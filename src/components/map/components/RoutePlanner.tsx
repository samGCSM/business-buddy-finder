import { useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Prospect } from '@/types/prospects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRouteOptimization, RouteStop } from '../hooks/useRouteOptimization';
import { geocodeAddress } from '../utils/mapUtils';
import { toast } from '@/hooks/use-toast';
import { Navigation, MapPin, Loader2, ChevronDown, ChevronUp, X, LocateFixed, Clock } from 'lucide-react';

interface RoutePlannerProps {
  map: mapboxgl.Map | null;
  mapboxToken: string | null;
  prospects: Prospect[];
}

const formatDuration = (seconds: number): string => {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return `${hrs}h ${remainMins}m`;
};

const RoutePlanner = ({ map, mapboxToken, prospects }: RoutePlannerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [address, setAddress] = useState('');
  const [isGeolocating, setIsGeolocating] = useState(false);

  const { planRoute, clearRoute, isLoading, routeStops, totalDuration } = useRouteOptimization({
    map,
    mapboxToken,
    prospects,
  });

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: 'Geolocation not supported', variant: 'destructive' });
      return;
    }
    setIsGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: [number, number] = [position.coords.longitude, position.coords.latitude];
        setAddress('My Location');
        setIsGeolocating(false);
        planRoute(coords);
      },
      () => {
        toast({ title: 'Location access denied', description: 'Please enter an address instead.', variant: 'destructive' });
        setIsGeolocating(false);
      }
    );
  };

  const handlePlanRoute = async () => {
    if (!address || !mapboxToken) return;
    if (address === 'My Location') {
      handleUseMyLocation();
      return;
    }
    const coords = await geocodeAddress(address, mapboxToken);
    if (!coords) {
      toast({ title: 'Could not find that address', variant: 'destructive' });
      return;
    }
    planRoute(coords);
  };

  const handleClear = () => {
    clearRoute();
    setAddress('');
  };

  return (
    <div className="absolute top-3 left-3 z-30 w-80 max-w-[calc(100vw-2rem)]">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm" className="bg-white shadow-md gap-2">
            <Navigation className="h-4 w-4" />
            Route Planner
            {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-2 bg-white rounded-lg shadow-lg border p-3 space-y-3">
          {/* Start point input */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Starting Point</label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter address..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePlanRoute()}
                className="h-8 text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={handleUseMyLocation}
                disabled={isGeolocating}
                title="Use my location"
              >
                {isGeolocating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LocateFixed className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 h-8 text-xs"
              onClick={handlePlanRoute}
              disabled={!address || isLoading}
            >
              {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Navigation className="h-3.5 w-3.5 mr-1" />}
              Plan Route
            </Button>
            {routeStops.length > 0 && (
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={handleClear}>
                <X className="h-3.5 w-3.5 mr-1" /> Clear
              </Button>
            )}
          </div>

          {/* Prospect count info */}
          <p className="text-xs text-muted-foreground">
            {prospects.length} prospect{prospects.length !== 1 ? 's' : ''} on map
            {prospects.length > 11 && ' (route will use nearest 11)'}
          </p>

          {/* Route stops list */}
          {routeStops.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">Optimized Route</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDuration(totalDuration)} total
                </span>
              </div>
              <ScrollArea className="max-h-48">
                <div className="space-y-1">
                  {routeStops.map((stop, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 p-2 rounded-md bg-muted/50 text-xs"
                    >
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{stop.prospectName}</p>
                        <p className="text-muted-foreground truncate">{stop.prospectAddress}</p>
                      </div>
                      <span className="text-muted-foreground whitespace-nowrap shrink-0">
                        {formatDuration(stop.durationFromPrevious)}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default RoutePlanner;
