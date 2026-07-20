import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/week";
import { STATUS_OPTIONS } from "./StatusSelect";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  accountId: string | null;
  callTaskId: string | null;
  salespersonId: number;
  accountName?: string;
  onSaved?: () => void;
}

interface Note {
  id: string;
  note: string;
  outcome: string | null;
  next_follow_up_date: string | null;
  created_at: string;
}

const NotesDrawer = ({ open, onOpenChange, accountId, callTaskId, salespersonId, accountName, onSaved }: Props) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [note, setNote] = useState("");
  const [outcome, setOutcome] = useState<string>("called");
  const [followUp, setFollowUp] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!accountId || !open) return;
    (async () => {
      const { data } = await (supabase.from as any)("call_notes")
        .select("*")
        .eq("account_id", accountId)
        .order("created_at", { ascending: false });
      setNotes((data || []) as Note[]);
    })();
  }, [accountId, open]);

  const save = async () => {
    if (!accountId || !note.trim()) return;
    setSaving(true);
    const payload: any = {
      account_id: accountId,
      call_task_id: callTaskId,
      salesperson_id: salespersonId,
      note: note.trim(),
      outcome,
      next_follow_up_date: followUp || null,
    };
    const { error } = await (supabase.from as any)("call_notes").insert(payload);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setSaving(false);
      return;
    }

    // Optionally update call_task status/follow-up
    if (callTaskId) {
      const patch: any = { status: outcome };
      if (outcome === "called" || outcome === "sold") patch.completed_at = new Date().toISOString();
      await (supabase.from as any)("call_tasks").update(patch).eq("id", callTaskId);
    }

    setNote("");
    setFollowUp("");
    toast({ title: "Note saved" });
    setSaving(false);
    onSaved?.();
    // Reload notes
    const { data } = await (supabase.from as any)("call_notes")
      .select("*").eq("account_id", accountId).order("created_at", { ascending: false });
    setNotes((data || []) as Note[]);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{accountName || "Call Notes"}</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 mt-4">
          <div className="space-y-2 border rounded-lg p-3">
            <Label>New note</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Talked with..." rows={3} />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Outcome</Label>
                <Select value={outcome} onValueChange={setOutcome}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="z-[100]">
                    {STATUS_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Next follow-up</Label>
                <Input type="date" value={followUp} onChange={(e) => setFollowUp(e.target.value)} />
              </div>
            </div>
            <Button onClick={save} disabled={saving || !note.trim()} className="w-full">
              {saving ? "Saving..." : "Save Note"}
            </Button>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-sm">History ({notes.length})</h4>
            {notes.length === 0 && <p className="text-sm text-muted-foreground">No notes yet.</p>}
            {notes.map((n) => (
              <div key={n.id} className="border rounded-lg p-3 text-sm">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>{formatDate(n.created_at)}</span>
                  <span className="uppercase">{n.outcome}</span>
                </div>
                <p className="whitespace-pre-wrap">{n.note}</p>
                {n.next_follow_up_date && (
                  <p className="text-xs text-primary mt-1">Follow up: {formatDate(n.next_follow_up_date)}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NotesDrawer;
