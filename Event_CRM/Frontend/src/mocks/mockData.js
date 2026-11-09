export const MOCK_OTP = "123456";

export const mockDelay = (ms = 700) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const mockUsers = [
  {
    id: 1,
    name: " Kumar",
    email: "director@loop.com",
    phone: "9876543210",
    password: "Loop@123",
    role: "ADMIN",
    employeeId: "LOOP-DIR-001",
  },
  {
    id: 2,
    name: " Sundaram",
    email: "ops@loop.com",
    phone: "9876543211",
    password: "Loop@123",
    role: "OPS_LEAD",
    employeeId: "LOOP-OPS-402",
  },
  {
    id: 3,
    name: "Karthik ",
    email: "sponsor@loop.com",
    phone: "9876543212",
    password: "Loop@123",
    role: "SPONSOR_MGR",
    employeeId: "LOOP-SPN-215",
  },
  {
    id: 4,
    name: "Vignesh ",
    email: "gate@loop.com",
    phone: "9876543213",
    password: "Loop@123",
    role: "GATE_STAFF",
    employeeId: "LOOP-GTE-118",
  },
];

export const mockDashboardSummary = {
  kpis: [
    {
      key: "live",
      label: "Active live events",
      value: "03",
      note: "Live slates right now",
    },
    {
      key: "revenue",
      label: "Gross revenue",
      value: "₹ 4.82 Cr",
      note: "Tickets and sponsorships",
    },
    {
      key: "tickets",
      label: "Tickets sold",
      value: "18,450",
      note: "Of 22,000 seats, 84% filled",
    },
    {
      key: "sponsors",
      label: "Active brand sponsors",
      value: "14",
      note: "Contracted brands",
    },
  ],
};
