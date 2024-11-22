import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login - replace with real authentication later
    if (email === "admin@example.com" && password === "admin") {
      setIsLoggedIn(true);
      toast({
        title: "Success",
        description: "Logged in successfully",
      });
    } else if (email === "user@example.com" && password === "user") {
      setIsLoggedIn(true);
      toast({
        title: "Success",
        description: "Logged in successfully",
      });
    } else {
      toast({
        title: "Error",
        description: "Invalid credentials",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {!isLoggedIn ? (
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-center mb-6">Business Buddy Finder</h1>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
            <p className="mt-4 text-sm text-gray-600 text-center">
              Demo credentials:<br />
              Admin: admin@example.com / admin<br />
              User: user@example.com / user
            </p>
          </div>
        ) : (
          <BusinessSearch />
        )}
      </div>
    </div>
  );
};

const BusinessSearch = () => {
  const [location, setLocation] = useState("");
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  interface Business {
    id: string;
    name: string;
    phone: string;
    email: string;
    website: string;
    reviewCount: number;
    rating: number;
    address: string;
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Mock API call - replace with real API integration later
    try {
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock data
      const mockResults: Business[] = Array.from({ length: 10 }, (_, i) => ({
        id: `${i + 1}`,
        name: `Business ${i + 1}`,
        phone: `(555) 555-${String(1000 + i).padStart(4, '0')}`,
        email: `business${i + 1}@example.com`,
        website: `https://business${i + 1}.com`,
        reviewCount: Math.floor(Math.random() * 500),
        rating: 3 + Math.random() * 2,
        address: `${Math.floor(Math.random() * 1000)} Main St, ${location}`,
      }));

      setResults(mockResults);
      toast({
        title: "Success",
        description: "Search completed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch results",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    // Mock export functionality - implement real Excel export later
    toast({
      title: "Coming Soon",
      description: "Export functionality will be implemented soon",
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-center">Business Search</h2>
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter location"
              required
            />
          </div>
          <div>
            <label htmlFor="keyword" className="block text-sm font-medium text-gray-700">
              Keyword
            </label>
            <Input
              id="keyword"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Enter keyword"
              required
            />
          </div>
        </div>
        <div className="flex justify-center gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Searching..." : "Search"}
          </Button>
          {results.length > 0 && (
            <Button type="button" variant="outline" onClick={handleExport}>
              Export to Excel
            </Button>
          )}
        </div>
      </form>

      {results.length > 0 && (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reviews</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {results.map((business) => (
                <tr key={business.id}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{business.name}</div>
                    <div className="text-sm text-gray-500">{business.website}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{business.phone}</div>
                    <div className="text-sm text-gray-500">{business.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{business.rating.toFixed(1)} ★</div>
                    <div className="text-sm text-gray-500">{business.reviewCount} reviews</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{business.address}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Index;