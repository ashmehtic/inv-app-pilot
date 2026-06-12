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
import { createProductAction, updateProductAction } from "@/lib/actions/admin/product-master";
import { PRODUCT_TYPES, PRODUCT_UNITS, type ProductType, type ProductUnit } from "@/lib/lookup-master/lookup-master";

type Product = {
  productId: string;
  prodCategoryId: string;
  productName: string;
  productType: string;
  defaultQuantity: number;
  productUnit: string;
  trackProductYN: string;
  activeYN: string;
  productCategory: { prodCategory: string };
};

type ProductCategoryOption = {
  prodCategoryId: string;
  prodCategory: string;
};

type ProductRow = {
  productId: string;
  prodCategory: string;
  productName: string;
  productType: string;
  defaultQuantity: string;
  productUnit: string;
  trackProductYN: string;
  activeYN: string;
};

type ProductEdit = Omit<ProductRow, "productId" | "prodCategory">;

const PAGE_SIZE = 30;

type SortKey = keyof ProductRow;
type SortDir = "asc" | "desc";

function SortIcon({ column, sortKey, sortDir }: { column: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (column !== sortKey) return <ChevronsUpDown className="inline w-3 h-3 ml-1 text-primary-foreground/50" />;
  return sortDir === "asc"
    ? <ChevronUp className="inline w-3 h-3 ml-1" />
    : <ChevronDown className="inline w-3 h-3 ml-1" />;
}

export default function ProductMasterPage({
  products,
  categories,
}: {
  products: Product[];
  categories: ProductCategoryOption[];
}) {
  const [prodCategoryId, setProdCategoryId] = useState("");
  const [productName, setProductName] = useState("");
  const [productType, setProductType] = useState<ProductType>(PRODUCT_TYPES[0].value);
  const [defaultQuantity, setDefaultQuantity] = useState("");
  const [productUnit, setProductUnit] = useState<ProductUnit>(PRODUCT_UNITS[0].value);
  const [addTrackProductYN, setAddTrackProductYN] = useState("N");
  const [addActiveYN, setAddActiveYN] = useState("Y");
  const [addError, setAddError] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  const [edits, setEdits] = useState<Record<string, ProductEdit>>({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("productId");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [sortWarning, setSortWarning] = useState("");

  const rows: ProductRow[] = products.map(p => ({
    productId: p.productId,
    prodCategory: p.productCategory.prodCategory,
    productName: p.productName,
    productType: p.productType,
    defaultQuantity: String(p.defaultQuantity),
    productUnit: p.productUnit,
    trackProductYN: p.trackProductYN,
    activeYN: p.activeYN,
  }));

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

  const sorted = [...rows].sort((a, b) => {
    if (sortKey === "defaultQuantity") {
      const diff = Number(a.defaultQuantity) - Number(b.defaultQuantity);
      return sortDir === "asc" ? diff : -diff;
    }
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
    formData.append("prodCategoryId", prodCategoryId);
    formData.append("productName", productName);
    formData.append("productType", productType);
    formData.append("defaultQuantity", defaultQuantity);
    formData.append("productUnit", productUnit);
    formData.append("trackProductYN", addTrackProductYN);
    formData.append("activeYN", addActiveYN);

    const result = await createProductAction(formData);
    if (!result.success) {
      setAddError(result.error || "Failed to add product");
    } else {
      setProdCategoryId("");
      setProductName("");
      setProductType(PRODUCT_TYPES[0].value);
      setDefaultQuantity("");
      setProductUnit(PRODUCT_UNITS[0].value);
      setAddTrackProductYN("N");
      setAddActiveYN("Y");
    }
    setAddLoading(false);
  }

  function getRowValue(row: ProductRow, field: keyof ProductEdit): string {
    return edits[row.productId]?.[field] ?? row[field];
  }

  function handleEditChange(row: ProductRow, field: keyof ProductEdit, value: string) {
    setSaveSuccess(false);
    setEdits(prev => ({
      ...prev,
      [row.productId]: {
        productName: prev[row.productId]?.productName ?? row.productName,
        productType: prev[row.productId]?.productType ?? row.productType,
        defaultQuantity: prev[row.productId]?.defaultQuantity ?? row.defaultQuantity,
        productUnit: prev[row.productId]?.productUnit ?? row.productUnit,
        trackProductYN: prev[row.productId]?.trackProductYN ?? row.trackProductYN,
        activeYN: prev[row.productId]?.activeYN ?? row.activeYN,
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
      Object.entries(edits).map(([productId, edit]) => {
        const formData = new FormData();
        formData.append("productId", productId);
        formData.append("productName", edit.productName);
        formData.append("productType", edit.productType);
        formData.append("defaultQuantity", edit.defaultQuantity);
        formData.append("productUnit", edit.productUnit);
        formData.append("trackProductYN", edit.trackProductYN);
        formData.append("activeYN", edit.activeYN);
        return updateProductAction(formData);
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
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Add / Update Product Master</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add New Product</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="prodCategoryId">Product Category</Label>
              <select
                id="prodCategoryId"
                value={prodCategoryId}
                onChange={e => setProdCategoryId(e.target.value)}
                required
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">-- Select --</option>
                {categories.map(c => (
                  <option key={c.prodCategoryId} value={c.prodCategoryId}>
                    {c.prodCategory}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="productName">Product Name</Label>
              <Input
                id="productName"
                value={productName}
                onChange={e => setProductName(e.target.value)}
                maxLength={100}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="productType">Product Type</Label>
              <select
                id="productType"
                value={productType}
                onChange={e => setProductType(e.target.value as ProductType)}
                required
                className="h-9 w-40 rounded-md border border-input bg-background px-3 text-sm"
              >
                {PRODUCT_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="defaultQuantity">Default Quantity</Label>
              <Input
                id="defaultQuantity"
                type="number"
                min={1}
                step={1}
                value={defaultQuantity}
                onChange={e => setDefaultQuantity(e.target.value)}
                required
                className="w-32"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="productUnit">Product Unit</Label>
              <select
                id="productUnit"
                value={productUnit}
                onChange={e => setProductUnit(e.target.value as ProductUnit)}
                required
                className="h-9 w-40 rounded-md border border-input bg-background px-3 text-sm"
              >
                {PRODUCT_UNITS.map(u => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="addTrackProductYN">Track Product (Y/N)</Label>
              <select
                id="addTrackProductYN"
                value={addTrackProductYN}
                onChange={e => setAddTrackProductYN(e.target.value)}
                className="h-9 w-24 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="Y">Y</option>
                <option value="N">N</option>
              </select>
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
                  <button onClick={() => handleSort("productId")} className="flex items-center text-primary-foreground hover:text-primary-foreground/80">
                    Product ID <SortIcon column="productId" sortKey={sortKey} sortDir={sortDir} />
                  </button>
                </TableHead>
                <TableHead>
                  <button onClick={() => handleSort("prodCategory")} className="flex items-center text-primary-foreground hover:text-primary-foreground/80">
                    Product Category <SortIcon column="prodCategory" sortKey={sortKey} sortDir={sortDir} />
                  </button>
                </TableHead>
                <TableHead>
                  <button onClick={() => handleSort("productName")} className="flex items-center text-primary-foreground hover:text-primary-foreground/80">
                    Product Name <SortIcon column="productName" sortKey={sortKey} sortDir={sortDir} />
                  </button>
                </TableHead>
                <TableHead>
                  <button onClick={() => handleSort("productType")} className="flex items-center text-primary-foreground hover:text-primary-foreground/80">
                    Product Type <SortIcon column="productType" sortKey={sortKey} sortDir={sortDir} />
                  </button>
                </TableHead>
                <TableHead>
                  <button onClick={() => handleSort("defaultQuantity")} className="flex items-center text-primary-foreground hover:text-primary-foreground/80">
                    Default Quantity <SortIcon column="defaultQuantity" sortKey={sortKey} sortDir={sortDir} />
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
                  <button onClick={() => handleSort("activeYN")} className="flex items-center text-primary-foreground hover:text-primary-foreground/80">
                    Active (Y/N) <SortIcon column="activeYN" sortKey={sortKey} sortDir={sortDir} />
                  </button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-6">
                    No products found.
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map(row => (
                  <TableRow key={row.productId} className={edits[row.productId] !== undefined ? "bg-primary/10" : ""}>
                    <TableCell>{row.productId}</TableCell>
                    <TableCell>{row.prodCategory}</TableCell>
                    <TableCell>
                      <Input
                        value={getRowValue(row, "productName")}
                        onChange={e => handleEditChange(row, "productName", e.target.value)}
                        maxLength={100}
                        className="h-8 min-w-40"
                      />
                    </TableCell>
                    <TableCell>
                      <select
                        value={getRowValue(row, "productType")}
                        onChange={e => handleEditChange(row, "productType", e.target.value)}
                        className="h-8 rounded-md border border-input bg-background px-2 text-sm"
                      >
                        {PRODUCT_TYPES.map(t => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={1}
                        step={1}
                        value={getRowValue(row, "defaultQuantity")}
                        onChange={e => handleEditChange(row, "defaultQuantity", e.target.value)}
                        className="h-8 w-20"
                      />
                    </TableCell>
                    <TableCell>
                      <select
                        value={getRowValue(row, "productUnit")}
                        onChange={e => handleEditChange(row, "productUnit", e.target.value)}
                        className="h-8 rounded-md border border-input bg-background px-2 text-sm"
                      >
                        {PRODUCT_UNITS.map(u => (
                          <option key={u.value} value={u.value}>{u.label}</option>
                        ))}
                      </select>
                    </TableCell>
                    <TableCell>
                      <select
                        value={getRowValue(row, "trackProductYN")}
                        onChange={e => handleEditChange(row, "trackProductYN", e.target.value)}
                        className="h-8 rounded-md border border-input bg-background px-2 text-sm"
                      >
                        <option value="Y">Y</option>
                        <option value="N">N</option>
                      </select>
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
