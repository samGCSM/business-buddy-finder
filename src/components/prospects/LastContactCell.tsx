import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useState } from "react";
import { ContactLog } from "./contact/ContactLog";

interface LastContactCellProps {
  prospectId: string;
  prospectName: string;
  lastContact: string;
  onUpdate: () => void;
}

const LastContactCell = ({ prospectId, prospectName, lastContact, onUpdate }: LastContactCellProps) => {
  const [isContactLogOpen, setIsContactLogOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        onClick={() => setIsContactLogOpen(true)}
        className="hover:bg-accent"
      >
        {format(new Date(lastContact), "MMM d, yyyy")}
      </Button>

      <ContactLog
        isOpen={isContactLogOpen}
        onClose={() => setIsContactLogOpen(false)}
        prospectId={prospectId}
        prospectName={prospectName}
        onContactLogged={onUpdate}
      />
    </>
  );
};

export default LastContactCell;