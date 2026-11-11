
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  AlertCircle,
  CheckCircle,
  Eye,
  Pencil,
  Trash2,
  X,
  CreditCard,
  CalendarDays,
  Filter,
  IndianRupee,
  FileText,
  RefreshCw,
} from "lucide-react";
import {
  paymentsApi,
  fetchProjectNames,
  toFormValues,
} from "../../services/crmApi";
import "./PaymentsPage.css";

const emptyForm = {
  title: "",
  party: "",
  project: "",
  direction: "Outgoing",
  type: "Production Expense",
  amount: "",
  paymentDate: "",
  dueDate: "",
  method: "Bank Transfer",
  reference: "",
  status: "Pending",
  notes: "",
};

const currency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);

const formatDate = (date) => {
  if (!date) return "—";
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [projectNames, setProjectNames] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [directionFilter, setDirectionFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  const [modal, setModal] = useState("");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  // Load payments from the backend
  const loadPayments = useCallback(async () => {
    setLoading(true);
    setLoadError("");

    try {
      setPayments(await paymentsApi.list());
    } catch (err) {
      setLoadError(err.message || "Unable to load payments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  // Project names for the form; falls back to a text input if unavailable
  useEffect(() => {
    fetchProjectNames()
      .then(setProjectNames)
      .catch(() => setProjectNames(null));
  }, []);

  const projectOptions = useMemo(() => {
    const names = [...(projectNames || [])];
    if (form.project && !names.includes(form.project)) {
      names.unshift(form.project);
    }
    return names;
  }, [projectNames, form.project]);

  const closeModal = () => {
    if (saving) return;
    setModal("");
  };

  const stats = useMemo(() => {
    const completed = payments.filter(
      (payment) => payment.status === "Completed"
    );

    const outstanding = payments.filter(
      (payment) =>
        payment.direction === "Incoming" &&
        ["Pending", "Overdue"].includes(payment.status)
    );

    const payable = payments.filter(
      (payment) =>
        payment.direction === "Outgoing" &&
        ["Pending", "Overdue"].includes(payment.status)
    );

    const overdue = payments.filter(
      (payment) => payment.status === "Overdue"
    );

    return {
      transactions: payments.length,
      received: completed
        .filter((payment) => payment.direction === "Incoming")
        .reduce((sum, payment) => sum + Number(payment.amount), 0),
      paid: completed
        .filter((payment) => payment.direction === "Outgoing")
        .reduce((sum, payment) => sum + Number(payment.amount), 0),
      receivable: outstanding.reduce(
        (sum, payment) => sum + Number(payment.amount),
        0
      ),
      payable: payable.reduce(
        (sum, payment) => sum + Number(payment.amount),
        0
      ),
      overdue: overdue.reduce(
        (sum, payment) => sum + Number(payment.amount),
        0
      ),
    };
  }, [payments]);

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const searchText = search.toLowerCase();

      const matchesSearch = [
        payment.title,
        payment.party,
        payment.project,
        payment.reference,
      ].some((value) => value?.toLowerCase().includes(searchText));

      const matchesStatus =
        statusFilter === "All" || payment.status === statusFilter;

      const matchesDirection =
        directionFilter === "All" ||
        payment.direction === directionFilter;

      const matchesType = typeFilter === "All" || payment.type === typeFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesDirection &&
        matchesType
      );
    });
  }, [payments, search, statusFilter, directionFilter, typeFilter]);

  const openAddModal = () => {
    setForm(emptyForm);
    setFormError("");
    setSelectedPayment(null);
    setModal("add");
  };

  const openEditModal = (payment) => {
    setSelectedPayment(payment);
    setForm({ ...toFormValues(payment), amount: String(payment.amount ?? "") });
    setFormError("");
    setModal("edit");
  };

  const openViewModal = (payment) => {
    setSelectedPayment(payment);
    setModal("view");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    if (
      !form.title.trim() ||
      !form.party.trim() ||
      !form.project.trim() ||
      !form.amount ||
      !form.dueDate
    ) {
      setFormError("Please complete all required fields.");
      return;
    }

    if (!Number.isFinite(Number(form.amount)) || Number(form.amount) <= 0) {
      setFormError("Enter a valid amount greater than zero.");
      return;
    }

    if (
      form.status === "Completed" &&
      !form.paymentDate
    ) {
      setFormError("Add the payment date for a completed transaction.");
      return;
    }

    const paymentData = {
      ...form,
      title: form.title.trim(),
      party: form.party.trim(),
      project: form.project.trim(),
      amount: Number(form.amount),
      paymentDate: form.paymentDate || null,
    };

    setSaving(true);

    try {
      if (modal === "edit" && selectedPayment) {
        const saved = await paymentsApi.update(selectedPayment.id, paymentData);
        setPayments((previous) =>
          previous.map((payment) =>
            payment.id === saved.id ? saved : payment
          )
        );
      } else {
        const saved = await paymentsApi.create(paymentData);
        setPayments((previous) => [saved, ...previous]);
      }

      setModal("");
      setSelectedPayment(null);
      setForm(emptyForm);
    } catch (err) {
      setFormError(err.message || "Unable to save transaction.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this transaction?"
    );

    if (!confirmed) return;

    try {
      await paymentsApi.remove(id);
      setPayments((previous) =>
        previous.filter((payment) => payment.id !== id)
      );
      setModal("");
      setSelectedPayment(null);
    } catch (err) {
      window.alert(err.message || "Unable to delete transaction.");
    }
  };

  const getStatusClass = (status) => status.toLowerCase();

  const statCards = [
    {
      label: "Total Transactions",
      value: stats.transactions.toLocaleString("en-IN"),
      icon: Wallet,
      description: "All recorded transactions",
      color: "gold",
    },
    {
      label: "Money Received",
      value: currency(stats.received),
      icon: ArrowDownLeft,
      description: "Completed incoming payments",
      color: "green",
    },
    {
      label: "Money Paid",
      value: currency(stats.paid),
      icon: ArrowUpRight,
      description: "Completed outgoing payments",
      color: "blue",
    },
    {
      label: "Receivable",
      value: currency(stats.receivable),
      icon: Clock,
      description: "Incoming amount not yet received",
      color: "purple",
    },
    {
      label: "Payable",
      value: currency(stats.payable),
      icon: CreditCard,
      description: "Outgoing amount not yet paid",
      color: "orange",
    },
    {
      label: "Overdue Amount",
      value: currency(stats.overdue),
      icon: AlertCircle,
      description: "All overdue transactions",
      color: "red",
    },
  ];

  return (
    <div className="payments-page">
      <div className="payments-heading">
        <div>
          <span className="payments-eyebrow">FINANCIAL MANAGEMENT</span>
          <h1>Payments Tracking</h1>
          <p>Monitor production payments, revenue, and outstanding balances.</p>
        </div>

        <button
          className="payment-primary-btn"
          onClick={openAddModal}
          disabled={loading}
        >
          <Plus size={18} />
          Add Transaction
        </button>
      </div>

      {loadError && (
        <div className="payment-api-error" role="alert">
          <span>{loadError}</span>
          <button type="button" onClick={loadPayments} disabled={loading}>
            <RefreshCw size={15} />
            Retry
          </button>
        </div>
      )}

      <div className="payment-stats-grid">
        {statCards.map((stat) => {
          const Icon = stat.icon;

          return (
            <div className="payment-stat-card" key={stat.label}>
              <div className={`payment-stat-icon ${stat.color}`}>
                <Icon size={20} />
              </div>
              <p>{stat.label}</p>
              <h2>{loading ? "..." : stat.value}</h2>
              <span>{stat.description}</span>
            </div>
          );
        })}
      </div>

      <section className="payment-content-card">
        <div className="payment-section-heading">
          <div>
            <h2>Transaction History</h2>
            <p>View and manage all incoming and outgoing payments.</p>
          </div>
          <span className="payment-record-count">
            {loading ? "Loading..." : `${filteredPayments.length} Records`}
          </span>
        </div>

        <div className="payment-toolbar">
          <div className="payment-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search title, party, project or reference..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="payment-filters">
            <div className="payment-filter-control">
              <Filter size={15} />
              <select
                value={directionFilter}
                onChange={(event) => setDirectionFilter(event.target.value)}
              >
                <option value="All">All Directions</option>
                <option value="Incoming">Incoming</option>
                <option value="Outgoing">Outgoing</option>
              </select>
            </div>

            <select
              className="payment-select-filter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <select
              className="payment-select-filter"
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
            >
              <option value="All">All Types</option>
              <option value="Artist Payment">Artist Payment</option>
              <option value="Crew Salary">Crew Salary</option>
              <option value="Vendor Payment">Vendor Payment</option>
              <option value="Production Expense">Production Expense</option>
              <option value="OTT Revenue">OTT Revenue</option>
              <option value="Sponsorship">Sponsorship</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="payment-table-wrapper">
          <table className="payment-table">
            <thead>
              <tr>
                <th>TRANSACTION</th>
                <th>PARTY / PROJECT</th>
                <th>DIRECTION</th>
                <th>AMOUNT</th>
                <th>DUE DATE</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7">
                    <div className="payment-loading">
                      <RefreshCw size={22} className="payment-loading-icon" />
                      <p>Loading transactions...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td>
                      <div className="payment-transaction-name">
                        <span className="payment-file-icon">
                          <FileText size={17} />
                        </span>
                        <div>
                          <strong>{payment.title}</strong>
                          <small>{payment.reference || "No reference"}</small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="payment-party-cell">
                        <strong>{payment.party}</strong>
                        <small>{payment.project}</small>
                      </div>
                    </td>

                    <td>
                      <span
                        className={`payment-direction ${payment.direction.toLowerCase()}`}
                      >
                        {payment.direction === "Incoming" ? (
                          <ArrowDownLeft size={14} />
                        ) : (
                          <ArrowUpRight size={14} />
                        )}
                        {payment.direction}
                      </span>
                    </td>

                    <td className="payment-amount">
                      {currency(payment.amount)}
                    </td>

                    <td>
                      <span className="payment-date-cell">
                        <CalendarDays size={14} />
                        {formatDate(payment.dueDate)}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`payment-status ${getStatusClass(payment.status)}`}
                      >
                        {payment.status === "Completed" && (
                          <CheckCircle size={13} />
                        )}
                        {payment.status === "Overdue" && (
                          <AlertCircle size={13} />
                        )}
                        {payment.status === "Pending" && (
                          <Clock size={13} />
                        )}
                        {payment.status}
                      </span>
                    </td>

                    <td>
                      <div className="payment-actions">
                        <button
                          title="View"
                          onClick={() => openViewModal(payment)}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          title="Edit"
                          onClick={() => openEditModal(payment)}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          title="Delete"
                          className="payment-delete-action"
                          onClick={() => handleDelete(payment.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">
                    <div className="payment-empty-state">
                      <Wallet size={30} />
                      <h3>No transactions found</h3>
                      <p>Try changing your filters or add a new transaction.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {(modal === "add" || modal === "edit") && (
        <div
          className="payment-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div className="payment-modal">
            <div className="payment-modal-header">
              <div>
                <span>PAYMENT MANAGEMENT</span>
                <h2>
                  {modal === "add" ? "Add Transaction" : "Edit Transaction"}
                </h2>
              </div>
              <button
                className="payment-modal-close"
                onClick={closeModal}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="payment-form-grid">
                <label className="payment-form-full">
                  Transaction Title *
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g. Actor advance payment"
                  />
                </label>

                <label>
                  Party / Company *
                  <input
                    name="party"
                    value={form.party}
                    onChange={handleChange}
                    placeholder="Person or company name"
                  />
                </label>

                <label>
                  Project *
                  {projectNames ? (
                    <select
                      name="project"
                      value={form.project}
                      onChange={handleChange}
                    >
                      <option value="">Select project</option>
                      {projectOptions.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      name="project"
                      value={form.project}
                      onChange={handleChange}
                      placeholder="Project name"
                    />
                  )}
                </label>

                <label>
                  Transaction Direction *
                  <select
                    name="direction"
                    value={form.direction}
                    onChange={handleChange}
                  >
                    <option value="Outgoing">Outgoing</option>
                    <option value="Incoming">Incoming</option>
                  </select>
                </label>

                <label>
                  Payment Type *
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                  >
                    <option>Production Expense</option>
                    <option>Artist Payment</option>
                    <option>Crew Salary</option>
                    <option>Vendor Payment</option>
                    <option>OTT Revenue</option>
                    <option>Sponsorship</option>
                    <option>Other</option>
                  </select>
                </label>

                <label>
                  Amount (₹) *
                  <input
                    name="amount"
                    type="number"
                    min="1"
                    value={form.amount}
                    onChange={handleChange}
                    placeholder="Enter amount"
                  />
                </label>

                <label>
                  Status *
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option>Pending</option>
                    <option>Completed</option>
                    <option>Overdue</option>
                    <option>Cancelled</option>
                  </select>
                </label>

                <label>
                  Due Date *
                  <input
                    name="dueDate"
                    type="date"
                    value={form.dueDate}
                    onChange={handleChange}
                  />
                </label>

                <label>
                  Payment Date
                  <input
                    name="paymentDate"
                    type="date"
                    value={form.paymentDate}
                    onChange={handleChange}
                  />
                </label>

                <label>
                  Payment Method
                  <select
                    name="method"
                    value={form.method}
                    onChange={handleChange}
                  >
                    <option>Bank Transfer</option>
                    <option>UPI</option>
                    <option>Cash</option>
                    <option>Cheque</option>
                    <option>Other</option>
                  </select>
                </label>

                <label>
                  Transaction Reference
                  <input
                    name="reference"
                    value={form.reference}
                    onChange={handleChange}
                    placeholder="Transaction ID / reference"
                  />
                </label>

                <label className="payment-form-full">
                  Notes
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    placeholder="Additional payment details..."
                    rows="3"
                  />
                </label>
              </div>

              {formError && (
                <p className="payment-form-error">{formError}</p>
              )}

              <div className="payment-modal-footer">
                <button
                  type="button"
                  className="payment-secondary-btn"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="payment-primary-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : modal === "add"
                      ? "Save Transaction"
                      : "Update Transaction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal === "view" && selectedPayment && (
        <div className="payment-modal-overlay" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setModal("");
        }}>
          <div className="payment-modal payment-view-modal">
            <div className="payment-modal-header">
              <div>
                <span>TRANSACTION DETAILS</span>
                <h2>{selectedPayment.title}</h2>
              </div>
              <button
                className="payment-modal-close"
                onClick={() => setModal("")}
              >
                <X size={20} />
              </button>
            </div>

            <div className="payment-detail-amount">
              <span>{selectedPayment.direction} Amount</span>
              <h2>{currency(selectedPayment.amount)}</h2>
              <span className={`payment-status ${getStatusClass(selectedPayment.status)}`}>
                {selectedPayment.status}
              </span>
            </div>

            <div className="payment-details-grid">
              <div><span>Party / Company</span><strong>{selectedPayment.party}</strong></div>
              <div><span>Project</span><strong>{selectedPayment.project}</strong></div>
              <div><span>Direction</span><strong>{selectedPayment.direction}</strong></div>
              <div><span>Payment Type</span><strong>{selectedPayment.type}</strong></div>
              <div><span>Due Date</span><strong>{formatDate(selectedPayment.dueDate)}</strong></div>
              <div><span>Payment Date</span><strong>{formatDate(selectedPayment.paymentDate)}</strong></div>
              <div><span>Payment Method</span><strong>{selectedPayment.method}</strong></div>
              <div><span>Reference</span><strong>{selectedPayment.reference || "—"}</strong></div>
              <div className="payment-detail-full"><span>Notes</span><strong>{selectedPayment.notes || "No notes added"}</strong></div>
            </div>

            <div className="payment-modal-footer">
              <button
                className="payment-secondary-btn"
                onClick={() => setModal("")}
              >
                Close
              </button>
              <button
                className="payment-primary-btn"
                onClick={() => openEditModal(selectedPayment)}
              >
                <Pencil size={16} />
                Edit Transaction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentsPage;
