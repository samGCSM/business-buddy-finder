
import { Users, Mail, UserPlus, HandshakeIcon } from "lucide-react";
import MetricCard from "./MetricCard";

interface DashboardMetricsProps {
  totalProspects: number;
  newProspects: number;
  emailsSent: number;
  faceToFace: number;
}

const DashboardMetrics = ({ 
  totalProspects, 
  newProspects, 
  emailsSent, 
  faceToFace 
}: DashboardMetricsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Total Prospects"
        value={totalProspects}
        icon={Users}
      />
      <MetricCard
        title="New Prospects (30d)"
        value={newProspects}
        icon={UserPlus}
      />
      <MetricCard
        title="Emails Sent (7d)"
        value={emailsSent}
        icon={Mail}
      />
      <MetricCard
        title="Face To Face (7d)"
        value={faceToFace}
        icon={HandshakeIcon}
      />
    </div>
  );
};

export default DashboardMetrics;
