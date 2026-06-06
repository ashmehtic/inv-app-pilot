import { getAllProductCategories } from "@/lib/services/admin/prod-category";
import ProdCategoryPage from "@/components/custom/admin/ProdCategoryPage";

export default async function AddProductCategoryPage() {
  const categories = await getAllProductCategories();
  return <ProdCategoryPage categories={categories} />;
}
