import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../config/navigation';
import { getPartnerships } from '../../services';

const STATUS_OPTIONS = ['All', 'Active', 'Renewal'];

function StatusBadge({ status }) {
    const tone = status === 'Active' ? 'ok' : 'warn';
    return <span className={`badge badge-${tone}`}>{status}</span>;
}

export default function PartnershipsPage() {
    const { user } = useAuth();
    const isSuper = user?.role === ROLES.SUPER_ADMIN;

    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState('All');

    useEffect(() => {
        let active = true;
        setLoading(true);

        getPartnerships()
            .then((res) => active && setPartners(res))
            .catch((err) => active && setError(err.message))
            .finally(() => active && setLoading(false));

        return () => {
            active = false;
        };
    }, [user]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return partners.filter((p) => {
            const matchesText =
                !q || `${p.name} ${p.type} ${p.contractEnd}`.toLowerCase().includes(q);
            const matchesStatus = status === 'All' || p.status === status;
            return matchesText && matchesStatus;
        });
    }, [partners, query, status]);

    if (error) return <p className="alert alert-error">{error}</p>;

    return (
        <section className="page-section">
            <div className="page-head">
                <div>
                    <p className="eyebrow">PARTNERSHIPS</p>
                    <h1 className="page-title">All partners</h1>
                    <p className="muted">
                        {isSuper
                            ? 'All partnerships are listed here.'
                            : 'View only. You cannot edit partnerships.'}
                    </p>
                </div>

                {isSuper && (
                    <Link to="/partnerships/new" className="btn-primary-sm">
                        + Add Partner
                    </Link>
                )}
            </div>

            <div className="panel">
                <div className="toolbar">
                    <input
                        className="toolbar-search"
                        type="search"
                        placeholder="Search by partner, type or contract date..."
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
                    <p className="muted">No partners found.</p>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Partner</th>
                                <th>Type</th>
                                <th>Contract ends</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((p) => (
                                <tr key={p.id}>
                                    <td>{p.id}</td>
                                    <td>{p.name}</td>
                                    <td>{p.type}</td>
                                    <td>{p.contractEnd}</td>
                                    <td>
                                        <StatusBadge status={p.status} />
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