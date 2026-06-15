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
      items: [
        { label: "Add Sites", href: "/sites/add" },
        { label: "Add Product Category", href: "/product-category/add" },
        { label: "Add / Update Product Master List", href: "/product-master/add" },
      ],
    },
    {
      label: "Program Templates",
      items: [
        { label: "Create New Program Template", href: "/program-templates/add" },
      ],
    },
  ],
  INV_APP_USER: [
    {
      label: "Submit Requests",
      items: [{ label: "Request Items", href: "/requests/items" }],
    },
  ],
};
