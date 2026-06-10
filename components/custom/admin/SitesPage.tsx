"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Pagination, PaginationContent, PaginationItem,
  PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";
import { createSiteAction, updateSiteAction } from "@/lib/actions/admin/sites";

type Site = {
  siteId: string;
  siteName: string;
  siteAddress: string;
  activeYN: string;
};

type SiteEdit = {
  siteName: string;
  siteAddress: string;
  activeYN: string;
};

const PAGE_SIZE = 10;

type SortKey = keyof Site;
type SortDir = "asc" | "desc";

function SortIcon({ column, sortKey, sortDir }: { column: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (column !== sortKey) return <ChevronsUpDown className="inline w-3 h-3 ml-1 text-primary-foreground/50" />;
  return sortDir === "asc"
    ? <ChevronUp className="inline w-3 h-3 ml-1" />
    : <ChevronDown className="inline w-3 h-3 ml-1" />;
}

export default function SitesPage({ sites }: { sites: Site[] }) {
  const [siteName, setSiteName] = useState("");
  const [siteAddress, setSiteAddress] = useState("");
  const [addActiveYN, setAddActiveYN] = useState("Y");
  const [addError, setAddError] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  const [edits, setEdits] = useState<Record<string, SiteEdit>>({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("siteId");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [sortWarning, setSortWarning] = useState("");

  function handleSort(key: SortKey) {
    if (Object.keys(edits).length > 0) {
      setSortWarning("Sort order reflects saved values only. Save your changes first for accurate sorting.");
    } else {
      setSortWarning("");
    }
    if (key === sortKey) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  }

  const sorted = [...sites].sort((a, b) => {
    const aVal = a[sortKey].toLowerCase();
    const bVal = b[sortKey].toLowerCase();
    return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
  });

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAddError("");
    setAddLoading(true);

    const formData = new FormData();
    formData.append("siteName", siteName);
    formData.append("siteAddress", siteAddress);
    formData.append("activeYN", addActiveYN);

    const result = await createSiteAction(formData);
    if (!result.success) {
      setAddError(result.error || "Failed to add site");
    } else {
      setSiteName("");
      setSiteAddress("");
      setAddActiveYN("Y");
    }
    setAddLoading(false);
  }

  function getRowValue(row: Site, field: keyof SiteEdit): string {
    return edits[row.siteId]?.[field] ?? row[field];
  }

  function handleEditChange(row: Site, field: keyof SiteEdit, value: string) {
    setSaveSuccess(false);
    setEdits(prev => ({
      ...prev,
      [row.siteId]: {
        siteName: prev[row.siteId]?.siteName ?? row.siteName,
        siteAddress: prev[row.siteId]?.siteAddress ?? row.siteAddress,
        activeYN: prev[row.siteId]?.activeYN ?? row.activeYN,
        [field]: value,
      },
    }));
  }

  async function handleSave() {
    if (Object.keys(edits).length === 0) return;
    setSaveLoading(true);
    setSaveError("");
    setSaveSuccess(false);

    const results = await Promise.all(
      Object.entries(edits).map(([siteId, edit]) => {
        const formData = new FormData();
        formData.append("siteId", siteId);
        formData.append("siteName", edit.siteName);
        formData.append("siteAddress", edit.siteAddress);
        formData.append("activeYN", edit.activeYN);
        return updateSiteAction(formData);
      })
    );

    const failed = results.find(r => !r.success);
    if (failed) {
      setSaveError(failed.error || "Failed to save changes");
    } else {
      setEdits({});
      setSaveSuccess(true);
      setSortWarning("");
    }
    setSaveLoading(false);
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Add / Update Sites</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add New Site</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={siteName}
                onChange={e => setSiteName(e.target.value)}
                maxLength={50}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="siteAddress">Site Address</Label>
              <Input
                id="siteAddress"
                value={siteAddress}
                onChange={e => setSiteAddress(e.target.value)}
                maxLength={255}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="addActiveYN">Active (Y/N)</Label>
              <select
                id="addActiveYN"
                value={addActiveYN}
                onChange={e => setAddActiveYN(e.target.value)}
                className="h-9 w-24 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="Y">Y</option>
                <option value="N">N</option>
              </select>
            </div>
            {addError && <p className="text-sm text-destructive">{addError}</p>}
            <div>
              <Button type="submit" disabled={addLoading}>
                {addLoading ? "Adding..." : "Add"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          {sortWarning && (
            <p className="text-sm text-muted-foreground mb-3">{sortWarning}</p>
          )}
          <Table>
            <TableHeader className="bg-primary">
              <TableRow className="bg-primary text-primary-foreground hover:bg-primary border-primary">
                <TableHead>
                  <button onClick={() => handleSort("siteId")} className="flex items-center text-primary-foreground hover:text-primary-foreground/80">
                    Site ID <SortIcon column="siteId" sortKey={sortKey} sortDir={sortDir} />
                  </button>
                </TableHead>
                <TableHead>
                  <button onClick={() => handleSort("siteName")} className="flex items-center text-primary-foreground hover:text-primary-foreground/80">
                    Site Name <SortIcon column="siteName" sortKey={sortKey} sortDir={sortDir} />
                  </button>
                </TableHead>
                <TableHead>
                  <button onClick={() => handleSort("siteAddress")} className="flex items-center text-primary-foreground hover:text-primary-foreground/80">
                    Site Address <SortIcon column="siteAddress" sortKey={sortKey} sortDir={sortDir} />
                  </button>
                </TableHead>
                <TableHead>
                  <button onClick={() => handleSort("activeYN")} className="flex items-center text-primary-foreground hover:text-primary-foreground/80">
                    Active (Y/N) <SortIcon column="activeYN" sortKey={sortKey} sortDir={sortDir} />
                  </button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                    No sites found.
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map(row => (
                  <TableRow key={row.siteId} className={edits[row.siteId] !== undefined ? "bg-primary/10" : ""}>
                    <TableCell>{row.siteId}</TableCell>
                    <TableCell>
                      <Input
                        value={getRowValue(row, "siteName")}
                        onChange={e => handleEditChange(row, "siteName", e.target.value)}
                        maxLength={50}
                        className="h-8"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={getRowValue(row, "siteAddress")}
                        onChange={e => handleEditChange(row, "siteAddress", e.target.value)}
                        maxLength={255}
                        className="h-8 min-w-80"
                      />
                    </TableCell>
                    <TableCell>
                      <select
                        value={getRowValue(row, "activeYN")}
                        onChange={e => handleEditChange(row, "activeYN", e.target.value)}
                        className="h-8 rounded-md border border-input bg-background px-2 text-sm"
                      >
                        <option value="Y">Y</option>
                        <option value="N">N</option>
                      </select>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={e => { e.preventDefault(); setPage(p => Math.max(1, p - 1)); }}
                      aria-disabled={page === 1}
                      className={page === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <PaginationItem key={p}>
                      <PaginationLink
                        href="#"
                        isActive={p === page}
                        onClick={e => { e.preventDefault(); setPage(p); }}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={e => { e.preventDefault(); setPage(p => Math.min(totalPages, p + 1)); }}
                      aria-disabled={page === totalPages}
                      className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {saveError && <p className="text-sm text-destructive">{saveError}</p>}
      {saveSuccess && <p className="text-sm text-primary">Changes saved successfully.</p>}

      <div>
        <Button
          onClick={handleSave}
          disabled={saveLoading || Object.keys(edits).length === 0}
        >
          {saveLoading ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
