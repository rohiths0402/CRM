
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus,
  Users,
  UserCheck,
  UserX,
  Briefcase,
  RefreshCw,
} from "lucide-react";
import CastCrewTable from "../../components/cast-crew/CastCrewTable";
import CastCrewFilters from "../../components/cast-crew/CastCrewFilters";
import CastCrewModal from "../../components/cast-crew/CastCrewModal";
import {
  castCrewApi,
  fetchProjectNames,
  toFormValues,
} from "../../services/crmApi";
import "./CastCrewPage.css";

function CastCrewPage() {
  const [members, setMembers] = useState([]);
  const [projectNames, setProjectNames] = useState([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("All");
  const [status, setStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [viewingMember, setViewingMember] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const pageSize = 5;

  // Load members from the backend
  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const list = await castCrewApi.list();
      setMembers(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.message || "Unable to load cast & crew.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Project names for the "Assigned Project" dropdown (non-fatal if it fails)
  const loadProjectNames = useCallback(async () => {
    try {
      setProjectNames(await fetchProjectNames());
    } catch {
      setProjectNames([]);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
    loadProjectNames();
  }, [fetchMembers, loadProjectNames]);

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const query = search.toLowerCase();
      const matchesSearch =
        String(member.name || "").toLowerCase().includes(query) ||
        String(member.email || "").toLowerCase().includes(query);

      const matchesRole = role === "All" || member.role === role;
      const matchesStatus = status === "All" || member.status === status;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [members, search, role, status]);

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const openAddModal = () => {
    setSaveError("");
    loadProjectNames();
    setEditingMember(null);
    setViewingMember(null);
    setIsModalOpen(true);
  };

  const openEditModal = (member) => {
    setSaveError("");
    loadProjectNames();
    setEditingMember(toFormValues(member));
    setViewingMember(null);
    setIsModalOpen(true);
  };

  const openViewModal = (member) => {
    setViewingMember(toFormValues(member));
    setEditingMember(null);
    setIsModalOpen(true);
  };

  // Create or update a member; the modal stays open if the save fails
  const handleSave = async (formData) => {
    setSaving(true);
    setSaveError("");

    try {
      if (editingMember) {
        const saved = await castCrewApi.update(editingMember.id, formData);

        setMembers((prev) =>
          prev.map((member) =>
            member.id === saved.id ? saved : member
          )
        );
      } else {
        const saved = await castCrewApi.create(formData);

        setMembers((prev) => [saved, ...prev]);
        setCurrentPage(1);
      }

      setIsModalOpen(false);
      setEditingMember(null);
      setViewingMember(null);
    } catch (err) {
      setSaveError(err.message || "Unable to save member.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (member) => {
    const confirmed = window.confirm(
      `Delete ${member.name} from Cast & Crew?`
    );

    if (!confirmed) return;

    setError("");

    try {
      await castCrewApi.remove(member.id);

      setMembers((prev) =>
        prev.filter((item) => item.id !== member.id)
      );
    } catch (err) {
      setError(err.message || "Unable to delete member.");
    }
  };

  const closeModal = () => {
    if (saving) return;

    setIsModalOpen(false);
    setSaveError("");
    setEditingMember(null);
    setViewingMember(null);
  };

  const availableCount = members.filter(
    (member) => member.status === "Available"
  ).length;

  const onProjectCount = members.filter(
    (member) => member.status === "On Project"
  ).length;

  return (
    <div className="cast-crew-page">
      <div className="cast-crew-header">
        <div>
          <span className="page-eyebrow">TEAM MANAGEMENT</span>
          <h1>Cast & Crew</h1>
          <p>Manage actors, directors and production professionals.</p>
        </div>

        <button
          className="add-member-btn"
          onClick={openAddModal}
          disabled={loading}
        >
          <Plus size={18} />
          Add Member
        </button>
      </div>

      <div className="cast-crew-stats">
        <div className="cast-stat-card">
          <div className="cast-stat-icon"><Users /></div>
          <div>
            <span>Total Members</span>
            <h2>{loading ? "..." : members.length}</h2>
          </div>
        </div>

        <div className="cast-stat-card">
          <div className="cast-stat-icon"><UserCheck /></div>
          <div>
            <span>Available</span>
            <h2>{loading ? "..." : availableCount}</h2>
          </div>
        </div>

        <div className="cast-stat-card">
          <div className="cast-stat-icon"><Briefcase /></div>
          <div>
            <span>On Project</span>
            <h2>{loading ? "..." : onProjectCount}</h2>
          </div>
        </div>

        <div className="cast-stat-card">
          <div className="cast-stat-icon"><UserX /></div>
          <div>
            <span>Unavailable</span>
            <h2>
              {loading
                ? "..."
                : members.filter((m) => m.status === "Unavailable").length}
            </h2>
          </div>
        </div>
      </div>

      {error && (
        <div className="cast-api-error" role="alert">
          <span>{error}</span>

          <button type="button" onClick={fetchMembers} disabled={loading}>
            <RefreshCw size={15} />
            Retry
          </button>
        </div>
      )}

      <CastCrewFilters
        search={search}
        setSearch={(value) => {
          setSearch(value);
          setCurrentPage(1);
        }}
        role={role}
        setRole={(value) => {
          setRole(value);
          setCurrentPage(1);
        }}
        status={status}
        setStatus={(value) => {
          setStatus(value);
          setCurrentPage(1);
        }}
      />

      {loading ? (
        <div className="cast-loading">
          <RefreshCw size={22} className="cast-loading-icon" />
          <p>Loading cast & crew...</p>
        </div>
      ) : (
        <CastCrewTable
          members={paginatedMembers}
          onView={openViewModal}
          onEdit={openEditModal}
          onDelete={handleDelete}
        />
      )}

      <div className="cast-crew-pagination">
        <span>
          Showing {filteredMembers.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
          {" "}to {Math.min(currentPage * pageSize, filteredMembers.length)}
          {" "}of {filteredMembers.length} members
        </span>

        <div>
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((page) => page - 1)}
          >
            Previous
          </button>
          <span>{currentPage} / {totalPages}</span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((page) => page + 1)}
          >
            Next
          </button>
        </div>
      </div>

      <CastCrewModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSave}
        editingMember={editingMember}
        viewingMember={viewingMember}
        projectNames={projectNames}
        saving={saving}
        submitError={saveError}
      />
    </div>
  );
}

export default CastCrewPage;
