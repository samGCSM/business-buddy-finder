import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "not_called", label: "Not Called" },
  { value: "called", label: "Called" },
  { value: "no_answer", label: "No Answer" },
  { value: "left_voicemail", label: "Left Voicemail" },
  { value: "follow_up_needed", label: "Follow-Up Needed" },
  { value: "sold", label: "Sold" },
  { value: "bad_number", label: "Bad Number" },
  { value: "do_not_call", label: "Do Not Call" },
];

const TERMINAL = new Set(["called", "sold", "bad_number", "do_not_call"]);

interface Props {
  taskId: string;
  value: string;
  onChange?: () => void;
}

const StatusSelect = ({ taskId, value, onChange }: Props) => {
  const handle = async (newVal: string) => {
    const patch: any = { status: newVal };
    if (TERMINAL.has(newVal)) patch.completed_at = new Date().toISOString();
    else patch.completed_at = null;
    const { error } = await (supabase.from as any)("call_tasks").update(patch).eq("id", taskId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Status updated" });
    onChange?.();
  };

  return (
    <Select value={value} onValueChange={handle}>
      <SelectTrigger className="h-8 w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="z-[100]">
        {STATUS_OPTIONS.map((o) => (
          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default StatusSelect;
