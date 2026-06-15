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
import {
  getProductsByCategoryAction,
  createProgramTemplateAction,
} from "@/lib/actions/admin/program-templates";

type ProductCategoryOption = {
  prodCategoryId: string;
  prodCategory: string;
};

type DetailRow = {
  productId: string;
  productName: string;
  prodCategory: string;
  quantity: string;
  productUnit: string;
  trackProductYN: string;
};

const PAGE_SIZE = 30;

type SortKey = keyof DetailRow;
type SortDir = "asc" | "desc";

function SortIcon({ column, sortKey, sortDir }: { column: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (column !== sortKey) return <ChevronsUpDown className="inline w-3 h-3 ml-1 text-primary-foreground/50" />;
  return sortDir === "asc"
    ? <ChevronUp className="inline w-3 h-3 ml-1" />
    : <ChevronDown className="inline w-3 h-3 ml-1" />;
}

export default function ProgramTemplatePage({
  categories,
}: {
  categories: ProductCategoryOption[];
}) {
  const [progTemplateId, setProgTemplateId] = useState("");
  const [progTemplateName, setProgTemplateName] = useState("");
  const [progNotes, setProgNotes] = useState("");
  const [activeYN, setActiveYN] = useState("Y");

  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");

  const [rows, setRows] = useState<DetailRow[]>([]);

  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);

  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("productId");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  }

  const sorted = [...rows].sort((a, b) => {
    if (sortKey === "quantity") {
      const diff = Number(a.quantity) - Number(b.quantity);
      return sortDir === "asc" ? diff : -diff;
    }
    const aVal = a[sortKey].toLowerCase();
    const bVal = b[sortKey].toLowerCase();
    return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
  });

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function handleAddCategory() {
    if (!selectedCategoryId) return;
    setAddError("");
    setSaveError("");
    setAddLoading(true);

    const products = await getProductsByCategoryAction(selectedCategoryId);

    setRows(prev => {
      const existingIds = new Set(prev.map(r => r.productId));
      const newRows: DetailRow[] = products
        .filter(p => !existingIds.has(p.productId))
        .map(p => ({
          productId: p.productId,
          productName: p.productName,
          prodCategory: p.productCategory.prodCategory,
          quantity: String(p.defaultQuantity),
          productUnit: p.productUnit,
          trackProductYN: p.trackProductYN,
        }));
      return [...prev, ...newRows];
    });

    setAddLoading(false);
  }

  function handleQuantityChange(productId: string, value: string) {
    setRows(prev => prev.map(r => r.productId === productId ? { ...r, quantity: value } : r));
  }

  function handleRemoveRow(productId: string) {
    setRows(prev => prev.filter(r => r.productId !== productId));
  }

  async function handleSaveTemplate() {
    setSaveError("");

    if (!progTemplateName.trim()) {
      setSaveError("Program Template Title is required");
      return;
    }
    if (rows.length === 0) {
      setSaveError("At least one product must be added to the template");
      return;
    }
    const invalidQty = rows.find(r => !Number.isInteger(Number(r.quantity)) || Number(r.quantity) <= 0);
    if (invalidQty) {
      setSaveError(`Quantity for ${invalidQty.productId} must be a valid integer greater than 0`);
      return;
    }

    setSaveLoading(true);

    const result = await createProgramTemplateAction({
      progTemplateName,
      progNotes,
      activeYN,
      details: rows.map(r => ({
        productId: r.productId,
        quantity: Number(r.quantity),
        productUnit: r.productUnit,
        trackProductYN: r.trackProductYN,
      })),
    });

    if (!result.success) {
      setSaveError(result.error || "Failed to save template");
    } else {
      setProgTemplateId(result.progTemplateId);
      setSaved(true);
    }
    setSaveLoading(false);
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Add Program Template</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Program Template Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="progTemplateId">Program Template ID</Label>
              <Input
                id="progTemplateId"
                value={progTemplateId || "(auto-generated on save)"}
                readOnly
                disabled
                className="w-56"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="progTemplateName">Program Template Title</Label>
              <Input
                id="progTemplateName"
                value={progTemplateName}
                onChange={e => setProgTemplateName(e.target.value)}
                maxLength={100}
                required
                disabled={saved}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="progNotes">Notes</Label>
              <Input
                id="progNotes"
                value={progNotes}
                onChange={e => setProgNotes(e.target.value)}
                maxLength={200}
                disabled={saved}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="activeYN">Active (Y/N)</Label>
              <select
                id="activeYN"
                value={activeYN}
                onChange={e => setActiveYN(e.target.value)}
                disabled={saved}
                className="h-9 w-24 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="Y">Y</option>
                <option value="N">N</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div className="flex items-end gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="prodCategory">Product Category</Label>
                <select
                  id="prodCategory"
                  value={selectedCategoryId}
                  onChange={e => setSelectedCategoryId(e.target.value)}
                  disabled={saved}
                  className="h-9 w-56 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">-- Select --</option>
                  {categories.map(c => (
                    <option key={c.prodCategoryId} value={c.prodCategoryId}>
                      {c.prodCategory}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                type="button"
                onClick={handleAddCategory}
                disabled={!selectedCategoryId || addLoading || saved}
              >
                {addLoading ? "Adding..." : "Add"}
              </Button>
            </div>
            <div className="flex items-end gap-3">
              <Button
                type="button"
                onClick={handleSaveTemplate}
                disabled={saveLoading || saved}
              >
                {saveLoading ? "Saving..." : "Save Template"}
              </Button>
              <Button type="button" variant="secondary" asChild>
                <a
                  href={saved ? `/api/admin/program-templates/export?progTemplateId=${progTemplateId}` : undefined}
                  aria-disabled={!saved}
                  className={!saved ? "pointer-events-none opacity-50" : ""}
                >
                  Export All
                </a>
              </Button>
            </div>
          </div>

          {addError && <p className="text-sm text-destructive mt-2">{addError}</p>}
          {saveError && <p className="text-sm text-destructive mt-2">{saveError}</p>}
          {saved && <p className="text-sm text-primary mt-2">Template saved successfully as {progTemplateId}.</p>}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <Table>
            <TableHeader className="bg-primary">
              <TableRow className="bg-primary text-primary-foreground hover:bg-primary border-primary">
                <TableHead>
                  <button onClick={() => handleSort("productId")} className="flex items-center text-primary-foreground hover:text-primary-foreground/80">
                    Product ID <SortIcon column="productId" sortKey={sortKey} sortDir={sortDir} />
                  </button>
                </TableHead>
                <TableHead>
                  <button onClick={() => handleSort("productName")} className="flex items-center text-primary-foreground hover:text-primary-foreground/80">
                    Product Name <SortIcon column="productName" sortKey={sortKey} sortDir={sortDir} />
                  </button>
                </TableHead>
                <TableHead>
                  <button onClick={() => handleSort("prodCategory")} className="flex items-center text-primary-foreground hover:text-primary-foreground/80">
                    Product Category <SortIcon column="prodCategory" sortKey={sortKey} sortDir={sortDir} />
                  </button>
                </TableHead>
                <TableHead>
                  <button onClick={() => handleSort("quantity")} className="flex items-center text-primary-foreground hover:text-primary-foreground/80">
                    Quantity <SortIcon column="quantity" sortKey={sortKey} sortDir={sortDir} />
                  </button>
                </TableHead>
                <TableHead>
                  <button onClick={() => handleSort("productUnit")} className="flex items-center text-primary-foreground hover:text-primary-foreground/80">
                    Product Unit <SortIcon column="productUnit" sortKey={sortKey} sortDir={sortDir} />
                  </button>
                </TableHead>
                <TableHead>
                  <button onClick={() => handleSort("trackProductYN")} className="flex items-center text-primary-foreground hover:text-primary-foreground/80">
                    Track Product <SortIcon column="trackProductYN" sortKey={sortKey} sortDir={sortDir} />
                  </button>
                </TableHead>
                <TableHead>
                  <span className="text-primary-foreground">Remove</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-6">
                    No products added yet. Select a Product Category above and click &quot;Add&quot;.
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map(row => (
                  <TableRow key={row.productId}>
                    <TableCell>{row.productId}</TableCell>
                    <TableCell>{row.productName}</TableCell>
                    <TableCell>{row.prodCategory}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={1}
                        step={1}
                        value={row.quantity}
                        onChange={e => handleQuantityChange(row.productId, e.target.value)}
                        disabled={saved}
                        className="h-8 w-20"
                      />
                    </TableCell>
                    <TableCell>{row.productUnit}</TableCell>
                    <TableCell>{row.trackProductYN}</TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveRow(row.productId)}
                        disabled={saved}
                      >
                        Remove
                      </Button>
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
    </div>
  );
}
