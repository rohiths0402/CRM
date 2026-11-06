import { http } from "../httpClient";
import { ENDPOINTS, USE_MOCK } from "../endpoints";
import { mockDashboardSummary, mockDelay } from "../../mocks/mockData";

const getSummary = async () => {
  if (!USE_MOCK) return http.get(ENDPOINTS.dashboard.summary);
  await mockDelay(400);
  return mockDashboardSummary;
};

export const dashboardService = { getSummary };
