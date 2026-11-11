import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Pencil,
  Trash2,
  X,
  Upload,
} from "lucide-react";
import {
  contractsApi,
  fetchProjectNames,
  toFormValues,
} from "../../services/crmApi";
import "./ContractsPage.css";

const emptyForm = {
  title: "",
  type: "Artist",
  party: "",
  project: "",
  startDate: "",
  endDate: "",
  value: "",
  paymentTerms: "",
  status: "Draft",
  document: "",
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

function ContractsPage() {
  const [contracts, setContracts] = useState([]);
  const [projectNames, setProjectNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageError, setPageError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [viewContract, setViewContract] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  // Load contracts (and project names for the dropdown) from backend
  const fetchContracts = useCallback(async () => {
    setLoading(true);
    setPageError("");

    try {
      const [list, names] = await Promise.all([
        contractsApi.list(),
        fetchProjectNames().catch(() => []),
      ]);

      setContracts(list || []);
      setProjectNames([...new Set((names || []).filter(Boolean))]);
    } catch (err) {
      setPageError(err.message || "Unable to load contracts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const stats = useMemo(() => {
    return {
      total: contracts.length,
      active: contracts.filter((item) => item.status === "Active").length,
      draft: contracts.filter((item) => item.status === "Draft").length,
      expired: contracts.filter((item) => item.status === "Expired").length,
    };
  }, [contracts]);

  const filteredContracts = useMemo(() => {
    return contracts.filter((contract) => {
      const searchText = search.toLowerCase();

      const matchesSearch = [
        contract.contractCode,
        contract.title,
        contract.party,
        contract.project,
      ].some((value) =>
        String(value || "").toLowerCase().includes(searchText)
      );

      const matchesStatus =
        statusFilter === "All" || contract.status === statusFilter;

      const matchesType =
        typeFilter === "All" || contract.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [contracts, search, statusFilter, typeFilter]);

  const openAddModal = () => {
    setSelectedContract(null);
    setForm(emptyForm);
    setError("");
    setShowModal(true);
  };

  const openEditModal = (contract) => {
    setSelectedContract(contract);
    setForm({
      ...toFormValues(contract),
      value: String(contract.value ?? ""),
    });
    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setSelectedContract(null);
    setForm(emptyForm);
    setError("");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleDocument = (event) => {
    const file = event.target.files?.[0];

    if (file) {
      setForm((previous) => ({
        ...previous,
        document: file.name,
      }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (
      !form.title.trim() ||
      !form.party.trim() ||
      !form.project.trim() ||
      !form.startDate ||
      !form.endDate ||
      !form.value
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (new Date(form.endDate) < new Date(form.startDate)) {
      setError("End date cannot be earlier than start date.");
      return;
    }

    const contractData = {
      title: form.title.trim(),
      type: form.type,
      party: form.party.trim(),
      project: form.project.trim(),
      startDate: form.startDate,
      endDate: form.endDate,
      value: Number(form.value),
      paymentTerms: form.paymentTerms,
      status: form.status,
      document: form.document,
    };

    setSaving(true);

    try {
      if (selectedContract) {
        const saved = await contractsApi.update(
          selectedContract.id,
          contractData
        );

        setContracts((previous) =>
          previous.map((item) =>
            item.id === selectedContract.id ? saved : item
          )
        );
      } else {
        const saved = await contractsApi.create(contractData);

        setContracts((previous) => [saved, ...previous]);
      }

      setShowModal(false);
      setSelectedContract(null);
      setForm(emptyForm);
    } catch (err) {
      setError(err.message || "Unable to save contract.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this contract?"
    );

    if (!confirmed) return;

    setPageError("");

    try {
      await contractsApi.remove(id);

      setContracts((previous) =>
        previous.filter((item) => item.id !== id)
      );
    } catch (err) {
      setPageError(err.message || "Unable to delete contract.");
    }
  };

  const getStatusClass = (status) => {
    return String(status || "").toLowerCase().replace(" ", "-");
  };

  return (
    <div className="contracts-page">
      <div className="contracts-header">
        <div>
          <span className="contracts-eyebrow">MANAGEMENT</span>
          <h1>Contracts</h1>
          <p>Manage agreements, contracts and legal documents.</p>
        </div>

        <button
          className="contract-primary-btn"
          onClick={openAddModal}
          disabled={loading || saving}
        >
          <Plus size={18} />
          Add Contract
        </button>
      </div>

      {pageError && (
        <div className="contract-api-error" role="alert">
          <span>{pageError}</span>
          <button
            type="button"
            onClick={fetchContracts}
            disabled={loading}
          >
            Retry
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="contract-stats">
        <div className="contract-stat-card">
          <div className="contract-stat-icon gold">
            <FileText size={21} />
          </div>
          <div>
            <span>Total Contracts</span>
            <h2>{loading ? "..." : stats.total}</h2>
          </div>
        </div>

        <div className="contract-stat-card">
          <div className="contract-stat-icon green">
            <CheckCircle size={21} />
          </div>
          <div>
            <span>Active Contracts</span>
            <h2>{loading ? "..." : stats.active}</h2>
          </div>
        </div>

        <div className="contract-stat-card">
          <div className="contract-stat-icon blue">
            <Clock size={21} />
          </div>
          <div>
            <span>Draft Contracts</span>
            <h2>{loading ? "..." : stats.draft}</h2>
          </div>
        </div>

        <div className="contract-stat-card">
          <div className="contract-stat-icon red">
            <AlertCircle size={21} />
          </div>
          <div>
            <span>Expired Contracts</span>
            <h2>{loading ? "..." : stats.expired}</h2>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="contracts-toolbar">
        <div className="contract-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by contract, party or project..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <select
          value={typeFilter}
          onChange={(event) => setTypeFilter(event.target.value)}
        >
          <option value="All">All Types</option>
          <option value="Artist">Artist</option>
          <option value="Director">Director</option>
          <option value="Producer">Producer</option>
          <option value="Vendor">Vendor</option>
          <option value="OTT Platform">OTT Platform</option>
        </select>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Draft">Draft</option>
          <option value="Expired">Expired</option>
          <option value="Terminated">Terminated</option>
        </select>
      </div>

      {/* Contracts Table */}
      <div className="contracts-table-card">
        <div className="contracts-table-heading">
          <div>
            <h3>All Contracts</h3>
            <p>
              {loading
                ? "Loading contracts..."
                : `${filteredContracts.length} contracts found`}
            </p>
          </div>
        </div>

        <div className="contracts-table-wrapper">
          <table className="contracts-table">
            <thead>
              <tr>
                <th>CONTRACT</th>
                <th>PARTY NAME</th>
                <th>TYPE</th>
                <th>PROJECT</th>
                <th>CONTRACT VALUE</th>
                <th>END DATE</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="contract-empty">
                    Loading contracts...
                  </td>
                </tr>
              ) : filteredContracts.length > 0 ? (
                filteredContracts.map((contract) => (
                  <tr key={contract.id}>
                    <td>
                      <div className="contract-name-cell">
                        <div className="contract-file-icon">
                          <FileText size={18} />
                        </div>
                        <div>
                          <strong>{contract.title}</strong>
                          <span>{contract.contractCode}</span>
                        </div>
                      </div>
                    </td>

                    <td>{contract.party}</td>
                    <td>{contract.type}</td>
                    <td>{contract.project}</td>
                    <td className="contract-value">
                      {formatCurrency(contract.value)}
                    </td>
                    <td>{contract.endDate}</td>

                    <td>
                      <span
                        className={`contract-status ${getStatusClass(
                          contract.status
                        )}`}
                      >
                        {contract.status}
                      </span>
                    </td>

                    <td>
                      <div className="contract-actions">
                        <button
                          title="View"
                          onClick={() => setViewContract(contract)}
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          title="Edit"
                          onClick={() => openEditModal(contract)}
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          title="Delete"
                          className="delete-action"
                          onClick={() => handleDelete(contract.id)}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="contract-empty">
                    No contracts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="contract-modal-overlay">
          <div className="contract-modal">
            <div className="contract-modal-header">
              <div>
                <h2>
                  {selectedContract ? "Edit Contract" : "Add New Contract"}
                </h2>
                <p>Enter the contract information below.</p>
              </div>

              <button onClick={closeModal} className="contract-close-btn">
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="contract-form-grid">
                <div className="contract-form-group full">
                  <label>Contract Title *</label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Enter contract title"
                  />
                </div>

                <div className="contract-form-group">
                  <label>Contract Type *</label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                  >
                    <option>Artist</option>
                    <option>Director</option>
                    <option>Producer</option>
                    <option>Vendor</option>
                    <option>OTT Platform</option>
                  </select>
                </div>

                <div className="contract-form-group">
                  <label>Party Name *</label>
                  <input
                    name="party"
                    value={form.party}
                    onChange={handleChange}
                    placeholder="Enter party name"
                  />
                </div>

                <div className="contract-form-group full">
                  <label>Related Project *</label>
                  {projectNames.length > 0 ? (
                    <select
                      name="project"
                      value={form.project}
                      onChange={handleChange}
                    >
                      <option value="">Select project</option>
                      {form.project &&
                        !projectNames.includes(form.project) && (
                          <option value={form.project}>{form.project}</option>
                        )}
                      {projectNames.map((name) => (
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
                      placeholder="Enter project name"
                    />
                  )}
                </div>

                <div className="contract-form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="contract-form-group">
                  <label>End Date *</label>
                  <input
                    type="date"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="contract-form-group">
                  <label>Contract Value (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    name="value"
                    value={form.value}
                    onChange={handleChange}
                    placeholder="Enter amount"
                  />
                </div>

                <div className="contract-form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option>Draft</option>
                    <option>Active</option>
                    <option>Expired</option>
                    <option>Terminated</option>
                  </select>
                </div>

                <div className="contract-form-group full">
                  <label>Payment Terms</label>
                  <textarea
                    name="paymentTerms"
                    value={form.paymentTerms}
                    onChange={handleChange}
                    placeholder="Enter payment terms..."
                    rows="3"
                  />
                </div>

                <div className="contract-form-group full">
                  <label>Contract Document</label>
                  <label className="contract-upload-box">
                    <Upload size={20} />
                    <span>
                      {form.document || "Click to upload a contract document"}
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleDocument}
                    />
                  </label>
                </div>
              </div>

              {error && <p className="contract-form-error">{error}</p>}

              <div className="contract-modal-footer">
                <button
                  type="button"
                  className="contract-cancel-btn"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="contract-primary-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : selectedContract
                      ? "Update Contract"
                      : "Save Contract"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewContract && (
        <div className="contract-modal-overlay">
          <div className="contract-modal contract-view-modal">
            <div className="contract-modal-header">
              <div>
                <h2>Contract Details</h2>
                <p>{viewContract.contractCode}</p>
              </div>

              <button
                onClick={() => setViewContract(null)}
                className="contract-close-btn"
              >
                <X size={21} />
              </button>
            </div>

            <div className="contract-details-grid">
              {[
                ["Contract Title", viewContract.title],
                ["Party Name", viewContract.party],
                ["Contract Type", viewContract.type],
                ["Related Project", viewContract.project],
                ["Start Date", viewContract.startDate],
                ["End Date", viewContract.endDate],
                ["Contract Value", formatCurrency(viewContract.value)],
                ["Status", viewContract.status],
                ["Payment Terms", viewContract.paymentTerms || "Not specified"],
                ["Document", viewContract.document || "No document uploaded"],
              ].map(([label, value]) => (
                <div className="contract-detail-item" key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>

            <div className="contract-modal-footer">
              <button
                className="contract-cancel-btn"
                onClick={() => setViewContract(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ContractsPage;