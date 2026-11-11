import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import "./ResourcePage.css";

/**
 * A list page with stat cards, search, a status filter, a table and a
 * create/edit modal, driven by a config object. Used by the Vendor CRM pages
 * and Users & Access. See pages/vendor/vendorPages.jsx for example configs.
 *
 * config:
 *   eyebrow, title, description, addLabel, singular
 *   api: { list, create, update, remove }
 *   lookups: { name: () => Promise<array> } — loaded with the records, passed to columns/fields
 *   stats(records, lookups): [{ label, value, icon, tone }]
 *   searchText(record, lookups): text matched by the search box
 *   statusField, statusOptions: the status filter
 *   columns: [{ label, render(record, lookups) }]
 *   fields: [{ name, label, type, required, options, full, placeholder, hint,
 *              createOnly, visible(form), onChange(value, form, lookups) → patch }]
 *     options: array of strings / {value,label}, or (lookups, form) => array
 *   defaults(): initial form values for a new record
 *   toPayload(form): the request body (default: numbers for type "number" fields)
 *   canEdit(record), canDelete(record)
 */
export default function ResourcePage({ config }) {
  const {
    api,
    lookups: lookupLoaders = {},
    fields,
    columns,
    singular,
  } = config;

  const [records, setRecords] = useState([]);
  const [lookups, setLookups] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [editing, setEditing] = useState(null); // null, "new" or the record
  const [form, setForm] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const names = Object.keys(lookupLoaders);
      const [list, ...lookupLists] = await Promise.all([
        api.list(),
        ...names.map((name) => lookupLoaders[name]()),
      ]);

      setRecords(list || []);
      setLookups(
        Object.fromEntries(names.map((name, i) => [name, lookupLists[i] || []]))
      );
    } catch (err) {
      setError(err.message || "Unable to load records.");
    } finally {
      setLoading(false);
    }
    // lookupLoaders and api are module-level config objects.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(""), 3500);
    return () => clearTimeout(timer);
  }, [notice]);

  const visibleRecords = useMemo(() => {
    const term = search.trim().toLowerCase();

    return records.filter((record) => {
      if (
        config.statusField &&
        statusFilter !== "All" &&
        record[config.statusField] !== statusFilter
      ) {
        return false;
      }

      if (!term) return true;
      const text = config.searchText
        ? config.searchText(record, lookups)
        : Object.values(record).join(" ");
      return String(text).toLowerCase().includes(term);
    });
  }, [records, lookups, search, statusFilter, config]);

  const isNew = editing === "new";
  const activeFields = fields.filter(
    (field) =>
      !(field.createOnly && !isNew) && (!field.visible || field.visible(form))
  );

  const openCreate = () => {
    setForm(config.defaults ? config.defaults(lookups) : {});
    setFormError("");
    setEditing("new");
  };

  const openEdit = (record) => {
    const values = {};
    fields.forEach((field) => {
      const value = record[field.name];
      values[field.name] = value === null || value === undefined ? "" : String(value);
    });
    setForm(values);
    setFormError("");
    setEditing(record);
  };

  const closeModal = () => {
    if (!saving) setEditing(null);
  };

  const handleFieldChange = (field, value) => {
    setForm((current) => {
      const next = { ...current, [field.name]: value };
      return field.onChange ? { ...next, ...field.onChange(value, next, lookups) } : next;
    });
  };

  const buildPayload = () => {
    if (config.toPayload) return config.toPayload(form);

    const payload = {};
    fields.forEach((field) => {
      if (field.createOnly && !isNew) return;
      const value = form[field.name] ?? "";
      payload[field.name] =
        field.type === "number" || field.numeric
          ? value === "" ? null : Number(value)
          : value;
    });
    return payload;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    const missing = activeFields.find(
      (field) => field.required && !String(form[field.name] ?? "").trim()
    );
    if (missing) {
      setFormError(`${missing.label} is required.`);
      return;
    }

    try {
      setSaving(true);
      if (isNew) {
        await api.create(buildPayload());
        setNotice(`${singular} added.`);
      } else {
        await api.update(editing.id, buildPayload());
        setNotice(`${singular} updated.`);
      }
      setEditing(null);
      await load();
    } catch (err) {
      setFormError(err.message || "Unable to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setDeleteError("");

    try {
      await api.remove(deleting.id);
      setDeleting(null);
      setNotice(`${singular} deleted.`);
      await load();
    } catch (err) {
      setDeleteError(err.message || "Unable to delete.");
    }
  };

  const stats = config.stats ? config.stats(records, lookups) : [];

  return (
    <div className="rp-page">
      <div className="rp-header">
        <div>
          <span className="rp-eyebrow">{config.eyebrow}</span>
          <h1>{config.title}</h1>
          <p>{config.description}</p>
        </div>

        {config.addLabel && (
          <button className="rp-primary-btn" type="button" onClick={openCreate} disabled={loading}>
            <Plus size={17} />
            {config.addLabel}
          </button>
        )}
      </div>

      {notice && <div className="rp-notice">{notice}</div>}

      {stats.length > 0 && (
        <div className="rp-stats">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div className="rp-stat-card" key={stat.label}>
                {Icon && (
                  <div className={`rp-stat-icon ${stat.tone || "gold"}`}>
                    <Icon size={21} />
                  </div>
                )}
                <div>
                  <span>{stat.label}</span>
                  <h2>{loading ? "—" : stat.value}</h2>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="rp-toolbar">
        <label className="rp-search">
          <Search size={17} />
          <input
            type="search"
            placeholder={config.searchPlaceholder || "Search..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>

        {config.statusField && (
          <select
            className="rp-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="All">All statuses</option>
            {config.statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        )}
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
        <div className="rp-table-card">
          <div className="rp-table-scroll">
            <table className="rp-table">
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th key={column.label}>{column.label}</th>
                  ))}
                  <th className="rp-actions-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={columns.length + 1} className="rp-empty">
                      Loading...
                    </td>
                  </tr>
                ) : visibleRecords.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 1} className="rp-empty">
                      {records.length === 0
                        ? config.emptyText || "Nothing here yet."
                        : "No records match your search."}
                    </td>
                  </tr>
                ) : (
                  visibleRecords.map((record) => (
                    <tr key={record.id}>
                      {columns.map((column) => (
                        <td key={column.label}>{column.render(record, lookups)}</td>
                      ))}
                      <td className="rp-actions-col">
                        <div className="rp-row-actions">
                          {(!config.canEdit || config.canEdit(record)) && (
                            <button
                              type="button"
                              onClick={() => openEdit(record)}
                              aria-label={`Edit ${singular}`}
                              title="Edit"
                            >
                              <Pencil size={15} />
                            </button>
                          )}
                          {(!config.canDelete || config.canDelete(record)) && (
                            <button
                              type="button"
                              className="danger"
                              onClick={() => {
                                setDeleteError("");
                                setDeleting(record);
                              }}
                              aria-label={`Delete ${singular}`}
                              title="Delete"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {!loading && records.length > 0 && (
            <div className="rp-table-footer">
              Showing {visibleRecords.length} of {records.length}
            </div>
          )}
        </div>
      )}

      {editing && (
        <div className="rp-modal-overlay" onMouseDown={closeModal}>
          <form
            className="rp-modal"
            onSubmit={handleSubmit}
            onMouseDown={(e) => e.stopPropagation()}
            noValidate
          >
            <div className="rp-modal-header">
              <h3>{isNew ? config.addLabel : `Edit ${singular}`}</h3>
              <button type="button" onClick={closeModal} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <div className="rp-modal-body">
              {formError && <div className="rp-form-error">{formError}</div>}

              <div className="rp-form-grid">
                {activeFields.map((field) => (
                  <FormField
                    key={field.name}
                    field={field}
                    value={form[field.name] ?? ""}
                    form={form}
                    lookups={lookups}
                    onChange={(value) => handleFieldChange(field, value)}
                  />
                ))}
              </div>
            </div>

            <div className="rp-modal-footer">
              <button type="button" className="rp-secondary-btn" onClick={closeModal}>
                Cancel
              </button>
              <button type="submit" className="rp-primary-btn" disabled={saving}>
                {saving ? "Saving..." : isNew ? "Save" : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      )}

      {deleting && (
        <div className="rp-modal-overlay" onMouseDown={() => setDeleting(null)}>
          <div className="rp-modal rp-confirm" onMouseDown={(e) => e.stopPropagation()}>
            <div className="rp-modal-body">
              <div className="rp-confirm-icon">
                <Trash2 size={22} />
              </div>
              <h3>Delete this {singular.toLowerCase()}?</h3>
              <p>{config.deleteLabel ? config.deleteLabel(deleting, lookups) : ""}</p>
              {deleteError && <div className="rp-form-error">{deleteError}</div>}
            </div>
            <div className="rp-modal-footer">
              <button type="button" className="rp-secondary-btn" onClick={() => setDeleting(null)}>
                Cancel
              </button>
              <button type="button" className="rp-danger-btn" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FormField({ field, value, form, lookups, onChange }) {
  const id = `rp-field-${field.name}`;
  const options =
    typeof field.options === "function" ? field.options(lookups, form) : field.options || [];

  let input;
  if (field.type === "select") {
    input = (
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        {field.placeholder !== undefined && <option value="">{field.placeholder}</option>}
        {options.map((option) => {
          const { value: optionValue, label } =
            typeof option === "object" ? option : { value: option, label: option };
          return (
            <option key={optionValue} value={optionValue}>
              {label}
            </option>
          );
        })}
      </select>
    );
  } else if (field.type === "textarea") {
    input = (
      <textarea
        id={id}
        rows={3}
        value={value}
        placeholder={field.placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  } else {
    input = (
      <input
        id={id}
        type={field.type || "text"}
        value={value}
        placeholder={field.placeholder}
        min={field.type === "number" ? field.min ?? 0 : undefined}
        step={field.type === "number" ? field.step || "any" : undefined}
        autoComplete={field.type === "password" ? "new-password" : "off"}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  return (
    <div className={`rp-field ${field.full ? "full" : ""}`}>
      <label htmlFor={id}>
        {field.label}
        {field.required && <span className="rp-required">*</span>}
      </label>
      {input}
      {field.hint && <small>{field.hint}</small>}
    </div>
  );
}

/** A coloured status pill. tones: { status: "green" | "gold" | "blue" | "red" | "grey" } */
export function StatusBadge({ value, tones = {} }) {
  if (!value) return <span className="rp-muted">—</span>;
  return <span className={`rp-badge ${tones[value] || "grey"}`}>{value}</span>;
}
