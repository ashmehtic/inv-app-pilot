"use client";

import { useState } from "react";
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
  createProductCategoryAction,
  updateProductCategoryActiveYNAction,
} from "@/lib/actions/admin/prod-category";

type ProductCategory = {
  prodCategoryId: string;
  prodCategory: string;
  activeYN: string;
};

const PAGE_SIZE = 10;

export default function ProdCategoryPage({ categories }: { categories: ProductCategory[] }) {
  const [prodCategory, setProdCategory] = useState("");
  const [addActiveYN, setAddActiveYN] = useState("Y");
  const [addError, setAddError] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  const [edits, setEdits] = useState<Record<string, string>>({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(categories.length / PAGE_SIZE);
  const paginated = categories.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAddError("");
    setAddLoading(true);

    const formData = new FormData();
    formData.append("prodCategory", prodCategory);
    formData.append("activeYN", addActiveYN);

    const result = await createProductCategoryAction(formData);
    if (!result.success) {
      setAddError(result.error || "Failed to add category");
    } else {
      setProdCategory("");
      setAddActiveYN("Y");
    }
    setAddLoading(false);
  }

  function handleActiveYNChange(id: string, value: string) {
    setSaveSuccess(false);
    setEdits(prev => ({ ...prev, [id]: value }));
  }

  async function handleSave() {
    if (Object.keys(edits).length === 0) return;
    setSaveLoading(true);
    setSaveError("");
    setSaveSuccess(false);

    const results = await Promise.all(
      Object.entries(edits).map(([id, activeYN]) => {
        const formData = new FormData();
        formData.append("prodCategoryId", id);
        formData.append("activeYN", activeYN);
        return updateProductCategoryActiveYNAction(formData);
      })
    );

    const failed = results.find(r => !r.success);
    if (failed) {
      setSaveError(failed.error || "Failed to save changes");
    } else {
      setEdits({});
      setSaveSuccess(true);
    }
    setSaveLoading(false);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Add / Update Product Category</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add New Category</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="prodCategory">Product Category</Label>
              <Input
                id="prodCategory"
                value={prodCategory}
                onChange={e => setProdCategory(e.target.value)}
                maxLength={25}
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Category ID</TableHead>
                <TableHead>Product Category</TableHead>
                <TableHead>Active (Y/N)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                    No categories found.
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map(row => (
                  <TableRow key={row.prodCategoryId}>
                    <TableCell>{row.prodCategoryId}</TableCell>
                    <TableCell>{row.prodCategory}</TableCell>
                    <TableCell>
                      <select
                        value={edits[row.prodCategoryId] ?? row.activeYN}
                        onChange={e => handleActiveYNChange(row.prodCategoryId, e.target.value)}
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
