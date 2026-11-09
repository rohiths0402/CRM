import {
  LayoutDashboard,
  CalendarRange,
  MapPin,
  Ticket,
  Handshake,
  Mic2,
  ScanLine,
  Inbox,
  IndianRupee,
  Users,
  Settings,
  UserCircle,
} from "lucide-react";

export const MODULES = [
  {
    key: "dashboard",
    label: "Operations Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    key: "events",
    label: "Events Master",
    path: "/events",
    icon: CalendarRange,
  },
  { key: "venues", label: "Venues & Seating", path: "/venues", icon: MapPin },
  {
    key: "ticketing",
    label: "Ticketing & Tiers",
    path: "/ticketing",
    icon: Ticket,
  },
  {
    key: "sponsors",
    label: "Sponsors & Partners",
    path: "/sponsors",
    icon: Handshake,
  },
  {
    key: "artists",
    label: "Artist Lineup & Riders",
    path: "/artists",
    icon: Mic2,
  },
  { key: "gate", label: "Gate Check-In", path: "/gate", icon: ScanLine },
  {
    key: "proposals",
    label: "Inbound Proposals",
    path: "/proposals",
    icon: Inbox,
  },
  {
    key: "financials",
    label: "Financials & P&L",
    path: "/financials",
    icon: IndianRupee,
  },
  { key: "crew", label: "Crew & Staff", path: "/crew", icon: Users },
  {
    key: "settings",
    label: "System Settings",
    path: "/settings",
    icon: Settings,
  },
  { key: "profile", label: "My Profile", path: "/profile", icon: UserCircle },
];
