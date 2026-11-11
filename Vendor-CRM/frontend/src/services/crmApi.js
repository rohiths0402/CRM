import api from "./api";

/**
 * One client per backend module. Every module has the same five endpoints:
 * list(), get(id), create(payload), update(id, payload), remove(id).
 * Records come back with a numeric `id`; `id` in a payload is ignored by the server.
 */
function createResource(path) {
  return {
    list: (options) => api.get(path, options),
    get: (id) => api.get(`${path}/${id}`),
    create: (payload) => api.post(path, payload),
    update: (id, payload) => api.put(`${path}/${id}`, payload),
    remove: (id) => api.delete(`${path}/${id}`),
  };
}

export const ottProjectsApi = createResource("/ott-projects");
export const castCrewApi = createResource("/cast-crew");
export const schedulesApi = createResource("/schedules");
export const locationsApi = createResource("/locations");
export const expensesApi = createResource("/expenses");
export const contractsApi = createResource("/contracts");
export const tasksApi = createResource("/tasks");
export const teamMembersApi = createResource("/team-members");
export const paymentsApi = createResource("/payments");

/** { projects: [{ id, name, budget, spent, remaining, percentage }], totals: { budget, spent, remaining, unpaid } } */
export const budgetsApi = {
  summary: (projectId) =>
    api.get(projectId ? `/budgets?projectId=${encodeURIComponent(projectId)}` : "/budgets"),
};

/** See backend DashboardService.Summary for the response shape. */
export const dashboardApi = {
  summary: (options) => api.get("/dashboard", options),
};

// Vendor CRM. Records link to a vendor (and to quotations, orders and invoices) by numeric id.
export const vendorsApi = createResource("/vendor/vendors");
export const quotationsApi = createResource("/vendor/quotations");
export const purchaseOrdersApi = createResource("/vendor/purchase-orders");
export const vendorInvoicesApi = createResource("/vendor/invoices");
export const vendorPaymentsApi = createResource("/vendor/payments");
export const vendorDocumentsApi = createResource("/vendor/documents");

/** See backend VendorDashboardService.Summary for the response shape. */
export const vendorDashboardApi = {
  summary: (options) => api.get("/vendor/dashboard", options),
};

/** OTT project names; works for vendor-only logins, which can't read /ott-projects. */
export const vendorProjectsApi = {
  list: () => api.get("/vendor/projects"),
};

/** Admin only. Users have { id, fullName, company, email, mobile, access, admin, createdAt }. */
export const usersApi = createResource("/users");

/** Project names for dropdowns that link records to an OTT project by name. */
export async function fetchProjectNames() {
  const projects = await ottProjectsApi.list();
  return projects.map((project) => project.projectName);
}

/**
 * The backend returns null for empty optional values; form inputs need "".
 * Use when copying a record into form state.
 */
export function toFormValues(record) {
  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => [key, value ?? ""])
  );
}
