import { getAllSites } from "@/lib/services/admin/sites";
import SitesPage from "@/components/custom/admin/SitesPage";

export default async function AddSitesPage() {
  const sites = await getAllSites();
  return <SitesPage sites={sites} />;
}
