import { Button } from "@/components/ui/button";

interface ProspectFormActionsProps {
  onClose: () => void;
  submitLabel: string;
}

const ProspectFormActions = ({ onClose, submitLabel }: ProspectFormActionsProps) => {
  return (
    <div className="flex justify-end space-x-4">
      <Button type="button" variant="outline" onClick={onClose}>
        Cancel
      </Button>
      <Button type="submit">
        {submitLabel}
      </Button>
    </div>
  );
};

export default ProspectFormActions;