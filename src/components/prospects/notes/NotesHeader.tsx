import { TabsList, TabsTrigger } from "@/components/ui/tabs";

const NotesHeader = () => {
  return (
    <TabsList className="grid w-full grid-cols-2">
      <TabsTrigger value="notes">Notes</TabsTrigger>
      <TabsTrigger value="activity">Activity Log</TabsTrigger>
    </TabsList>
  );
};

export default NotesHeader;