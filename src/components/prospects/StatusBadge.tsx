import { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const statusColors = {
  'New': '#E5DEFF',
  'Contacted': '#FEF7CD',
  'Meeting': '#F2FCE2',
  'Proposal': '#D3E4FD',
  'Won': '#90EE90',
  'Lost': '#FFDEE2'
};

const statusOptions = ['New', 'Contacted', 'Meeting', 'Proposal', 'Won', 'Lost'];

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

  const handleStatusSelect = (newStatus: string) => {
    if (onStatusChange) {
      onStatusChange(newStatus, statusColors[newStatus as keyof typeof statusColors] || customColor);
    }
  };

  return (
    <div className="flex items-stretch h-full w-full">
      <Popover>
        <PopoverTrigger asChild>
          <div
            className="cursor-pointer w-full flex items-center justify-center px-4 text-sm font-medium"
            style={{
              backgroundColor: customColor,
              color: '#000000',
            }}
          >
            {status}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Status</Label>
              <div className="grid grid-cols-2 gap-2">
                {statusOptions.map((option) => (
                  <Button
                    key={option}
                    variant="outline"
                    className="w-full"
                    onClick={() => handleStatusSelect(option)}
                    style={{
                      backgroundColor: statusColors[option as keyof typeof statusColors],
                      border: 'none'
                    }}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
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