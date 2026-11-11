
import React, { useCallback, useMemo, useState, useEffect } from "react";
import {
  Plus,
  Clapperboard,
  Film,
  CheckCircle,
  Clock,
  RefreshCw,
} from "lucide-react";

import OTTProjectTable from "../../components/ott-projects/OTTProjectTable";
import OTTProjectFilters from "../../components/ott-projects/OTTProjectFilters";
import OTTProjectModal from "../../components/ott-projects/OTTProjectModal";
import DeleteProjectModal from "../../components/ott-projects/DeleteProjectModal";
import { ottProjectsApi, toFormValues } from "../../services/crmApi";

import "./OTTProjectsPage.css";

function OTTProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState("All");
  const [status, setStatus] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [viewingProject, setViewingProject] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Load projects from the backend
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setLoadError("");

    try {
      const list = await ottProjectsApi.list();
      setProjects(Array.isArray(list) ? list : []);
    } catch (err) {
      setLoadError(err.message || "Unable to load OTT projects.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const filteredProjects = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesSearch = [
        project.projectName,
        project.projectManager,
        project.genre,
        project.language,
      ].some((value) =>
        String(value || "").toLowerCase().includes(searchText)
      );

      const matchesPlatform =
        platform === "All" || project.platform === platform;

      const matchesStatus =
        status === "All" || project.status === status;

      return matchesSearch && matchesPlatform && matchesStatus;
    });
  }, [projects, search, platform, status]);

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;

  const paginatedProjects = filteredProjects.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }

    if (totalPages === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const handleSearchChange = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handlePlatformChange = (value) => {
    setPlatform(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value) => {
    setStatus(value);
    setCurrentPage(1);
  };

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const openAddModal = () => {
    setSaveError("");
    setEditingProject(null);
    setViewingProject(null);
    setIsModalOpen(true);
  };

  const openEditModal = (project) => {
    setSaveError("");
    setEditingProject(toFormValues(project));
    setViewingProject(null);
    setIsModalOpen(true);
  };

  const openViewModal = (project) => {
    setEditingProject(null);
    setViewingProject(toFormValues(project));
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setIsModalOpen(false);
    setSaveError("");
    setEditingProject(null);
    setViewingProject(null);
  };

  // Create or update a project; the modal stays open if the save fails
  const handleSubmit = async (formData) => {
    setSaving(true);
    setSaveError("");

    try {
      if (editingProject) {
        const saved = await ottProjectsApi.update(editingProject.id, formData);

        setProjects((prev) =>
          prev.map((project) =>
            project.id === saved.id ? saved : project
          )
        );
      } else {
        const saved = await ottProjectsApi.create(formData);

        setProjects((prev) => [saved, ...prev]);
        setCurrentPage(1);
      }

      setIsModalOpen(false);
      setEditingProject(null);
      setViewingProject(null);
    } catch (err) {
      setSaveError(err.message || "Unable to save the project.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    const selectedProject = projects.find((project) => project.id === id);

    if (selectedProject) {
      setDeleteError("");
      setDeleteTarget(selectedProject);
    }
  };

  const closeDeleteModal = () => {
    if (deleting) return;

    setDeleteTarget(null);
    setDeleteError("");
  };

  // Projects with expenses are refused by the server (409); show its message
  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    setDeleteError("");

    try {
      await ottProjectsApi.remove(deleteTarget.id);

      setProjects((prev) =>
        prev.filter((project) => project.id !== deleteTarget.id)
      );
      setDeleteTarget(null);
    } catch (err) {
      setDeleteError(err.message || "Unable to delete the project.");
    } finally {
      setDeleting(false);
    }
  };

  const activeCount = projects.filter(
    (project) => project.status === "In Progress"
  ).length;

  const completedCount = projects.filter(
    (project) => project.status === "Completed"
  ).length;

  const planningCount = projects.filter(
    (project) => project.status === "Planning"
  ).length;

  return (
    <div className="ott-projects-page">
      <div className="ott-page-heading">
        <div>
          <span className="ott-eyebrow">PRODUCTION MANAGEMENT</span>
          <h1>OTT Projects</h1>
          <p>Manage movies, web series and OTT productions.</p>
        </div>

        <button
          type="button"
          className="ott-add-btn"
          onClick={openAddModal}
          disabled={loading}
        >
          <Plus size={18} />
          Add Project
        </button>
      </div>

      <div className="ott-stats-grid">
        <div className="ott-stat-card">
          <div className="ott-stat-icon"><Clapperboard size={21} /></div>
          <div><span>Total Projects</span><h2>{loading ? "..." : projects.length}</h2></div>
        </div>

        <div className="ott-stat-card">
          <div className="ott-stat-icon"><Clock size={21} /></div>
          <div><span>In Progress</span><h2>{loading ? "..." : activeCount}</h2></div>
        </div>

        <div className="ott-stat-card">
          <div className="ott-stat-icon"><CheckCircle size={21} /></div>
          <div><span>Completed</span><h2>{loading ? "..." : completedCount}</h2></div>
        </div>

        <div className="ott-stat-card">
          <div className="ott-stat-icon"><Film size={21} /></div>
          <div><span>Planning</span><h2>{loading ? "..." : planningCount}</h2></div>
        </div>
      </div>

      {loadError && (
        <div className="ott-api-error" role="alert">
          <span>{loadError}</span>

          <button
            type="button"
            onClick={fetchProjects}
            disabled={loading}
          >
            <RefreshCw size={15} />
            Retry
          </button>
        </div>
      )}

      <div className="ott-list-section">
        <div className="ott-list-heading">
          <div>
            <h2>All OTT Projects</h2>
            <p>
              {loading
                ? "Loading projects..."
                : `${filteredProjects.length} projects found`}
            </p>
          </div>
        </div>

        <OTTProjectFilters
          search={search}
          setSearch={handleSearchChange}
          platform={platform}
          setPlatform={handlePlatformChange}
          status={status}
          setStatus={handleStatusChange}
        />

        {loading ? (
          <div className="ott-loading">
            <RefreshCw size={22} className="ott-loading-icon" />
            <p>Loading projects...</p>
          </div>
        ) : (
          <OTTProjectTable
            projects={paginatedProjects}
            onView={openViewModal}
            onEdit={openEditModal}
            onDelete={handleDelete}
          />
        )}

        <div className="ott-pagination">
          <span>
            Showing {filteredProjects.length === 0 ? 0 : startIndex + 1}
            {"–"}
            {Math.min(startIndex + itemsPerPage, filteredProjects.length)}
            {" "}of {filteredProjects.length} projects
          </span>

          <div className="ott-pagination-buttons">
            <button
              type="button"
              disabled={currentPage === 1 || totalPages === 0}
              onClick={() => goToPage(currentPage - 1)}
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, index) => {
              const page = index + 1;

              return (
                <button
                  type="button"
                  key={page}
                  className={currentPage === page ? "current-page" : ""}
                  onClick={() => goToPage(page)}
                  aria-current={currentPage === page ? "page" : undefined}
                >
                  {page}
                </button>
              );
            })}

            <button
              type="button"
              disabled={currentPage >= totalPages || totalPages === 0}
              onClick={() => goToPage(currentPage + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <OTTProjectModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        editingProject={editingProject}
        viewingProject={viewingProject}
        saving={saving}
        submitError={saveError}
      />

      <DeleteProjectModal
        isOpen={Boolean(deleteTarget)}
        projectName={deleteTarget?.projectName || ""}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        deleting={deleting}
        error={deleteError}
      />
    </div>
  );
}

export default OTTProjectsPage;
