import { ScrollArea } from "@/components/ui/scroll-area";

interface NotesDisplayProps {
  notes: string;
}

const NotesDisplay = ({ notes }: NotesDisplayProps) => {
  if (!notes) return null;
  
  return (
    <ScrollArea className="flex-grow">
      <div className="bg-gray-50 p-4 rounded-lg text-sm whitespace-pre-wrap mb-4">
        {notes}
      </div>
    </ScrollArea>
  );
};

export default NotesDisplay;