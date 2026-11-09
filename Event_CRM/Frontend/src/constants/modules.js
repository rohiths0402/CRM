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
  { key: "dashboard", label: "Operations Dashboard", icon: LayoutDashboard },
  { key: "events", label: "Events Master", icon: CalendarRange },
  { key: "venues", label: "Venues & Seating", icon: MapPin },
  { key: "ticketing", label: "Ticketing & Tiers", icon: Ticket },
  { key: "sponsors", label: "Sponsors & Partners", icon: Handshake },
  { key: "artists", label: "Artist Lineup & Riders", icon: Mic2 },
  { key: "gate", label: "Gate Check-In", icon: ScanLine },
  { key: "proposals", label: "Inbound Proposals", icon: Inbox },
  { key: "financials", label: "Financials & P&L", icon: IndianRupee },
  { key: "crew", label: "Crew & Staff", icon: Users },
  { key: "settings", label: "System Settings", icon: Settings },
  { key: "profile", label: "My Profile", icon: UserCircle },
];
