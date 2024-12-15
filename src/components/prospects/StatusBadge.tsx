import { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const statusColors = {
  'New': '#E5DEFF',
  'Contacted': '#FEF7CD',
  'Meeting': '#F2FCE2',
  'Proposal': '#D3E4FD',
  'Won': '#90EE90',
  'Lost': '#FFDEE2'
};

interface StatusBadgeProps {
  status: string;
  onStatusChange?: (newStatus: string, color: string) => void;
}

const StatusBadge = ({ status, onStatusChange }: StatusBadgeProps) => {
  const [customColor, setCustomColor] = useState(statusColors[status as keyof typeof statusColors] || '#E5DEFF');

  const handleColorChange = (color: string) => {
    setCustomColor(color);
    if (onStatusChange) {
      onStatusChange(status, color);
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
            {status}
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

export default StatusBadge;