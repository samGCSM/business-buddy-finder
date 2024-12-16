import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
}

const MetricCard = ({ title, value, icon: Icon }: MetricCardProps) => (
  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <div className="flex items-baseline mt-1">
          <p className="text-2xl font-semibold">{value}</p>
        </div>
      </div>
      <div className="p-2 bg-gray-50 rounded-lg">
        <Icon className="w-6 h-6 text-gray-600" />
      </div>
    </div>
  </div>
);

export default MetricCard;