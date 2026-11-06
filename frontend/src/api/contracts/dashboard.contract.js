export const dashboardContract = {
  summary: {
    method: "GET",
    url: "/dashboard/summary",
    headers: { Authorization: "Bearer <token>" },
    response: {
      kpis: [
        {
          key: "string",
          label: "string",
          value: "string",
          note: "string",
        },
      ],
    },
  },
};
