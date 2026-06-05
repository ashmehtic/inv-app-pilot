import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { auth, signOut } from "@/lib/auth";
import { navConfig } from "@/lib/nav-config";
import { Button } from "@/components/ui/button";

export default async function NavBar() {
  const session = await auth();
  if (!session?.user) return null;

  const roles = session.user.roles ?? [];
  const menus = roles.flatMap((role) => navConfig[role] ?? []);

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <nav className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="font-semibold text-lg tracking-tight">
            Inventory App
          </Link>
          {menus.map((menu) => (
            <div key={menu.label} className="relative group">
              <button className="flex items-center gap-1 px-3 py-2 rounded text-sm font-medium hover:bg-primary-foreground/10">
                {menu.label}
                <ChevronDown className="w-4 h-4" />
              </button>
              <div className="absolute top-full left-0 z-50 hidden group-hover:block bg-popover text-popover-foreground shadow-lg rounded min-w-40 py-1">
                {menu.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-primary-foreground/70">{session.user.name}</span>
          <form action={handleSignOut}>
            <Button type="submit" variant="secondary" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </nav>
  );
}
