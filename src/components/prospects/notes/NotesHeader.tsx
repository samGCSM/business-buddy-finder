
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

const NotesHeader = () => {
  return (
    <TabsList className="grid w-full grid-cols-1">
      <TabsTrigger value="notes">Notes</TabsTrigger>
    </TabsList>
  );
};

export default NotesHeader;
