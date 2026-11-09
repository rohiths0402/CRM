import { http } from "../httpClient";
import { ENDPOINTS, USE_MOCK } from "../endpoints";
import { mockEventLocations, mockDelay } from "../../mocks/mockData";

const getLocations = async () => {
  if (!USE_MOCK) return http.get(ENDPOINTS.events.locations);
  await mockDelay(500);
  return mockEventLocations;
};

export const eventService = { getLocations };
