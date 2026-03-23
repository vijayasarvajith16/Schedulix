import React, { useState, useEffect, useCallback } from 'react';
import { getSubjects, createSubject, updateSubject, deleteSubject } from '../services/api';

const emptyForm = { subjectName: '', subjectCode: '', hoursPerWeek: 3, semester: 1, department: 'Computer Science', category: 'Theory (T)', theoryHours: 0, labHours: 0 };

const SubjectManagement = () => {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState(emptyForm);
    const [editId, setEditId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [semFilter, setSemFilter] = useState('');

    const fetchSubjects = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getSubjects(semFilter ? { semester: semFilter } : {});
            setSubjects(res.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch subjects');
        } finally { setLoading(false); }
    }, [semFilter]);

    useEffect(() => { fetchSubjects(); }, [fetchSubjects]);

    const openModal = (s = null) => {
        setEditId(s ? s._id : null);
        setForm(s ? { subjectName: s.subjectName, subjectCode: s.subjectCode, hoursPerWeek: s.hoursPerWeek, semester: s.semester, department: s.department, category: s.category || 'Theory (T)', theoryHours: s.theoryHours || 0, labHours: s.labHours || 0 } : emptyForm);
        setError('');
        setShowModal(true);
    };

    const closeModal = () => { setShowModal(false); setEditId(null); setForm(emptyForm); setError(''); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (editId) {
                await updateSubject(editId, form);
                setSuccessMsg('Subject updated successfully!');
            } else {
                await createSubject(form);
                setSuccessMsg('Subject added successfully!');
            }
            closeModal();
            fetchSubjects();
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteSubject(id);
            setSubjects(prev => prev.filter(s => s._id !== id));
            setSuccessMsg('Subject deleted!');
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Delete failed');
        }
        setDeleteConfirm(null);
    };

    const semColors = ['', '#667eea', '#f5576c', '#43e97b', '#f093fb', '#4facfe', '#ffecd2', '#a18cd1', '#fbc2eb'];

    return (
        <div>
            <div className="d-flex align-items-center justify-content-between mb-4">
                <div>
                    <h2 className="fw-bold mb-1">Subject Management</h2>
                    <p className="text-muted mb-0">Define subjects and their weekly hour requirements</p>
                </div>
                <button className="btn text-white px-4 py-2"
                    style={{ background: 'linear-gradient(135deg,#f093fb,#f5576c)', borderRadius: '10px', border: 'none' }}
                    onClick={() => openModal()}>
                    <i className="bi bi-plus-circle me-2"></i>Add Subject
                </button>
            </div>

            {successMsg && <div className="alert alert-success"><i className="bi bi-check-circle-fill me-2"></i>{successMsg}</div>}

            {/* Filter */}
            <div className="d-flex align-items-center gap-3 mb-4">
                <label className="fw-semibold small text-secondary">Filter by Semester:</label>
                <select className="form-select" style={{ maxWidth: '200px' }}
                    value={semFilter} onChange={e => setSemFilter(e.target.value)}>
                    <option value="">All Semesters</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                </select>
            </div>

            {/* Cards Grid */}
            {loading ? (
                <div className="text-center py-5"><div className="spinner-border" style={{ color: '#f5576c' }} /></div>
            ) : (
                <div className="row g-3">
                    {subjects.length === 0 ? (
                        <div className="col-12 text-center py-5 text-muted">
                            <i className="bi bi-book fs-1 d-block mb-2 opacity-25"></i>No subjects found
                        </div>
                    ) : (
                        subjects.map(s => (
                            <div className="col-md-4 col-lg-3" key={s._id}>
                                <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '14px', borderTop: `4px solid ${semColors[s.semester] || '#667eea'}` }}>
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <span className="badge px-2 py-1 small" style={{ background: semColors[s.semester] + '22', color: semColors[s.semester] || '#667eea' }}>
                                                Sem {s.semester}
                                            </span>
                                            <div>
                                                <button className="btn btn-sm btn-outline-secondary me-1 rounded-pill" style={{ padding: '2px 8px' }} onClick={() => openModal(s)}>
                                                    <i className="bi bi-pencil-fill" style={{ fontSize: '0.7rem' }}></i>
                                                </button>
                                                <button className="btn btn-sm btn-outline-danger rounded-pill" style={{ padding: '2px 8px' }} onClick={() => setDeleteConfirm(s._id)}>
                                                    <i className="bi bi-trash-fill" style={{ fontSize: '0.7rem' }}></i>
                                                </button>
                                            </div>
                                        </div>
                                        <h6 className="fw-bold mb-1">{s.subjectName}</h6>
                                        <p className="text-muted small mb-2">{s.subjectCode}</p>
                                        <div className="d-flex align-items-center">
                                            <i className="bi bi-clock-fill me-1 text-warning small"></i>
                                            <span className="small fw-semibold">
                                                {s.hoursPerWeek} hrs/week
                                                {s.category === 'LIT' ? ` (${s.theoryHours || 0}T + ${s.labHours || 0}L)` : ''}
                                            </span>
                                        </div>
                                        <p className="text-muted small mb-0 mt-1">
                                            {s.department} &bull; <span className="fw-semibold text-dark">{s.category || 'Theory (T)'}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px' }}>
                            <div className="modal-header border-0 px-4 pt-4">
                                <h5 className="modal-title fw-bold">{editId ? 'Edit Subject' : 'Add New Subject'}</h5>
                                <button className="btn-close" onClick={closeModal}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body px-4">
                                    {error && <div className="alert alert-danger small">{error}</div>}
                                    <div className="row g-3">
                                        <div className="col-12">
                                            <label className="form-label fw-semibold small text-secondary">Subject Name</label>
                                            <input type="text" className="form-control" placeholder="e.g. Data Structures"
                                                value={form.subjectName} onChange={e => setForm({ ...form, subjectName: e.target.value })} required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold small text-secondary">Subject Code</label>
                                            <input type="text" className="form-control" placeholder="e.g. CS301"
                                                value={form.subjectCode} onChange={e => setForm({ ...form, subjectCode: e.target.value })} required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold small text-secondary">Category</label>
                                            <select className="form-select" value={form.category}
                                                onChange={e => setForm({ ...form, category: e.target.value })}>
                                                <option value="Theory (T)">Theory (T)</option>
                                                <option value="Lab (L)">Lab (L)</option>
                                                <option value="LIT">LIT (Lab Integrated)</option>
                                            </select>
                                        </div>
                                        {form.category === 'LIT' ? (
                                            <>
                                                <div className="col-md-3">
                                                    <label className="form-label fw-semibold small text-secondary">Theory Hrs</label>
                                                    <input type="number" className="form-control" min="0" max="8"
                                                        value={form.theoryHours}
                                                        onChange={e => {
                                                            const th = parseInt(e.target.value) || 0;
                                                            setForm({ ...form, theoryHours: th, hoursPerWeek: th + form.labHours });
                                                        }} required />
                                                </div>
                                                <div className="col-md-3">
                                                    <label className="form-label fw-semibold small text-secondary">Lab Hrs</label>
                                                    <input type="number" className="form-control" min="0" max="8"
                                                        value={form.labHours}
                                                        onChange={e => {
                                                            const lh = parseInt(e.target.value) || 0;
                                                            setForm({ ...form, labHours: lh, hoursPerWeek: form.theoryHours + lh });
                                                        }} required />
                                                </div>
                                            </>
                                        ) : (
                                            <div className="col-md-6">
                                                <label className="form-label fw-semibold small text-secondary">Total Hrs/Week</label>
                                                <input type="number" className="form-control" min="1" max="8"
                                                    value={form.hoursPerWeek} onChange={e => setForm({ ...form, hoursPerWeek: parseInt(e.target.value) })} required />
                                            </div>
                                        )}
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold small text-secondary">Semester</label>
                                            <select className="form-select" value={form.semester}
                                                onChange={e => setForm({ ...form, semester: parseInt(e.target.value) })}>
                                                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold small text-secondary">Department</label>
                                            <input type="text" className="form-control" placeholder="Department"
                                                value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} required />
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer border-0 px-4 pb-4">
                                    <button type="button" className="btn btn-light rounded-pill px-4" onClick={closeModal}>Cancel</button>
                                    <button type="submit" className="btn text-white rounded-pill px-4"
                                        style={{ background: 'linear-gradient(135deg,#f093fb,#f5576c)', border: 'none' }}>
                                        {editId ? 'Update' : 'Add Subject'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm */}
            {deleteConfirm && (
                <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-sm">
                        <div className="modal-content border-0 shadow-lg text-center p-4" style={{ borderRadius: '16px' }}>
                            <i className="bi bi-exclamation-triangle-fill text-danger fs-1 mb-3"></i>
                            <h6 className="fw-bold">Delete Subject?</h6>
                            <div className="d-flex gap-2 justify-content-center mt-3">
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

export default SubjectManagement;
