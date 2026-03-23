import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFaculty, getSubjects, getBatches, getMappings, getTimetableStats, seedBatches } from '../services/api';

const StatCard = ({ icon, title, value, color, link, loading }) => (
    <div className="col-xl-3 col-md-6 mb-4">
        <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px', transition: 'transform 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <div className="card-body d-flex align-items-center">
                <div className="rounded-circle d-flex align-items-center justify-content-center me-4 flex-shrink-0"
                    style={{ width: 64, height: 64, background: color, opacity: 0.9 }}>
                    <i className={`bi ${icon} text-white fs-4`}></i>
                </div>
                <div>
                    <p className="mb-1 text-muted small fw-semibold text-uppercase" style={{ letterSpacing: '0.5px' }}>{title}</p>
                    <h2 className="mb-0 fw-bold">{loading ? <span className="spinner-border spinner-border-sm" /> : value}</h2>
                </div>
            </div>
            {link && (
                <div className="card-footer bg-transparent border-top-0 pt-0 pb-3 px-4">
                    <Link to={link} className="text-decoration-none small fw-semibold" style={{ color: '#667eea' }}>
                        View Details <i className="bi bi-arrow-right-short"></i>
                    </Link>
                </div>
            )}
        </div>
    </div>
);

const AdminDashboard = () => {
    const [stats, setStats] = useState({ faculty: 0, subjects: 0, batches: 0, mappings: 0, slots: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [f, s, b, m] = await Promise.all([
                    getFaculty(), getSubjects(), getBatches(), getMappings()
                ]);
                let slots = 0;
                try { const st = await getTimetableStats(); slots = st.data.data.totalSlots; } catch { }
                setStats({
                    faculty: f.data.count,
                    subjects: s.data.count,
                    batches: b.data.count,
                    mappings: m.data.count,
                    slots,
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const handleSeedBatches = async () => {
        try {
            setLoading(true);
            await seedBatches();
            const b = await getBatches();
            setStats(prev => ({ ...prev, batches: b.data.count }));
            alert('Batches seeded successfully!');
        } catch (err) {
            console.error(err);
            alert('Failed to seed batches');
        } finally {
            setLoading(false);
        }
    };

    const quickLinks = [
        { to: '/faculty', icon: 'bi-people-fill', label: 'Manage Faculty', desc: 'Add, edit, remove faculty members' },
        { to: '/subjects', icon: 'bi-book-fill', label: 'Manage Subjects', desc: 'Define subjects and hours per week' },
        { to: '/mappings', icon: 'bi-diagram-3-fill', label: 'Create Mappings', desc: 'Assign faculty to subjects & batches' },
        { to: '/generate', icon: 'bi-lightning-fill', label: 'Generate Timetable', desc: 'Auto-generate conflict-free schedule' },
        { to: '/timetable', icon: 'bi-table', label: 'View Timetable', desc: 'Browse generated timetables' },
    ];

    return (
        <div>
            <div className="d-flex align-items-center justify-content-between mb-4">
                <div>
                    <h2 className="fw-bold mb-1">Admin Dashboard</h2>
                    <p className="text-muted mb-0">Overview of the timetable scheduling system</p>
                </div>
                <div className="badge text-white px-3 py-2 fs-6"
                    style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: '10px' }}>
                    <i className="bi bi-shield-check me-2"></i>Administrator
                </div>
            </div>

            {/* Stat Cards */}
            <div className="row">
                <StatCard icon="bi-people-fill" title="Faculty" value={stats.faculty} color="linear-gradient(135deg,#667eea,#764ba2)" link="/faculty" loading={loading} />
                <StatCard icon="bi-book-fill" title="Subjects" value={stats.subjects} color="linear-gradient(135deg,#f093fb,#f5576c)" link="/subjects" loading={loading} />
                <StatCard icon="bi-grid-fill" title="Batches" value={stats.batches} color="linear-gradient(135deg,#4facfe,#00f2fe)" link="/timetable" loading={loading} />
                <StatCard icon="bi-diagram-3-fill" title="Mappings" value={stats.mappings} color="linear-gradient(135deg,#43e97b,#38f9d7)" link="/mappings" loading={loading} />
            </div>

            {!loading && stats.batches === 0 && (
                <div className="alert alert-warning d-flex align-items-center mb-4 border-0 shadow-sm" style={{ borderRadius: '12px' }}>
                    <i className="bi bi-exclamation-triangle-fill fs-4 me-3 text-warning"></i>
                    <div>
                        <strong>No batches found!</strong> You must initialize the standard batches before creating mappings.
                    </div>
                    <button className="btn btn-warning ms-auto fw-bold shadow-sm" onClick={handleSeedBatches}>
                        <i className="bi bi-magic me-2"></i>Seed Default Batches
                    </button>
                </div>
            )}

            {stats.slots > 0 && (
                <div className="alert border-0 mb-4" style={{ background: 'linear-gradient(135deg,#667eea15,#764ba215)', borderRadius: '12px' }}>
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    <strong>{stats.slots}</strong> timetable slots currently generated across all batches.
                    <Link to="/timetable" className="ms-2 fw-semibold text-decoration-none" style={{ color: '#667eea' }}>View →</Link>
                </div>
            )}

            {/* Quick Links */}
            <h5 className="fw-bold mb-3">Quick Actions</h5>
            <div className="row g-3">
                {quickLinks.map(({ to, icon, label, desc }) => (
                    <div className="col-md-4 col-lg-3" key={to}>
                        <Link to={to} className="text-decoration-none">
                            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '14px', transition: 'all 0.2s', cursor: 'pointer' }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(102,126,234,0.25)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}>
                                <div className="card-body text-center py-4">
                                    <div className="mb-3">
                                        <i className={`bi ${icon} fs-1`} style={{ color: '#667eea' }}></i>
                                    </div>
                                    <h6 className="fw-bold mb-1 text-dark">{label}</h6>
                                    <p className="text-muted small mb-0">{desc}</p>
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminDashboard;
