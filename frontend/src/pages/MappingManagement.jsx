import React, { useState, useEffect } from 'react';
import { getMappings, createMapping, deleteMapping, getFaculty, getSubjects, getBatches } from '../services/api';

const MappingManagement = () => {
    const [mappings, setMappings] = useState([]);
    const [faculty, setFaculty] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ facultyId: '', subjectId: '', batchId: '' });
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [filterBatch, setFilterBatch] = useState('');

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [m, f, s, b] = await Promise.all([getMappings(filterBatch ? { batchId: filterBatch } : {}), getFaculty(), getSubjects(), getBatches()]);
            setMappings(m.data.data);
            setFaculty(f.data.data);
            setSubjects(s.data.data);
            setBatches(b.data.data);
        } catch (err) {
            setError('Failed to load data');
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchAll(); }, [filterBatch]); // eslint-disable-line

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await createMapping(form);
            setSuccessMsg('Mapping created successfully!');
            setForm({ facultyId: '', subjectId: '', batchId: '' });
            fetchAll();
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create mapping');
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteMapping(id);
            setMappings(prev => prev.filter(m => m._id !== id));
            setSuccessMsg('Mapping deleted!');
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Delete failed');
        }
    };

    return (
        <div>
            <div className="mb-4">
                <h2 className="fw-bold mb-1">Mapping Management</h2>
                <p className="text-muted mb-0">Assign faculty members to subjects for specific batches</p>
            </div>

            {successMsg && <div className="alert alert-success"><i className="bi bi-check-circle-fill me-2"></i>{successMsg}</div>}
            {error && <div className="alert alert-danger">{error}</div>}

            {!loading && batches.length === 0 && (
                <div className="alert alert-warning border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    <strong>No batches available.</strong> Please go to the <a href="/" className="alert-link">Admin Dashboard</a> and click "Seed Default Batches" to initialize them.
                </div>
            )}

            <div className="row g-4">
                {/* Form Card */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm sticky-top" style={{ borderRadius: '16px', top: '20px' }}>
                        <div className="card-body p-4">
                            <h5 className="fw-bold mb-4">
                                <i className="bi bi-diagram-3-fill me-2" style={{ color: '#43e97b' }}></i>
                                Create New Mapping
                            </h5>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold small text-secondary">Select Faculty</label>
                                    <select className="form-select" value={form.facultyId}
                                        onChange={e => setForm({ ...form, facultyId: e.target.value })} required>
                                        <option value="">-- Choose Faculty --</option>
                                        {faculty.map(f => <option key={f._id} value={f._id}>{f.name} ({f.department})</option>)}
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold small text-secondary">Select Subject</label>
                                    <select className="form-select" value={form.subjectId}
                                        onChange={e => setForm({ ...form, subjectId: e.target.value })} required>
                                        <option value="">-- Choose Subject --</option>
                                        {subjects.map(s => <option key={s._id} value={s._id}>{s.subjectName} ({s.hoursPerWeek}h/w) — Sem{s.semester}</option>)}
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label className="form-label fw-semibold small text-secondary">Select Batch</label>
                                    <select className="form-select" value={form.batchId}
                                        onChange={e => setForm({ ...form, batchId: e.target.value })} required>
                                        <option value="">-- Choose Batch --</option>
                                        {batches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                                    </select>
                                </div>
                                <button type="submit" className="btn w-100 text-white fw-semibold"
                                    style={{ background: 'linear-gradient(135deg,#43e97b,#38f9d7)', border: 'none', borderRadius: '10px' }}>
                                    <i className="bi bi-plus-circle me-2"></i>Create Mapping
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Mappings List */}
                <div className="col-lg-8">
                    <div className="d-flex align-items-center gap-3 mb-3">
                        <label className="fw-semibold small text-secondary">Filter by Batch:</label>
                        <select className="form-select" style={{ maxWidth: '200px' }}
                            value={filterBatch} onChange={e => setFilterBatch(e.target.value)}>
                            <option value="">All Batches</option>
                            {batches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                        </select>
                        <span className="badge bg-light text-dark px-3 py-2">{mappings.length} mappings</span>
                    </div>

                    <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                        <div className="card-body p-0">
                            {loading ? (
                                <div className="text-center py-5"><div className="spinner-border" style={{ color: '#43e97b' }} /></div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead style={{ background: 'linear-gradient(135deg,#43e97b15,#38f9d715)' }}>
                                            <tr>
                                                <th className="px-4 py-3">Batch</th>
                                                <th className="py-3">Faculty</th>
                                                <th className="py-3">Subject</th>
                                                <th className="py-3">Hrs/Week</th>
                                                <th className="py-3 text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {mappings.length === 0 ? (
                                                <tr><td colSpan="5" className="text-center py-5 text-muted">
                                                    <i className="bi bi-diagram-3 fs-1 d-block mb-2 opacity-25"></i>No mappings found
                                                </td></tr>
                                            ) : (
                                                mappings.map(m => (
                                                    <tr key={m._id}>
                                                        <td className="px-4">
                                                            <span className="badge px-3 py-2 text-white fw-bold"
                                                                style={{ background: 'linear-gradient(135deg,#43e97b,#38f9d7)', borderRadius: '8px' }}>
                                                                {m.batchId?.name}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div className="fw-semibold small">{m.facultyId?.name}</div>
                                                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>{m.facultyId?.department}</div>
                                                        </td>
                                                        <td>
                                                            <div className="fw-semibold small">{m.subjectId?.subjectName}</div>
                                                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>{m.subjectId?.subjectCode}</div>
                                                        </td>
                                                        <td><span className="badge bg-warning text-dark">{m.subjectId?.hoursPerWeek}h</span></td>
                                                        <td className="text-center">
                                                            <button className="btn btn-sm btn-outline-danger rounded-pill px-3"
                                                                onClick={() => handleDelete(m._id)}>
                                                                <i className="bi bi-trash-fill"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MappingManagement;
