
import Header from "@/components/layout/Header";
import MapView from "@/components/map/MapView";
import { useProspectMapData } from "./map/hooks/useProspectMapData";
import MapFilterControls from "./map/components/MapFilterControls";
import MapHeader from "./map/components/MapHeader";
import EmptyMapState from "./map/components/EmptyMapState";

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
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="relative md:col-span-3">
            <MapFilterControls
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedTerritory={selectedTerritory}
              setSelectedTerritory={setSelectedTerritory}
              territories={territories}
            />
          </div>
        </div>
        
        {filteredProspects.length > 0 ? (
          <div className="bg-white p-4 rounded-lg shadow">
            <MapView prospects={filteredProspects} />
          </div>
        ) : (
          <EmptyMapState onReturnClick={() => navigate('/prospects')} />
        )}
      </div>
    </div>
  );
};

export default ProspectMap;
