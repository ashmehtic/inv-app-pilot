import NavBar from "@/components/custom/NavBar";

export default function InventoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavBar />
      {children}
    </>
  );
}
