import NavBar from "@/components/custom/NavBar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavBar />
      {children}
    </>
  );
}
