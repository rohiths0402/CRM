import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  IndianRupee,
  RefreshCw,
  ShoppingCart,
  Store,
  Wallet,
} from "lucide-react";

import { StatusBadge } from "../../components/resource/ResourcePage";
import { formatDate, formatMoney } from "../../components/resource/format";
import { vendorDashboardApi } from "../../services/crmApi";
import "../../components/resource/ResourcePage.css";
import "./VendorDashboardPage.css";

const ORDER_TONES = { Draft: "grey", Issued: "blue", Delivered: "gold", Closed: "green", Cancelled: "grey" };
const EXPIRY_TONES = { Expired: "red", "Expiring Soon": "gold" };

function Panel({ title, link, linkLabel = "View all", children, className = "" }) {
  return (
    <section className={`vd-panel ${className}`}>
      <div className="vd-panel-header">
        <h3>{title}</h3>
        {link && (
          <Link to={link} className="rp-link vd-panel-link">
            {linkLabel} <ArrowRight size={14} />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function Empty({ children }) {
  return <p className="vd-empty">{children}</p>;
}

export default function VendorDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await vendorDashboardApi.summary());
    } catch (err) {
      setError(err.message || "Unable to load the dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stats = data?.stats;
  const quotes = data?.quotations;
  const maxSpend = Math.max(1, ...(data?.spendByCategory || []).map((c) => Number(c.amount)));

  const statCards = [
    {
      label: "Active Vendors",
      value: stats ? `${stats.activeVendors} / ${stats.totalVendors}` : "—",
      icon: Store,
      tone: "gold",
    },
    {
      label: "Open Purchase Orders",
      value: stats ? stats.openPurchaseOrders : "—",
      sub: stats ? `${formatMoney(stats.openOrderValue)} on order` : "",
      icon: ShoppingCart,
      tone: "blue",
    },
    {
      label: "Outstanding to Vendors",
      value: stats ? formatMoney(stats.outstanding) : "—",
      sub: stats && Number(stats.overdue) > 0 ? `${formatMoney(stats.overdue)} overdue` : stats ? "Nothing overdue" : "",
      alert: stats && Number(stats.overdue) > 0,
      icon: Wallet,
      tone: "red",
    },
    {
      label: "Paid This Month",
      value: stats ? formatMoney(stats.paidThisMonth) : "—",
      sub: stats ? `${stats.unpaidInvoices} unpaid invoice${stats.unpaidInvoices === 1 ? "" : "s"}` : "",
      icon: IndianRupee,
      tone: "green",
    },
  ];

  return (
    <div className="rp-page">
      <div className="rp-header">
        <div>
          <span className="rp-eyebrow">Vendor Overview</span>
          <h1>Vendor Dashboard</h1>
          <p>Purchasing, money owed and vendor paperwork at a glance.</p>
        </div>
        <Link to="/vendor/purchase-orders" className="rp-primary-btn vd-header-btn">
          <ShoppingCart size={17} /> Purchase Orders
        </Link>
      </div>

      {error ? (
        <div className="rp-error-panel">
          <AlertTriangle size={18} />
          <span>{error}</span>
          <button type="button" onClick={load}>
            <RefreshCw size={15} /> Retry
          </button>
        </div>
      ) : (
        <>
          <div className="rp-stats">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <div className="rp-stat-card" key={card.label}>
                  <div className={`rp-stat-icon ${card.tone}`}>
                    <Icon size={21} />
                  </div>
                  <div>
                    <span>{card.label}</span>
                    <h2>{loading ? "—" : card.value}</h2>
                    {!loading && card.sub && (
                      <small className={`vd-stat-sub ${card.alert ? "alert" : ""}`}>{card.sub}</small>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {loading ? (
            <div className="vd-loading">Loading dashboard...</div>
          ) : (
            <div className="vd-grid">
              <Panel title="Quotation Pipeline" link="/vendor/quotations">
                <div className="vd-pipeline">
                  {[
                    ["Requested", quotes.requested, "Waiting for vendor's price"],
                    ["Received", quotes.received, "Waiting for your decision"],
                    ["Accepted", quotes.accepted, "Ready for a purchase order"],
                    ["Rejected", quotes.rejected, "Not going ahead"],
                  ].map(([label, count, hint]) => (
                    <div className="vd-pipeline-step" key={label}>
                      <strong>{count}</strong>
                      <span>{label}</span>
                      <small>{hint}</small>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title="Payments Due (next 14 days)" link="/vendor/invoices">
                {data.duePayments.length === 0 ? (
                  <Empty>No invoices due in the next two weeks.</Empty>
                ) : (
                  <ul className="vd-list">
                    {data.duePayments.map((due) => (
                      <li key={due.invoiceId}>
                        <div>
                          <span className="rp-primary-text">{due.vendorName}</span>
                          <span className="rp-sub-text">Invoice {due.invoiceNumber}</span>
                        </div>
                        <div className="vd-list-right">
                          <span className="rp-primary-text">{formatMoney(due.balance)}</span>
                          <span className={due.overdue ? "rp-overdue vd-small" : "rp-sub-text"}>
                            {due.overdue ? "Overdue since " : "Due "}
                            {formatDate(due.dueDate)}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>

              <Panel title="Spend by Category" link="/vendor/payments" linkLabel="Payments">
                {data.spendByCategory.length === 0 ? (
                  <Empty>Completed payments will show here by vendor category.</Empty>
                ) : (
                  <div className="vd-bars">
                    {data.spendByCategory.map((item) => (
                      <div className="vd-bar-row" key={item.category}>
                        <div className="vd-bar-label">
                          <span>{item.category}</span>
                          <span>{formatMoney(item.amount)}</span>
                        </div>
                        <div className="vd-bar-track">
                          <div
                            className="vd-bar-fill"
                            style={{ width: `${(Number(item.amount) / maxSpend) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Panel>

              <Panel title="Document Alerts" link="/vendor/documents">
                {data.documentAlerts.length === 0 ? (
                  <Empty>
                    <CheckCircle2 size={16} /> No documents expired or expiring in the next 30 days.
                  </Empty>
                ) : (
                  <ul className="vd-list">
                    {data.documentAlerts.map((doc) => (
                      <li key={doc.id}>
                        <div>
                          <span className="rp-primary-text">{doc.title}</span>
                          <span className="rp-sub-text">
                            {doc.vendorName} · {doc.type}
                          </span>
                        </div>
                        <div className="vd-list-right">
                          <StatusBadge value={doc.expiryStatus} tones={EXPIRY_TONES} />
                          <span className="rp-sub-text">{formatDate(doc.expiryDate)}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>

              <Panel title="Top Vendors by Order Value" link="/vendor/vendors" className="wide">
                {data.topVendors.length === 0 ? (
                  <Empty>Raise purchase orders to see your biggest vendors.</Empty>
                ) : (
                  <div className="rp-table-scroll">
                    <table className="rp-table">
                      <thead>
                        <tr>
                          <th>Vendor</th>
                          <th>Category</th>
                          <th>Orders</th>
                          <th>Order value</th>
                          <th>Rating</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.topVendors.map((v) => (
                          <tr key={v.id}>
                            <td className="rp-primary-text">{v.name}</td>
                            <td>{v.category}</td>
                            <td>{v.orders}</td>
                            <td>{formatMoney(v.orderValue)}</td>
                            <td>
                              {v.rating ? (
                                <span className="rp-stars">{"★".repeat(v.rating)}{"☆".repeat(5 - v.rating)}</span>
                              ) : (
                                <span className="rp-muted">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Panel>

              <Panel title="Recent Purchase Orders" link="/vendor/purchase-orders" className="wide">
                {data.recentOrders.length === 0 ? (
                  <Empty>No purchase orders yet.</Empty>
                ) : (
                  <div className="rp-table-scroll">
                    <table className="rp-table">
                      <thead>
                        <tr>
                          <th>PO</th>
                          <th>Vendor</th>
                          <th>Project</th>
                          <th>Ordered</th>
                          <th>Total</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.recentOrders.map((o) => (
                          <tr key={o.id}>
                            <td className="rp-primary-text">{o.poNumber}</td>
                            <td>{o.vendorName}</td>
                            <td>{o.project}</td>
                            <td>{formatDate(o.orderDate)}</td>
                            <td>{formatMoney(o.totalAmount)}</td>
                            <td>
                              <StatusBadge value={o.status} tones={ORDER_TONES} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Panel>
            </div>
          )}
        </>
      )}
    </div>
  );
}
