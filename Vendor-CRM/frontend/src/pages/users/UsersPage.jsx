import React from "react";
import { Clapperboard, Layers, Store, Users } from "lucide-react";

import ResourcePage, { StatusBadge } from "../../components/resource/ResourcePage";
import { formatDate } from "../../components/resource/format";
import { usersApi } from "../../services/crmApi";
import { ACCESS_OPTIONS } from "../../services/access";

const ACCESS_LABELS = {
  ALL: "Production + Vendor",
  PRODUCTION: "Production only",
  VENDOR: "Vendor only",
};

const ACCESS_TONES = {
  "Production + Vendor": "gold",
  "Production only": "blue",
  "Vendor only": "green",
};

const usersConfig = {
  eyebrow: "Admin",
  title: "Users & Access",
  description:
    "Everyone here shares your company's data. Choose which CRM each login can open.",
  addLabel: "Add User",
  singular: "User",
  api: usersApi,
  searchPlaceholder: "Search by name or email...",
  searchText: (u) => [u.fullName, u.email, ACCESS_LABELS[u.access]].join(" "),
  stats: (records) => [
    { label: "Users", value: records.length, icon: Users, tone: "gold" },
    { label: "Production + Vendor", value: records.filter((u) => u.access === "ALL").length, icon: Layers, tone: "gold" },
    { label: "Production Only", value: records.filter((u) => u.access === "PRODUCTION").length, icon: Clapperboard, tone: "blue" },
    { label: "Vendor Only", value: records.filter((u) => u.access === "VENDOR").length, icon: Store, tone: "green" },
  ],
  columns: [
    {
      label: "User",
      render: (u) => (
        <>
          <span className="rp-primary-text">{u.fullName}</span>
          <span className="rp-sub-text">{u.email}</span>
        </>
      ),
    },
    {
      label: "Access",
      render: (u) => <StatusBadge value={ACCESS_LABELS[u.access]} tones={ACCESS_TONES} />,
    },
    { label: "Role", render: (u) => (u.admin ? "Admin" : "Member") },
    { label: "Mobile", render: (u) => u.mobile || <span className="rp-muted">—</span> },
    { label: "Added", render: (u) => formatDate(u.createdAt?.slice(0, 10)) },
  ],
  // The admin is the account that signed up; it always has full access.
  canEdit: (u) => !u.admin,
  canDelete: (u) => !u.admin,
  defaults: () => ({ access: "PRODUCTION" }),
  fields: [
    { name: "fullName", label: "Full name", required: true },
    { name: "email", label: "Email", type: "email", required: true, createOnly: true },
    { name: "mobile", label: "Mobile", type: "tel", placeholder: "9876543210" },
    { name: "access", label: "Access", type: "select", required: true, options: ACCESS_OPTIONS },
    {
      name: "password",
      label: "Temporary password",
      type: "password",
      required: true,
      createOnly: true,
      full: true,
      hint:
        "8+ characters with upper and lower case, a number and a symbol. Share it with the user; they can change it with Forgot password.",
    },
  ],
  toPayload: (form) => ({
    ...form,
    mobile: (form.mobile || "").replace(/[\s-]/g, ""),
  }),
  deleteLabel: (u) => `${u.fullName} will no longer be able to sign in. Records they created stay in the workspace.`,
};

export default function UsersPage() {
  return <ResourcePage config={usersConfig} />;
}
