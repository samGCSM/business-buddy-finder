import { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const priorityColors = {
  'Low': '#F2FCE2',
  'Medium': '#FEF7CD',
  'High': '#FFDEE2'
};

const priorityOptions = ['Low', 'Medium', 'High'];

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

  const handlePrioritySelect = (newPriority: string) => {
    const newColor = priorityColors[newPriority as keyof typeof priorityColors] || customColor;
    setCustomColor(newColor);
    if (onPriorityChange) {
      onPriorityChange(newPriority, newColor);
    }
  };

  return (
    <div className="h-full w-full">
      <Popover>
        <PopoverTrigger asChild>
          <div
            className="h-full w-full cursor-pointer flex items-center justify-center px-4 text-sm font-medium"
            style={{
              backgroundColor: customColor,
              color: '#000000',
            }}
          >
            {priority}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Priority</Label>
              <div className="grid grid-cols-2 gap-2">
                {priorityOptions.map((option) => (
                  <Button
                    key={option}
                    variant="outline"
                    className="w-full"
                    onClick={() => handlePrioritySelect(option)}
                    style={{
                      backgroundColor: priorityColors[option as keyof typeof priorityColors],
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

export default PriorityBadge;