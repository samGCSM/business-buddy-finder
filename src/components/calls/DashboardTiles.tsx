import { Card } from "@/components/ui/card";
import { CallsDashboardCounts } from "@/hooks/useCallsDashboard";
import { Phone, AlertCircle, Calendar, CheckCircle2, Circle, RotateCw, Trophy } from "lucide-react";

interface Props {
  counts: CallsDashboardCounts;
}

const tile = (label: string, value: number, Icon: any, color: string) => (
  <Card className="p-4 flex items-center gap-3">
    <div className={`p-2 rounded-lg ${color}`}>
      <Icon className="h-5 w-5 text-white" />
    </div>
    <div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  </Card>
);

const DashboardTiles = ({ counts }: Props) => (
  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
    {tile("This Week", counts.this_week_calls, Phone, "bg-blue-500")}
    {tile("Overdue", counts.overdue_calls, AlertCircle, "bg-red-500")}
    {tile("Follow-Ups Due", counts.follow_ups_due, Calendar, "bg-amber-500")}
    {tile("Completed", counts.completed_this_week, CheckCircle2, "bg-emerald-500")}
    {tile("Not Called", counts.not_called_yet, Circle, "bg-slate-500")}
    {tile("Rolled Over", counts.rolled_over, RotateCw, "bg-purple-500")}
    {tile("Sold", counts.sold_this_week, Trophy, "bg-green-600")}
  </div>
);

export default DashboardTiles;
