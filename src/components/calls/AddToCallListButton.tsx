import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from "@/components/ui/command";
import { Plus } from "lucide-react";
import { useAccounts } from "@/hooks/useAccounts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { getWeekStart } from "@/lib/week";

interface Props {
  salespersonId: number;
  onAdded: () => void;
}

const AddToCallListButton = ({ salespersonId, onAdded }: Props) => {
  const { accounts } = useAccounts();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [followUp, setFollowUp] = useState("");

  const add = async (accountId: string) => {
    const weekStart = followUp || getWeekStart(followUp ? new Date(followUp) : new Date());
    const monday = getWeekStart(new Date(weekStart));
    const { error } = await (supabase.from as any)("call_tasks").upsert(
      {
        account_id: accountId,
        assigned_salesperson_id: salespersonId,
        week_start_date: monday,
        status: "not_called",
      },
      { onConflict: "account_id,week_start_date" }
    );
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Added to call list" });
    setOpen(false);
    onAdded();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-1" /> Add to Call List
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0 z-[100]" align="end">
        <div className="p-2 border-b space-y-2">
          <div>
            <Label className="text-xs">Schedule for week of (optional)</Label>
            <Input type="date" value={followUp} onChange={(e) => setFollowUp(e.target.value)} />
          </div>
        </div>
        <Command>
          <CommandInput placeholder="Search accounts..." value={search} onValueChange={setSearch} />
          <CommandList>
            <CommandEmpty>No accounts</CommandEmpty>
            {accounts
              .filter((a) => {
                const q = search.toLowerCase();
                return !q || a.account_name.toLowerCase().includes(q) || a.customer_number.includes(q);
              })
              .slice(0, 25)
              .map((a) => (
                <CommandItem key={a.id} onSelect={() => add(a.id)}>
                  <span className="font-mono text-xs mr-2">{a.customer_number}</span>
                  <span className="truncate">{a.account_name}</span>
                </CommandItem>
              ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default AddToCallListButton;
