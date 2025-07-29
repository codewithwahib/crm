export type Role = "mechanical" | "execution" | "sales" | "owner";

// ✅ Which pages each role can access
export const roleAccess: Record<Role, string[]> = {
  mechanical: [
    "/dashboard/mechanical/work-orders-status",
    "/dashboard/mechanical/drawings",
  ],
  execution: [
    "/dashboard/execution",
    "/dashboard/execution/quotations",
    "/dashboard/execution/work-orders",
    "/dashboard/execution/work-orders-status",
    "/dashboard/execution/documents",
    "/dashboard/execution/manage-quotations",
    "/dashboard/execution/manage-work-orders",
    "/dashboard/execution/manage-documents",
  ],
  sales: [
    "/dashboard/sales",
    "/dashboard/sales/contacts",
    "/dashboard/sales/quotations",
    "/dashboard/sales/work-orders",
    "/dashboard/sales/work-orders-status",
    "/dashboard/sales/visit-log",
    "/dashboard/sales/documents",
  ],
  owner: [
    "/dashboard/owner",
    "/dashboard/owner/contacts",
    "/dashboard/owner/quotations",
    "/dashboard/owner/work-orders",
    "/dashboard/owner/work-orders-status",
    "/dashboard/owner/sales-visit-log",
    "/dashboard/owner/documents",
    "/dashboard/owner/inventory",
    "/dashboard/owner/manage-quotations",
    "/dashboard/owner/manage-work-orders",
    "/dashboard/owner/manage-documents",
    "/dashboard/owner/manage-inventory",
  ],
};
