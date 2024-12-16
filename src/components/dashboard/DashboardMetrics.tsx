import { Users, Mail, PhoneCall, UserPlus } from "lucide-react";
import MetricCard from "./MetricCard";

interface DashboardMetricsProps {
  totalProspects: number;
  newProspects: number;
  emailsSent: number;
  callsMade: number;
}

const DashboardMetrics = ({ 
  totalProspects, 
  newProspects, 
  emailsSent, 
  callsMade 
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
        title="Emails Sent"
        value={emailsSent}
        icon={Mail}
      />
      <MetricCard
        title="Calls Made"
        value={callsMade}
        icon={PhoneCall}
      />
    </div>
  );
};

export default DashboardMetrics;