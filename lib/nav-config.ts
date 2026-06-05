export type NavItem = {
  label: string;
  href: string;
};

export type NavMenu = {
  label: string;
  items: NavItem[];
};

export const navConfig: Record<string, NavMenu[]> = {
  SUPER_ADMIN: [
    {
      label: "Admin",
      items: [{ label: "Add Sites", href: "/admin/sites/add" }],
    },
  ],
  INV_APP_USER: [
    {
      label: "Submit Requests",
      items: [{ label: "Request Items", href: "/requests/items" }],
    },
  ],
};
