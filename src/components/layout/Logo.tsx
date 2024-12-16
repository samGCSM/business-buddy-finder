import { useNavigate } from "react-router-dom";

const Logo = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center space-x-4">
      <img 
        src="/lovable-uploads/a39fe416-87d2-481d-bf99-5a86c104e18e.png" 
        alt="Sales Storm Logo" 
        className="w-12 h-12"
        onClick={() => navigate('/')}
        style={{ cursor: 'pointer' }}
      />
      <span className="text-xl font-semibold">Sales Storm Prospecting</span>
    </div>
  );
};

export default Logo;