import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import Header from "@/components/layout/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Upload, Loader2 } from "lucide-react";
import { useCurrentAppUser } from "@/hooks/useCurrentAppUser";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/week";

interface ParsedRow {
  customer_number: string;
  account_name: string;
  region: string | null;
  territory: string | null;
  date_last_sale: string | null;
  error?: string;
}

const toDate = (v: any): string | null => {
  if (v == null || v === "") return null;
  if (typeof v === "number") {
    // Excel serial
    const d = XLSX.SSF.parse_date_code(v);
    if (!d) return null;
    return `${d.y}-${String(d.m).padStart(2, "0")}-${String(d.d).padStart(2, "0")}`;
  }
  const d = new Date(v);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
};

const parseFile = async (file: File): Promise<ParsedRow[]> => {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array", cellDates: false });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, raw: true, defval: null });

  // Find header row
  const headerIdx = rows.findIndex((r) => r && r.some((c) => String(c || "").toLowerCase().includes("customer")));
  if (headerIdx < 0) return [];
  const header = rows[headerIdx].map((h: any) => String(h || "").toLowerCase().trim());
  const idx = {
    region: header.findIndex((h) => h.includes("region")),
    territory: header.findIndex((h) => h.includes("territory")),
    customer: header.findIndex((h) => h.includes("customer")),
    name: header.findIndex((h) => h === "name" || h.includes("account") || h.includes("name")),
    date: header.findIndex((h) => h.includes("date")),
  };

  let lastRegion: string | null = null;
  let lastTerritory: string | null = null;
  const out: ParsedRow[] = [];
  for (let i = headerIdx + 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.every((c: any) => c == null || c === "")) continue;
    const rawRegion = r[idx.region] != null ? String(r[idx.region]).trim() : null;
    const rawTerritory = r[idx.territory] != null ? String(r[idx.territory]).trim() : null;
    if (rawRegion) lastRegion = rawRegion;
    if (rawTerritory) lastTerritory = rawTerritory;
    const customer = r[idx.customer] != null ? String(r[idx.customer]).trim() : "";
    const name = r[idx.name] != null ? String(r[idx.name]).trim() : "";
    const date = toDate(r[idx.date]);

    const row: ParsedRow = {
      customer_number: customer,
      account_name: name,
      region: lastRegion,
      territory: lastTerritory,
      date_last_sale: date,
    };
    if (!customer) row.error = "Missing customer #";
    else if (!name) row.error = "Missing name";
    else if (r[idx.date] != null && !date) row.error = "Invalid date";
    out.push(row);
  }
  return out;
};

const ImportAccounts = () => {
  const navigate = useNavigate();
  const { user, loading, isAdmin } = useCurrentAppUser();
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [preview, setPreview] = useState<{ create: number; update: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [batches, setBatches] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) navigate("/login", { replace: true });
    else if (!loading && !isAdmin) navigate("/calls", { replace: true });
  }, [user, loading, isAdmin, navigate]);

  useEffect(() => {
    (async () => {
      const { data } = await (supabase.from as any)("import_batches").select("*").order("uploaded_at", { ascending: false }).limit(10);
      setBatches(data || []);
    })();
  }, [busy]);

  const onFile = async (f: File) => {
    setFile(f);
    setBusy(true);
    const parsed = await parseFile(f);
    setRows(parsed);
    // Preview: check which customer_numbers exist
    const valid = parsed.filter((r) => !r.error);
    const nums = valid.map((r) => r.customer_number);
    const { data: existing } = await (supabase.from as any)("accounts").select("customer_number").in("customer_number", nums);
    const existingSet = new Set((existing || []).map((e: any) => e.customer_number));
    const update = valid.filter((r) => existingSet.has(r.customer_number)).length;
    const create = valid.length - update;
    setPreview({ create, update });
    setBusy(false);
  };

  const commit = async () => {
    if (!user || !file) return;
    setBusy(true);
    const valid = rows.filter((r) => !r.error);
    const errored = rows.filter((r) => r.error);

    // Fetch salespeople for auto-assign
    const { data: sp } = await supabase.from("users").select("id, territory");
    const spByTerritory = new Map<string, number>();
    (sp || []).forEach((u: any) => {
      if (u.territory) spByTerritory.set(u.territory.trim().toLowerCase(), u.id);
    });

    // Get existing customer_numbers
    const nums = valid.map((r) => r.customer_number);
    const { data: existingRows } = await (supabase.from as any)("accounts").select("id, customer_number").in("customer_number", nums);
    const existingMap = new Map((existingRows || []).map((r: any) => [r.customer_number, r.id]));

    let created = 0, updated = 0, skipped = errored.length;

    // Batch updates
    const updates = valid.filter((r) => existingMap.has(r.customer_number));
    for (const r of updates) {
      const { error } = await (supabase.from as any)("accounts")
        .update({
          account_name: r.account_name,
          region: r.region,
          territory: r.territory,
          date_last_sale: r.date_last_sale,
        })
        .eq("customer_number", r.customer_number);
      if (error) skipped++; else updated++;
    }

    // Batch inserts
    const inserts = valid.filter((r) => !existingMap.has(r.customer_number)).map((r) => ({
      customer_number: r.customer_number,
      account_name: r.account_name,
      region: r.region,
      territory: r.territory,
      date_last_sale: r.date_last_sale,
      assigned_salesperson_id: r.territory ? spByTerritory.get(r.territory.trim().toLowerCase()) || null : null,
      source: "spreadsheet_import",
    }));
    if (inserts.length) {
      const chunkSize = 200;
      for (let i = 0; i < inserts.length; i += chunkSize) {
        const chunk = inserts.slice(i, i + chunkSize);
        const { error } = await (supabase.from as any)("accounts").insert(chunk);
        if (error) skipped += chunk.length; else created += chunk.length;
      }
    }

    await (supabase.from as any)("import_batches").insert({
      file_name: file.name,
      uploaded_by: user.id,
      total_rows: rows.length,
      created_count: created,
      updated_count: updated,
      skipped_count: skipped,
      error_count: errored.length,
      errors: errored.slice(0, 100),
    });

    toast({ title: "Import complete", description: `${created} created, ${updated} updated, ${skipped} skipped` });
    setFile(null); setRows([]); setPreview(null);
    setBusy(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header isAdmin={isAdmin} onLogout={() => { localStorage.removeItem("currentUser"); navigate("/login"); }} />
      <div className="max-w-6xl mx-auto px-4 pb-10 space-y-6">
        <h1 className="text-2xl font-bold">Import Accounts</h1>

        <Card className="p-6">
          <label className="block">
            <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50">
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="font-medium">{file?.name || "Click to upload Excel/CSV"}</p>
              <p className="text-xs text-muted-foreground mt-1">Expects: Region | Territory Final | Customer # | Name | Date Last Sale</p>
            </div>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
            />
          </label>

          {busy && <div className="mt-3 flex items-center gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin" /> Processing...</div>}

          {preview && (
            <div className="mt-4 space-y-3">
              <div className="flex gap-3">
                <Badge>{preview.create} new</Badge>
                <Badge variant="secondary">{preview.update} updates</Badge>
                <Badge variant="destructive">{rows.filter((r) => r.error).length} errors</Badge>
              </div>
              <div className="max-h-72 overflow-y-auto border rounded">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer #</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead>Territory</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.slice(0, 30).map((r, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-mono text-xs">{r.customer_number}</TableCell>
                        <TableCell>{r.account_name}</TableCell>
                        <TableCell className="text-xs">{r.region}</TableCell>
                        <TableCell className="text-xs">{r.territory}</TableCell>
                        <TableCell>{formatDate(r.date_last_sale)}</TableCell>
                        <TableCell>{r.error ? <Badge variant="destructive">{r.error}</Badge> : <Badge>OK</Badge>}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex gap-2">
                <Button onClick={commit} disabled={busy}>Confirm Import</Button>
                <Button variant="outline" onClick={() => { setFile(null); setRows([]); setPreview(null); }}>Cancel</Button>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-4">
          <h2 className="font-semibold mb-2">Recent Imports</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>File</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead>Skipped</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>{formatDate(b.uploaded_at)}</TableCell>
                  <TableCell className="text-xs">{b.file_name}</TableCell>
                  <TableCell>{b.total_rows}</TableCell>
                  <TableCell><Badge>{b.created_count}</Badge></TableCell>
                  <TableCell><Badge variant="secondary">{b.updated_count}</Badge></TableCell>
                  <TableCell>{b.skipped_count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
};

export default ImportAccounts;
