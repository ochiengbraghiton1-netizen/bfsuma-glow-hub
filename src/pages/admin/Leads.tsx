import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, Users, Mail } from "lucide-react";
import { format } from "date-fns";

const Leads = () => {
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const { data: leads, isLoading } = useQuery({
    queryKey: ["admin-leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: products } = useQuery({
    queryKey: ["admin-leads-products"],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("id, name");
      if (error) throw error;
      return data;
    },
  });

  const productMap = useMemo(() => {
    const map: Record<string, string> = {};
    (products || []).forEach((p) => {
      map[p.id.toLowerCase()] = p.name;
    });
    return map;
  }, [products]);

  const displaySource = (source: string | null) => formatLeadSource(source, productMap);


  const filtered = useMemo(() => {
    if (!leads) return [];
    return leads.filter((lead) => {
      const matchSearch =
        !search ||
        lead.email.toLowerCase().includes(search.toLowerCase()) ||
        (lead.name && lead.name.toLowerCase().includes(search.toLowerCase()));
      const matchFrom = !dateFrom || lead.created_at >= dateFrom;
      const matchTo = !dateTo || lead.created_at <= dateTo + "T23:59:59";
      return matchSearch && matchFrom && matchTo;
    });
  }, [leads, search, dateFrom, dateTo]);

  const exportCSV = () => {
    if (!filtered.length) return;
    const headers = ["Email", "Name", "Source", "Date", "Status"];
    const rows = filtered.map((l) => [
      l.email,
      l.name || "",
      displaySource(l.source),
      format(new Date(l.created_at), "yyyy-MM-dd HH:mm"),
      l.subscribed ? "Subscribed" : "Unsubscribed",
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalLeads = leads?.length || 0;
  const subscribedCount = leads?.filter((l) => l.subscribed).length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Leads</h1>
          <p className="text-muted-foreground text-sm">Captured email leads from website popups and forms</p>
        </div>
        <Button variant="outline" onClick={exportCSV} disabled={!filtered.length}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalLeads}</p>
              <p className="text-sm text-muted-foreground">Total Leads</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Mail className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{subscribedCount}</p>
              <p className="text-sm text-muted-foreground">Subscribed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by email or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">From</label>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-40" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">To</label>
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-40" />
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Source</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
                </TableRow>
              ) : !filtered.length ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No leads found.</TableCell>
                </TableRow>
              ) : (
                filtered.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.email}</TableCell>
                    <TableCell>{lead.name || "—"}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline" className="text-xs">{displaySource(lead.source)}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(lead.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={lead.subscribed ? "default" : "secondary"} className="text-xs">
                        {lead.subscribed ? "Subscribed" : "Unsubscribed"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Leads;
