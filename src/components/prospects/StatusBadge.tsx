import { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const statusColors = {
  'Done/Meeting': '#26D08A',
  'Prospect': '#FDB85A',
  'Warm Lead': '#FFD326',
  'No Response': '#2691C0',
  'DO NOT CONTACT': '#E44E65',
  'Dead': '#6F5B5B',
  'NO METAL': '#AFE7F7',
  'QUOTED': '#89BBD4',
  'OUT OF TERRITORY': '#C5516D'
};

const statusOptions = [
  'Done/Meeting',
  'Prospect',
  'Warm Lead',
  'No Response',
  'DO NOT CONTACT',
  'Dead',
  'NO METAL',
  'QUOTED',
  'OUT OF TERRITORY'
];

interface StatusBadgeProps {
  status: string;
  onStatusChange?: (newStatus: string, color: string) => void;
}

const StatusBadge = ({ status, onStatusChange }: StatusBadgeProps) => {
  const [currentStatus, setCurrentStatus] = useState(status);
  const [customColor, setCustomColor] = useState(statusColors[status as keyof typeof statusColors] || '#26D08A');

  const handleColorChange = (color: string) => {
    setCustomColor(color);
    if (onStatusChange) {
      onStatusChange(currentStatus, color);
    }
  };

  const handleStatusSelect = (newStatus: string) => {
    setCurrentStatus(newStatus);
    const newColor = statusColors[newStatus as keyof typeof statusColors] || customColor;
    setCustomColor(newColor);
    if (onStatusChange) {
      onStatusChange(newStatus, newColor);
    }
  };

  return (
    <div className="h-full w-full">
      <Popover>
        <PopoverTrigger asChild>
          <button
            className="w-full h-9 px-4 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            style={{
              backgroundColor: customColor,
              color: '#ffffff', // Set text color to white
            }}
          >
            {currentStatus}
          </button>
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
                      color: '#ffffff',
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