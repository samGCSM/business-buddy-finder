import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Upload, Settings } from "lucide-react";
import { useCurrentAppUser } from "@/hooks/useCurrentAppUser";
import { useCallsDashboard } from "@/hooks/useCallsDashboard";
import { useThisWeekCalls, CallTaskRow } from "@/hooks/useThisWeekCalls";
import DashboardTiles from "@/components/calls/DashboardTiles";
import StatusSelect from "@/components/calls/StatusSelect";
import NotesDrawer from "@/components/calls/NotesDrawer";
import AddToCallListButton from "@/components/calls/AddToCallListButton";
import { formatDate } from "@/lib/week";

const CallsThisWeek = () => {
  const navigate = useNavigate();
  const { user, loading: userLoading, isAdmin, isManager } = useCurrentAppUser();
  const { data: counts, refresh: refreshDash } = useCallsDashboard(user?.id);
  const { tasks, refresh } = useThisWeekCalls(user?.id);
  const [noteTask, setNoteTask] = useState<CallTaskRow | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!userLoading && !user) navigate("/login", { replace: true });
  }, [user, userLoading, navigate]);

  const filtered = tasks.filter((t) => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !t.account?.account_name.toLowerCase().includes(q) &&
        !t.account?.customer_number.includes(q)
      ) return false;
    }
    return true;
  });

  const refreshAll = () => { refresh(); refreshDash(); };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header isAdmin={isAdmin} onLogout={() => { localStorage.removeItem("currentUser"); navigate("/login"); }} />
      <div className="max-w-7xl mx-auto px-4 pb-10 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">This Week's Calls</h1>
            <p className="text-sm text-muted-foreground">
              {user?.full_name || user?.email} · {user?.territory || "No territory"}
            </p>
          </div>
          <div className="flex gap-2">
            {user && <AddToCallListButton salespersonId={user.id} onAdded={refreshAll} />}
            {(isAdmin || isManager) && (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/calls/accounts"><Settings className="h-4 w-4 mr-1" />Accounts</Link>
                </Button>
                {isAdmin && (
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/calls/import"><Upload className="h-4 w-4 mr-1" />Import</Link>
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        <DashboardTiles counts={counts} />

        <Card className="p-4">
          <div className="flex flex-wrap gap-3 mb-3">
            <Input placeholder="Search account or customer #..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent className="z-[100]">
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="not_called">Not Called</SelectItem>
                <SelectItem value="follow_up_needed">Follow-Up</SelectItem>
                <SelectItem value="called">Called</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer #</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Last Sale</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Rollover</TableHead>
                  <TableHead>Territory</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No calls this week.</TableCell></TableRow>
                )}
                {filtered.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-mono text-xs">{t.account?.customer_number}</TableCell>
                    <TableCell className="font-medium">{t.account?.account_name}</TableCell>
                    <TableCell>{formatDate(t.account?.date_last_sale)}</TableCell>
                    <TableCell><StatusSelect taskId={t.id} value={t.status} onChange={refreshAll} /></TableCell>
                    <TableCell><Badge variant={t.priority === "urgent" ? "destructive" : "secondary"}>{t.priority}</Badge></TableCell>
                    <TableCell>{t.rollover_count > 0 ? <Badge variant="outline">×{t.rollover_count}</Badge> : "—"}</TableCell>
                    <TableCell className="text-xs">{t.territory || "—"}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => setNoteTask(t)}>
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {user && (
        <NotesDrawer
          open={!!noteTask}
          onOpenChange={(v) => !v && setNoteTask(null)}
          accountId={noteTask?.account_id || null}
          callTaskId={noteTask?.id || null}
          salespersonId={user.id}
          accountName={noteTask?.account?.account_name}
          onSaved={refreshAll}
        />
      )}
    </div>
  );
};

export default CallsThisWeek;
