import { getActiveProductCategories } from "@/lib/services/admin/product-master";
import ProgramTemplatePage from "@/components/custom/admin/ProgramTemplatePage";

export default async function AddProgramTemplatePage() {
  const categories = await getActiveProductCategories();

  return <ProgramTemplatePage categories={categories} />;
}
