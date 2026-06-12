import { getAllProducts, getActiveProductCategories } from "@/lib/services/admin/product-master";
import ProductMasterPage from "@/components/custom/admin/ProductMasterPage";

export default async function AddProductMasterPage() {
  const [products, categories] = await Promise.all([
    getAllProducts(),
    getActiveProductCategories(),
  ]);

  return <ProductMasterPage products={products} categories={categories} />;
}
