import { http } from "../httpClient";
import { ENDPOINTS, USE_MOCK } from "../endpoints";
import { mockDelay } from "../../mocks/mockData";
import { buildDashboardSummary } from "../../mocks/buildDashboardSummary";

const getSummary = async (eventId = "all") => {
  if (!USE_MOCK)
    return http.get(`${ENDPOINTS.dashboard.summary}?eventId=${eventId}`);
  await mockDelay(350);
  return buildDashboardSummary(eventId);
};

export const dashboardService = { getSummary };
