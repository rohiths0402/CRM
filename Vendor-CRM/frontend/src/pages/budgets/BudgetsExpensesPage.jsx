import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  budgetsApi,
  expensesApi,
  toFormValues,
} from "../../services/crmApi";
import "./BudgetsExpensesPage.css";

const categories = [
  "Location",
  "Equipment",
  "Travel",
  "Food",
  "Accommodation",
  "Salary",
  "Post-production",
  "Other",
];

const emptyForm = {
  projectId: "",
  title: "",
  vendor: "",
  category: "Location",
  date: new Date().toISOString().slice(0, 10),
  amount: "",
  status: "Pending",
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

function normalizeExpense(expense) {
  return {
    ...expense,
    projectId: Number(expense.projectId),
    amount: Number(expense.amount) || 0,
  };
}

export default function BudgetsExpensesPage() {
  const [projects, setProjects] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageError, setPageError] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  // Load project budgets and expenses from backend
  const fetchData = useCallback(async () => {
    setLoading(true);
    setPageError("");

    try {
      const [budgetData, expenseList] = await Promise.all([
        budgetsApi.summary(),
        expensesApi.list(),
      ]);

      setProjects(
        (budgetData?.projects || []).map((project) => ({
          ...project,
          id: Number(project.id),
          budget: Number(project.budget) || 0,
        }))
      );
      setExpenses((expenseList || []).map(normalizeExpense));
    } catch (err) {
      setPageError(err.message || "Unable to load budgets and expenses.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const project = projects.find(
        (item) => item.id === Number(expense.projectId)
      );

      const matchesProject =
        projectFilter === "all" ||
        expense.projectId === Number(projectFilter);

      const matchesStatus =
        statusFilter === "all" || expense.status === statusFilter;

      const query = search.toLowerCase().trim();

      const matchesSearch =
        !query ||
        String(expense.title || "").toLowerCase().includes(query) ||
        String(expense.vendor || "").toLowerCase().includes(query) ||
        String(expense.category || "").toLowerCase().includes(query) ||
        project?.name.toLowerCase().includes(query);

      return matchesProject && matchesStatus && matchesSearch;
    });
  }, [projects, expenses, projectFilter, statusFilter, search]);

  const summary = useMemo(() => {
    const selectedProjects =
      projectFilter === "all"
        ? projects
        : projects.filter(
            (project) => project.id === Number(projectFilter)
          );

    const projectIds = selectedProjects.map((project) => project.id);

    const selectedExpenses = expenses.filter((expense) =>
      projectIds.includes(Number(expense.projectId))
    );

    const budget = selectedProjects.reduce(
      (total, project) => total + project.budget,
      0
    );

    const spent = selectedExpenses.reduce(
      (total, expense) => total + Number(expense.amount),
      0
    );

    const unpaid = selectedExpenses
      .filter((expense) => expense.status !== "Paid")
      .reduce((total, expense) => total + Number(expense.amount), 0);

    return {
      budget,
      spent,
      remaining: budget - spent,
      unpaid,
    };
  }, [projects, expenses, projectFilter]);

  function openAddForm() {
    setEditingId(null);
    setForm({
      ...emptyForm,
      projectId:
        projectFilter === "all"
          ? String(projects[0]?.id ?? "")
          : projectFilter,
    });
    setError("");
    setShowForm(true);
  }

  function openEditForm(expense) {
    setEditingId(expense.id);
    setForm({
      ...toFormValues(expense),
      projectId: String(expense.projectId),
      amount: String(expense.amount),
    });
    setError("");
    setShowForm(true);
  }

  function closeForm() {
    if (saving) return;

    setShowForm(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const amount = Number(form.amount);

    if (
      !form.projectId ||
      !form.title.trim() ||
      !form.vendor.trim() ||
      !form.date ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      setError("Please enter all required details and a valid amount.");
      return;
    }

    const expenseData = {
      projectId: Number(form.projectId),
      title: form.title.trim(),
      vendor: form.vendor.trim(),
      category: form.category,
      date: form.date,
      amount,
      status: form.status,
    };

    setSaving(true);
    setError("");

    try {
      if (editingId !== null) {
        const saved = normalizeExpense(
          await expensesApi.update(editingId, expenseData)
        );

        setExpenses((current) =>
          current.map((expense) =>
            expense.id === editingId ? saved : expense
          )
        );
      } else {
        const saved = normalizeExpense(await expensesApi.create(expenseData));

        setExpenses((current) => [saved, ...current]);
      }

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
    } catch (err) {
      setError(err.message || "Unable to save expense.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteExpense(id) {
    if (!window.confirm("Are you sure you want to delete this expense?")) {
      return;
    }

    setPageError("");

    try {
      await expensesApi.remove(id);

      setExpenses((current) =>
        current.filter((expense) => expense.id !== id)
      );
    } catch (err) {
      setPageError(err.message || "Unable to delete expense.");
    }
  }

  return (
    <div className="budgets-page">
      <div className="budgets-heading">
        <div>
          <span className="budgets-eyebrow">FINANCE / OVERVIEW</span>
          <h1>Budgets &amp; Expenses</h1>
          <p>Manage project budgets and track your production expenses.</p>
        </div>

        <div className="budget-heading-action">
          <button
            className="budget-primary-btn"
            onClick={openAddForm}
            disabled={loading || saving || projects.length === 0}
          >
            + Add Expense
          </button>
          {!loading && !pageError && projects.length === 0 && (
            <small className="budget-hint">
              Create an OTT project first to record expenses.
            </small>
          )}
        </div>
      </div>

      {pageError && (
        <div className="budget-api-error" role="alert">
          <span>{pageError}</span>
          <button type="button" onClick={fetchData} disabled={loading}>
            Retry
          </button>
        </div>
      )}

      <section className="budget-summary-grid">
        <article className="budget-summary-card">
          <span>Total Budget</span>
          <h2>{loading ? "..." : formatCurrency(summary.budget)}</h2>
          <small>Allocated project budget</small>
        </article>

        <article className="budget-summary-card">
          <span>Total Expenses</span>
          <h2>{loading ? "..." : formatCurrency(summary.spent)}</h2>
          <small>Recorded expenses</small>
        </article>

        <article className="budget-summary-card">
          <span>Remaining Budget</span>
          <h2 className={summary.remaining < 0 ? "budget-danger" : "budget-gold"}>
            {loading ? "..." : formatCurrency(summary.remaining)}
          </h2>
          <small>Available balance</small>
        </article>

        <article className="budget-summary-card">
          <span>Unpaid Expenses</span>
          <h2>{loading ? "..." : formatCurrency(summary.unpaid)}</h2>
          <small>Pending and partially paid</small>
        </article>
      </section>

      <section className="budget-panel">
        <div className="budget-panel-heading">
          <div>
            <h2>Project Budgets</h2>
            <p>Budget allocation and spending overview.</p>
          </div>
        </div>

        <div className="project-budget-list">
          {loading && <p className="budget-loading">Loading budgets...</p>}

          {!loading && projects.length === 0 && (
            <p className="budget-loading">No projects found.</p>
          )}

          {!loading &&
            projects
              .filter(
                (project) =>
                  projectFilter === "all" ||
                  project.id === Number(projectFilter)
              )
              .map((project) => {
                const spent = expenses
                  .filter(
                    (expense) => expense.projectId === project.id
                  )
                  .reduce(
                    (total, expense) => total + Number(expense.amount),
                    0
                  );

                const percentage =
                  project.budget > 0
                    ? (spent / project.budget) * 100
                    : 0;

                return (
                  <article className="project-budget-card" key={project.id}>
                    <div className="project-budget-top">
                      <div>
                        <h3>{project.name}</h3>
                      </div>
                      <strong>{formatCurrency(spent)}</strong>
                    </div>

                    <div className="budget-progress-track">
                      <div
                        className={
                          percentage > 100
                            ? "budget-progress-fill over-budget"
                            : "budget-progress-fill"
                        }
                        style={{
                          width: `${Math.min(percentage, 100)}%`,
                        }}
                      />
                    </div>

                    <div className="project-budget-bottom">
                      <span>{Math.round(percentage)}% used</span>
                      <span>
                        Budget: {formatCurrency(project.budget)}
                      </span>
                    </div>
                  </article>
                );
              })}
        </div>
      </section>

      <section className="budget-panel">
        <div className="budget-panel-heading">
          <div>
            <h2>Expense Records</h2>
            <p>View and manage all project expenses.</p>
          </div>
          <span className="budget-record-count">
            {loading ? "LOADING" : `${filteredExpenses.length} RECORDS`}
          </span>
        </div>

        <div className="budget-filters">
          <input
            type="search"
            placeholder="Search expenses or vendors..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <select
            value={projectFilter}
            onChange={(event) => setProjectFilter(event.target.value)}
          >
            <option value="all">All Projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Partially Paid">Partially Paid</option>
          </select>
        </div>

        <div className="budget-table-wrapper">
          <table className="budget-table">
            <thead>
              <tr>
                <th>Expense</th>
                <th>Project</th>
                <th>Date</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan="7" className="budget-empty">
                    Loading expenses...
                  </td>
                </tr>
              )}

              {!loading &&
                filteredExpenses.map((expense) => {
                  const project = projects.find(
                    (item) => item.id === expense.projectId
                  );

                  return (
                    <tr key={expense.id}>
                      <td>
                        <strong>{expense.title}</strong>
                        <small>{expense.vendor}</small>
                      </td>
                      <td>{project?.name || "Unknown project"}</td>
                      <td>{expense.date}</td>
                      <td>{expense.category}</td>
                      <td className="budget-table-amount">
                        {formatCurrency(expense.amount)}
                      </td>
                      <td>
                        <span
                          className={`budget-status status-${String(
                            expense.status || ""
                          )
                            .toLowerCase()
                            .replaceAll(" ", "-")}`}
                        >
                          {expense.status}
                        </span>
                      </td>
                      <td>
                        <div className="budget-actions">
                          <button onClick={() => openEditForm(expense)}>
                            Edit
                          </button>
                          <button onClick={() => deleteExpense(expense.id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

              {!loading && filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan="7" className="budget-empty">
                    No expenses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {showForm && (
        <div
          className="budget-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeForm();
            }
          }}
        >
          <div
            className="budget-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="budget-form-title"
          >
            <div className="budget-modal-heading">
              <div>
                <span className="budgets-eyebrow">EXPENSE DETAILS</span>
                <h2 id="budget-form-title">
                  {editingId ? "Edit Expense" : "Add Expense"}
                </h2>
              </div>
              <button
                className="budget-modal-close"
                onClick={closeForm}
                type="button"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label>
                Project
                <select
                  value={form.projectId}
                  onChange={(event) =>
                    setForm({ ...form, projectId: event.target.value })
                  }
                >
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Expense Name
                <input
                  value={form.title}
                  onChange={(event) =>
                    setForm({ ...form, title: event.target.value })
                  }
                  placeholder="Enter expense name"
                />
              </label>

              <div className="budget-form-grid">
                <label>
                  Category
                  <select
                    value={form.category}
                    onChange={(event) =>
                      setForm({ ...form, category: event.target.value })
                    }
                  >
                    {categories.map((category) => (
                      <option key={category}>{category}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Amount (₹)
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={form.amount}
                    onChange={(event) =>
                      setForm({ ...form, amount: event.target.value })
                    }
                    placeholder="Enter amount"
                  />
                </label>
              </div>

              <div className="budget-form-grid">
                <label>
                  Date
                  <input
                    type="date"
                    value={form.date}
                    onChange={(event) =>
                      setForm({ ...form, date: event.target.value })
                    }
                  />
                </label>

                <label>
                  Payment Status
                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm({ ...form, status: event.target.value })
                    }
                  >
                    <option>Pending</option>
                    <option>Paid</option>
                    <option>Partially Paid</option>
                  </select>
                </label>
              </div>

              <label>
                Vendor / Paid To
                <input
                  value={form.vendor}
                  onChange={(event) =>
                    setForm({ ...form, vendor: event.target.value })
                  }
                  placeholder="Enter vendor name"
                />
              </label>

              {error && <p className="budget-form-error">{error}</p>}

              <div className="budget-modal-actions">
                <button
                  type="button"
                  className="budget-secondary-btn"
                  onClick={closeForm}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="budget-primary-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save Changes"
                      : "Add Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
