import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil } from "lucide-react";
import { useCurrentAppUser } from "@/hooks/useCurrentAppUser";
import { useAccounts, Account } from "@/hooks/useAccounts";
import AccountFormDialog from "@/components/calls/AccountFormDialog";
import { formatDate } from "@/lib/week";
import { supabase } from "@/integrations/supabase/client";

const AccountsAdmin = () => {
  const navigate = useNavigate();
  const { user, loading, isAdmin, isManager } = useCurrentAppUser();
  const { accounts, refresh } = useAccounts();
  const [salespeople, setSalespeople] = useState<Record<number, string>>({});
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "unassigned">("all");
  const [editing, setEditing] = useState<Account | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/login", { replace: true });
    else if (!loading && !isAdmin && !isManager) navigate("/calls", { replace: true });
  }, [user, loading, isAdmin, isManager, navigate]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("users").select("id, full_name, email");
      const m: Record<number, string> = {};
      (data || []).forEach((u: any) => { m[u.id] = u.full_name || u.email; });
      setSalespeople(m);
    })();
  }, []);

  const filtered = accounts.filter((a) => {
    if (filter === "unassigned" && a.assigned_salesperson_id) return false;
    if (search) {
      const q = search.toLowerCase();
      return a.account_name.toLowerCase().includes(q) || a.customer_number.includes(q) || (a.territory || "").toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header isAdmin={isAdmin} onLogout={() => { localStorage.removeItem("currentUser"); navigate("/login"); }} />
      <div className="max-w-7xl mx-auto px-4 pb-10 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Accounts ({accounts.length})</h1>
          <Button onClick={() => { setEditing(null); setOpen(true); }}>
            <Plus className="h-4 w-4 mr-1" /> Add Account
          </Button>
        </div>

        <Card className="p-4">
          <div className="flex gap-3 mb-3">
            <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
            <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>All</Button>
            <Button variant={filter === "unassigned" ? "default" : "outline"} size="sm" onClick={() => setFilter("unassigned")}>Unassigned</Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer #</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Territory</TableHead>
                  <TableHead>Salesperson</TableHead>
                  <TableHead>Last Sale</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.slice(0, 500).map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-mono text-xs">{a.customer_number}</TableCell>
                    <TableCell className="font-medium">{a.account_name}</TableCell>
                    <TableCell className="text-xs">{a.region || "—"}</TableCell>
                    <TableCell className="text-xs">{a.territory || "—"}</TableCell>
                    <TableCell className="text-xs">
                      {a.assigned_salesperson_id ? salespeople[a.assigned_salesperson_id] || `#${a.assigned_salesperson_id}` : <Badge variant="outline">Unassigned</Badge>}
                    </TableCell>
                    <TableCell>{formatDate(a.date_last_sale)}</TableCell>
                    <TableCell className="text-xs">{a.source}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => { setEditing(a); setOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filtered.length > 500 && <p className="text-xs text-muted-foreground text-center py-2">Showing first 500 of {filtered.length}. Use search to narrow.</p>}
          </div>
        </Card>
      </div>

      <AccountFormDialog open={open} onOpenChange={setOpen} existing={editing} onSaved={refresh} />
    </div>
  );
};

export default AccountsAdmin;
