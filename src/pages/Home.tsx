import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "@supabase/auth-helpers-react";
import Header from "@/components/layout/Header";
import { supabase } from "@/integrations/supabase/client";

const Home = () => {
  const session = useSession();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      if (!session?.user) {
        navigate("/login");
        return;
      }

      const { data: user } = await supabase
        .from('users')
        .select('type')
        .eq('id', session.user.id)
        .single();

      setIsAdmin(user?.type === 'admin');
    };

    checkUser();
  }, [session, navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (!session) return null;

  return (
    <div>
      <Header isAdmin={isAdmin} onLogout={handleLogout} />
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-4">Welcome to Sales Storm</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Quick Search</h2>
            <p className="text-gray-600 mb-4">
              Search for businesses and get instant results
            </p>
            <button
              onClick={() => navigate('/prospects')}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Start Searching
            </button>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Bulk Search</h2>
            <p className="text-gray-600 mb-4">
              Search multiple businesses at once
            </p>
            <button
              onClick={() => navigate('/bulk-search')}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Start Bulk Search
            </button>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Profile</h2>
            <p className="text-gray-600 mb-4">
              View and manage your profile settings
            </p>
            <button
              onClick={() => navigate('/profile')}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              View Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;