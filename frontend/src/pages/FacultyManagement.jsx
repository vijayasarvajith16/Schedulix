import React, { useState, useEffect, useCallback } from 'react';
import { getFaculty, createFaculty, updateFaculty, deleteFaculty } from '../services/api';

const emptyForm = { name: '', department: '', email: '', phone: '' };

const FacultyManagement = () => {
    const [faculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState(emptyForm);
    const [editId, setEditId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState('');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const fetchFaculty = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getFaculty({ search });
            setFaculty(res.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch faculty');
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => { fetchFaculty(); }, [fetchFaculty]);

    const openModal = (f = null) => {
        setEditId(f ? f._id : null);
        setForm(f ? { name: f.name, department: f.department, email: f.email, phone: f.phone || '' } : emptyForm);
        setError('');
        setShowModal(true);
    };

    const closeModal = () => { setShowModal(false); setEditId(null); setForm(emptyForm); setError(''); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (editId) {
                await updateFaculty(editId, form);
                setSuccessMsg('Faculty updated successfully!');
            } else {
                await createFaculty(form);
                setSuccessMsg('Faculty added successfully!');
            }
            closeModal();
            fetchFaculty();
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteFaculty(id);
            setFaculty(prev => prev.filter(f => f._id !== id));
            setSuccessMsg('Faculty deleted successfully!');
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Delete failed');
        }
        setDeleteConfirm(null);
    };

    return (
        <div>
            <div className="d-flex align-items-center justify-content-between mb-4">
                <div>
                    <h2 className="fw-bold mb-1">Faculty Management</h2>
                    <p className="text-muted mb-0">Add, edit and manage faculty members</p>
                </div>
                <button className="btn text-white px-4 py-2"
                    style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', borderRadius: '10px', border: 'none' }}
                    onClick={() => openModal()}>
                    <i className="bi bi-plus-circle me-2"></i>Add Faculty
                </button>
            </div>

            {successMsg && <div className="alert alert-success"><i className="bi bi-check-circle-fill me-2"></i>{successMsg}</div>}

            {/* Search */}
            <div className="input-group mb-4" style={{ maxWidth: '400px' }}>
                <span className="input-group-text bg-white"><i className="bi bi-search text-muted"></i></span>
                <input type="text" className="form-control border-start-0"
                    placeholder="Search faculty by name..."
                    value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            {/* Table */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead style={{ background: 'linear-gradient(135deg,#667eea15,#764ba215)' }}>
                                    <tr>
                                        <th className="px-4 py-3">#</th>
                                        <th className="py-3">Name</th>
                                        <th className="py-3">Department</th>
                                        <th className="py-3">Email</th>
                                        <th className="py-3">Phone</th>
                                        <th className="py-3 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {faculty.length === 0 ? (
                                        <tr><td colSpan="6" className="text-center py-5 text-muted">
                                            <i className="bi bi-people fs-1 d-block mb-2 opacity-25"></i>No faculty found
                                        </td></tr>
                                    ) : (
                                        faculty.map((f, idx) => (
                                            <tr key={f._id}>
                                                <td className="px-4 text-muted">{idx + 1}</td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <div className="rounded-circle d-flex align-items-center justify-content-center me-3 text-white fw-bold"
                                                            style={{ width: 38, height: 38, background: 'linear-gradient(135deg,#667eea,#764ba2)', fontSize: '0.85rem' }}>
                                                            {f.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="fw-semibold">{f.name}</span>
                                                    </div>
                                                </td>
                                                <td><span className="badge bg-light text-dark px-2 py-1">{f.department}</span></td>
                                                <td className="text-muted small">{f.email}</td>
                                                <td className="text-muted small">{f.phone || '—'}</td>
                                                <td className="text-center">
                                                    <button className="btn btn-sm btn-outline-primary me-2 rounded-pill px-3"
                                                        onClick={() => openModal(f)}>
                                                        <i className="bi bi-pencil-fill"></i>
                                                    </button>
                                                    <button className="btn btn-sm btn-outline-danger rounded-pill px-3"
                                                        onClick={() => setDeleteConfirm(f._id)}>
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

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px' }}>
                            <div className="modal-header border-0 px-4 pt-4">
                                <h5 className="modal-title fw-bold">{editId ? 'Edit Faculty' : 'Add New Faculty'}</h5>
                                <button className="btn-close" onClick={closeModal}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body px-4">
                                    {error && <div className="alert alert-danger small">{error}</div>}
                                    {['name', 'department', 'email', 'phone'].map((field) => (
                                        <div className="mb-3" key={field}>
                                            <label className="form-label fw-semibold text-capitalize small text-secondary">{field}</label>
                                            <input type={field === 'email' ? 'email' : 'text'} className="form-control"
                                                placeholder={`Enter ${field}`}
                                                value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })}
                                                required={field !== 'phone'} />
                                        </div>
                                    ))}
                                </div>
                                <div className="modal-footer border-0 px-4 pb-4">
                                    <button type="button" className="btn btn-light rounded-pill px-4" onClick={closeModal}>Cancel</button>
                                    <button type="submit" className="btn text-white rounded-pill px-4"
                                        style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', border: 'none' }}>
                                        {editId ? 'Update Faculty' : 'Add Faculty'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm Modal */}
            {deleteConfirm && (
                <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-sm">
                        <div className="modal-content border-0 shadow-lg text-center p-4" style={{ borderRadius: '16px' }}>
                            <i className="bi bi-exclamation-triangle-fill text-danger fs-1 mb-3"></i>
                            <h6 className="fw-bold">Delete Faculty?</h6>
                            <p className="text-muted small">This action cannot be undone.</p>
                            <div className="d-flex gap-2 justify-content-center">
                                <button className="btn btn-light rounded-pill px-4" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                                <button className="btn btn-danger rounded-pill px-4" onClick={() => handleDelete(deleteConfirm)}>Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacultyManagement;
