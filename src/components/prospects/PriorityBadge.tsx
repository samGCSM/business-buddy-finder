import { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const priorityColors = {
  'Low': '#F2FCE2',
  'Medium': '#FEF7CD',
  'High': '#FFDEE2'
};

interface PriorityBadgeProps {
  priority: string;
  onPriorityChange?: (newPriority: string, color: string) => void;
}

const PriorityBadge = ({ priority, onPriorityChange }: PriorityBadgeProps) => {
  const [customColor, setCustomColor] = useState(priorityColors[priority as keyof typeof priorityColors] || '#FEF7CD');

  const handleColorChange = (color: string) => {
    setCustomColor(color);
    if (onPriorityChange) {
      onPriorityChange(priority, color);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Badge
            className="cursor-pointer px-4 py-1 text-sm font-medium"
            style={{
              backgroundColor: customColor,
              color: '#000000',
              border: 'none'
            }}
          >
            {priority}
          </Badge>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Custom Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={customColor}
                  onChange={(e) => handleColorChange(e.target.value)}
                />
                <Input
                  type="text"
                  value={customColor}
                  onChange={(e) => handleColorChange(e.target.value)}
                  placeholder="#000000"
                />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default PriorityBadge;