import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Account } from "@/hooks/useAccounts";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  existing?: Account | null;
  onSaved?: () => void;
}

interface Sp { id: number; full_name: string | null; email: string; territory: string | null; }

const AccountFormDialog = ({ open, onOpenChange, existing, onSaved }: Props) => {
  const [salespeople, setSalespeople] = useState<Sp[]>([]);
  const [form, setForm] = useState({
    customer_number: "",
    account_name: "",
    region: "",
    territory: "",
    assigned_salesperson_id: "",
    date_last_sale: "",
    priority: "normal",
    notes: "",
  });

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("users").select("id, full_name, email, territory");
      setSalespeople((data || []) as Sp[]);
    })();
  }, []);

  useEffect(() => {
    if (existing) {
      setForm({
        customer_number: existing.customer_number || "",
        account_name: existing.account_name || "",
        region: existing.region || "",
        territory: existing.territory || "",
        assigned_salesperson_id: existing.assigned_salesperson_id?.toString() || "",
        date_last_sale: existing.date_last_sale || "",
        priority: existing.priority || "normal",
        notes: existing.notes || "",
      });
    } else {
      setForm({ customer_number: "", account_name: "", region: "", territory: "", assigned_salesperson_id: "", date_last_sale: "", priority: "normal", notes: "" });
    }
  }, [existing, open]);

  const save = async () => {
    if (!form.customer_number.trim() || !form.account_name.trim()) {
      toast({ title: "Customer # and Name are required", variant: "destructive" });
      return;
    }
    const payload: any = {
      customer_number: form.customer_number.trim(),
      account_name: form.account_name.trim(),
      region: form.region || null,
      territory: form.territory || null,
      assigned_salesperson_id: form.assigned_salesperson_id ? Number(form.assigned_salesperson_id) : null,
      date_last_sale: form.date_last_sale || null,
      priority: form.priority,
      notes: form.notes || null,
      source: existing ? existing.source : "manual",
    };
    const q = existing
      ? (supabase.from as any)("accounts").update(payload).eq("id", existing.id)
      : (supabase.from as any)("accounts").insert(payload);
    const { error } = await q;
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: existing ? "Account updated" : "Account added" });
    onSaved?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{existing ? "Edit Account" : "Add Account"}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-1">
            <Label>Customer #</Label>
            <Input value={form.customer_number} onChange={(e) => setForm({ ...form, customer_number: e.target.value })} />
          </div>
          <div className="col-span-1">
            <Label>Date Last Sale</Label>
            <Input type="date" value={form.date_last_sale} onChange={(e) => setForm({ ...form, date_last_sale: e.target.value })} />
          </div>
          <div className="col-span-2">
            <Label>Account Name</Label>
            <Input value={form.account_name} onChange={(e) => setForm({ ...form, account_name: e.target.value })} />
          </div>
          <div>
            <Label>Region</Label>
            <Input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} />
          </div>
          <div>
            <Label>Territory</Label>
            <Input value={form.territory} onChange={(e) => setForm({ ...form, territory: e.target.value })} />
          </div>
          <div>
            <Label>Assigned Salesperson</Label>
            <Select value={form.assigned_salesperson_id} onValueChange={(v) => setForm({ ...form, assigned_salesperson_id: v })}>
              <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
              <SelectContent className="z-[100]">
                {salespeople.map((s) => (
                  <SelectItem key={s.id} value={s.id.toString()}>
                    {s.full_name || s.email}{s.territory ? ` — ${s.territory}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Priority</Label>
            <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="z-[100]">
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2">
            <Label>Notes</Label>
            <Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AccountFormDialog;
