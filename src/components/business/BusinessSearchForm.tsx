
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Loader2, MapPin } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface BusinessSearchFormProps {
  onSearch: (location: string, keyword: string, radius: number) => void;
  isLoading: boolean;
  initialLocation?: string;
  initialKeyword?: string;
  initialRadius?: number;
}

const BusinessSearchForm = ({ 
  onSearch, 
  isLoading, 
  initialLocation = "", 
  initialKeyword = "",
  initialRadius = 10
}: BusinessSearchFormProps) => {
  const [location, setLocation] = useState(initialLocation);
  const [keyword, setKeyword] = useState(initialKeyword);
  const [radius, setRadius] = useState<number>(initialRadius);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  useEffect(() => {
    setLocation(initialLocation);
    setKeyword(initialKeyword);
    if (initialRadius) setRadius(initialRadius);
  }, [initialLocation, initialKeyword, initialRadius]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (location && keyword) {
      onSearch(location, keyword, radius);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
      });
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Use reverse geocoding to get a readable address
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${import.meta.env.VITE_GOOGLE_PLACES_API_KEY}`
          );
          
          const data = await response.json();
          
          if (data.status === "OK" && data.results.length > 0) {
            // Get the most detailed address
            const addressComponents = data.results[0].formatted_address;
            setLocation(addressComponents);
            
            toast({
              title: "Success",
              description: "Current location detected",
            });
          } else {
            setLocation(`${latitude}, ${longitude}`);
            
            toast({
              title: "Partial Success",
              description: "Using coordinates as location",
            });
          }
        } catch (error) {
          console.error("Error getting location:", error);
          toast({
            title: "Error",
            description: "Failed to get your location",
            variant: "destructive",
          });
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setIsGettingLocation(false);
        
        let errorMessage = "Failed to get your location";
        if (error.code === 1) {
          errorMessage = "Location access denied. Please enable location services.";
        }
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="location" className="text-sm font-medium">
              Location
            </label>
            <Button 
              type="button" 
              size="sm" 
              variant="outline"
              className="h-8 px-2 text-xs"
              onClick={getCurrentLocation}
              disabled={isGettingLocation}
            >
              {isGettingLocation ? (
                <>
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  <span>Getting location...</span>
                </>
              ) : (
                <>
                  <MapPin className="mr-1 h-3 w-3" />
                  <span>My Location</span>
                </>
              )}
            </Button>
          </div>
          <Input
            id="location"
            placeholder="Enter location..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="keyword" className="text-sm font-medium">
              Business Type
            </label>
          </div>
          <Input
            id="keyword"
            placeholder="Enter business type..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            required
            className="w-full"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="radius" className="text-sm font-medium">
            Search Radius: {radius} {radius === 1 ? 'mile' : 'miles'}
          </label>
          <span className="text-xs text-gray-500">1-50 miles</span>
        </div>
        <Slider
          id="radius"
          min={1}
          max={50}
          step={1}
          value={[radius]}
          onValueChange={(values) => setRadius(values[0])}
          className="py-2"
        />
      </div>
      
      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={isLoading} 
          className="w-full md:w-auto"
        >
          {isLoading ? "Searching..." : "Search"}
        </Button>
      </div>
    </form>
  );
};

export default BusinessSearchForm;

