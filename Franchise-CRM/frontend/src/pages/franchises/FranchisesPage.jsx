import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../config/navigation';
import { getFranchises } from '../../services';
import { Link } from 'react-router-dom';

const STATUS_OPTIONS = ['All', 'Active', 'Pending', 'Inactive'];

function StatusBadge({ status }) {
    const tone =
        status === 'Active' ? 'ok' : status === 'Pending' ? 'warn' : 'muted';
    return <span className={`badge badge-${tone}`}>{status}</span>;
}

export default function FranchisesPage() {
    const { user } = useAuth();
    const isSuper = user?.role === ROLES.SUPER_ADMIN;

    const [franchises, setFranchises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState('All');

    useEffect(() => {
        let active = true;
        setLoading(true);

        getFranchises(user)
            .then((res) => active && setFranchises(res))
            .catch((err) => active && setError(err.message))
            .finally(() => active && setLoading(false));

        return () => {
            active = false;
        };
    }, [user]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return franchises.filter((f) => {
            const matchesText =
                !q || `${f.name} ${f.city} ${f.owner}`.toLowerCase().includes(q);
            const matchesStatus = status === 'All' || f.status === status;
            return matchesText && matchesStatus;
        });
    }, [franchises, query, status]);

    if (error) return <p className="alert alert-error">{error}</p>;

    return (
        <section className="page-section">
            <div className="page-head">
                <div>
                    <p className="eyebrow">FRANCHISES</p>
                    <h1 className="page-title">All franchises</h1>
                    <p className="muted">
                        {isSuper
                            ? 'All franchises are listed here.'
                            : 'Only the franchises assigned to you are listed here.'}
                    </p>
                </div>

                {isSuper && (
                    <Link to="/franchises/new" className="btn-primary-sm">
                        + New Franchise
                    </Link>
                )}
            </div>

            <div className="panel">
                <div className="toolbar">
                    <input
                        className="toolbar-search"
                        type="search"
                        placeholder="Search by name, city or owner..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />

                    <select
                        className="toolbar-select"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </select>
                </div>

                {loading ? (
                    <p className="muted">Loading...</p>
                ) : filtered.length === 0 ? (
                    <p className="muted">No franchises found.</p>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>City</th>
                                <th>Owner</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((f) => (
                                <tr key={f.id}>
                                    <td>{f.id}</td>
                                    <td>
                                        <Link to={`/franchises/${f.id}`} className="table-link">
                                            {f.name}
                                        </Link>
                                    </td>
                                    <td>{f.city}</td>
                                    <td>{f.owner}</td>
                                    <td>
                                        <StatusBadge status={f.status} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </section>
    );
}