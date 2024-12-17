import { Card } from "@/components/ui/card";

interface InsightCardProps {
  id: string;
  content: string;
  contentType: string;
  createdAt: string;
}

const InsightCard = ({ id, content, contentType, createdAt }: InsightCardProps) => {
  const isMotivation = contentType === 'daily_motivation';
  const bgColor = isMotivation ? 'bg-blue-50' : 'bg-green-50';
  const icon = isMotivation ? '🌟' : '📋';

  return (
    <Card key={id} className={`p-4 ${bgColor}`}>
      <div className="flex items-start gap-2">
        <span className="text-xl">{icon}</span>
        <div>
          <p className="text-sm text-gray-600">{content}</p>
          <span className="text-xs text-gray-400 mt-2 block">
            {new Date(createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default InsightCard;