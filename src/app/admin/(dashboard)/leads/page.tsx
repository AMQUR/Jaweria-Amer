"use client";

import { useEffect, useState, useCallback } from "react";
import { Trash2, Users, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { updateLeadStatusAction, deleteLeadAction } from "@/lib/admin/actions";
import type { Lead } from "@/lib/admin/store";

const statusOptions = [
  { value: "new", label: "New", className: "bg-brand-soft text-brand" },
  { value: "contacted", label: "Contacted", className: "bg-amber-50 text-amber-700" },
  { value: "enrolled", label: "Enrolled", className: "bg-green-50 text-green-700" },
];

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/leads");
      const data = res.ok ? await res.json() : null;
      setLeads(Array.isArray(data) ? data : null);
    } catch {
      setLeads(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  async function handleStatusChange(id: string, status: string) {
    setLeads((prev) => (prev ?? []).map((l) => l.id === id ? { ...l, status: status as Lead["status"] } : l));
    toast.success(`Status updated to ${status}`);
    await updateLeadStatusAction(id, status as Lead["status"]);
  }

  async function handleDelete(id: string) {
    setLeads((prev) => (prev ?? []).filter((l) => l.id !== id));
    toast.success("Lead removed");
    await deleteLeadAction(id);
    fetchLeads();
  }

  if (!loading && leads === null) {
    return <div />;
  }

  const list = leads ?? [];
  const newCount = list.filter((l) => l.status === "new").length;
  const contactedCount = list.filter((l) => l.status === "contacted").length;
  const enrolledCount = list.filter((l) => l.status === "enrolled").length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink">Leads & Inquiries</h1>
        <p className="text-sm text-slate mt-1">Track and manage student inquiries</p>
      </div>

      {!loading && list.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-lg bg-brand-soft p-3 text-center shadow-sm">
            <p className="font-serif text-xl font-bold text-brand">{newCount}</p>
            <p className="text-xs text-brand/80">New</p>
          </div>
          <div className="rounded-lg bg-amber-50 p-3 text-center shadow-sm">
            <p className="font-serif text-xl font-bold text-amber-700">{contactedCount}</p>
            <p className="text-xs text-amber-700/80">Contacted</p>
          </div>
          <div className="rounded-lg bg-green-50 p-3 text-center shadow-sm">
            <p className="font-serif text-xl font-bold text-green-700">{enrolledCount}</p>
            <p className="text-xs text-green-700/80">Enrolled</p>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border/60 bg-white shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-light text-sm">Loading leads...</div>
        ) : list.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-slate-light/40 mx-auto mb-3" />
            <p className="text-sm font-medium text-ink mb-1">No new inquiries</p>
            <p className="text-xs text-slate-light">Inquiries from the website will appear here.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-16">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium text-ink">{lead.name}</TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1 text-xs text-slate">
                        <Mail className="w-3 h-3" /> {lead.email}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-light">
                        <Phone className="w-3 h-3" /> {lead.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-slate max-w-xs truncate">{lead.message}</TableCell>
                  <TableCell className="text-xs text-slate-light">{lead.source}</TableCell>
                  <TableCell>
                    <select
                      value={lead.status}
                      onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                      className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer ${
                        statusOptions.find((s) => s.value === lead.status)?.className || ""
                      }`}
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => handleDelete(lead.id)}
                      className="rounded-lg p-1.5 text-slate transition-colors hover:bg-brand-soft hover:text-brand"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
