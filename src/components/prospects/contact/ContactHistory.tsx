import { format } from "date-fns";
import { ContactHistoryProps } from "./types";

export const ContactHistory = ({ contactHistory }: ContactHistoryProps) => {
  return (
    <div className="mt-8">
      <h3 className="font-semibold mb-4">Contact History</h3>
      <div className="space-y-4">
        {contactHistory.length === 0 ? (
          <p className="text-sm text-muted-foreground">No contact history yet</p>
        ) : (
          contactHistory.map((contact, index) => (
            <div key={index} className="border rounded-lg p-3">
              <div className="flex justify-between items-start">
                <div className="font-medium">{contact.type}</div>
                <div className="text-sm text-muted-foreground">
                  {format(new Date(contact.timestamp), "MMM d, yyyy h:mm a")}
                </div>
              </div>
              {contact.notes && (
                <p className="text-sm mt-2 text-muted-foreground">{contact.notes}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};