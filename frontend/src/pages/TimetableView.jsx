import React, { useState, useEffect } from 'react';
import { getTimetable, getBatches, exportTimetable } from '../services/api';
import { useAuth } from '../context/AuthContext';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];
const COLORS = ['#667eea', '#f5576c', '#43e97b', '#f093fb', '#4facfe', '#ffecd2', '#a18cd1', '#fbc2eb', '#84fab0', '#8fd3f4'];

const TimetableView = () => {
    const { user } = useAuth();
    const [batches, setBatches] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState('');
    const [timetable, setTimetable] = useState([]);
    const [loading, setLoading] = useState(false);
    const [batchLoading, setBatchLoading] = useState(true);
    const [error, setError] = useState('');

    // Map subjects to colors
    const [subjectColors, setSubjectColors] = useState({});

    useEffect(() => {
        getBatches()
            .then(res => setBatches(res.data.data))
            .catch(() => setError('Failed to load batches'))
            .finally(() => setBatchLoading(false));
    }, []);

    useEffect(() => {
        if (!selectedBatch) { setTimetable([]); return; }
        setLoading(true);
        setError('');
        getTimetable({ batchId: selectedBatch })
            .then(res => {
                const data = res.data.data;
                setTimetable(data);
                // Assign colors to subjects
                const colorMap = {};
                let ci = 0;
                data.forEach(slot => {
                    const key = slot.subjectId?._id;
                    if (key && !colorMap[key]) colorMap[key] = COLORS[ci++ % COLORS.length];
                });
                setSubjectColors(colorMap);
            })
            .catch(() => setError('Failed to load timetable'))
            .finally(() => setLoading(false));
    }, [selectedBatch]);

    const getSlot = (day, period) =>
        timetable.find(t => t.day === day && t.period === period);

    const handleExport = async () => {
        try {
            const res = await exportTimetable(selectedBatch);
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement('a');
            const batch = batches.find(b => b._id === selectedBatch);
            a.href = url;
            a.download = `timetable_${batch?.name || 'batch'}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch { setError('Export failed'); }
    };

    return (
        <div>
            <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
                <div>
                    <h2 className="fw-bold mb-1">Timetable View</h2>
                    <p className="text-muted mb-0">View the weekly schedule for any batch</p>
                </div>
                {selectedBatch && timetable.length > 0 && (
                    <button className="btn btn-outline-success rounded-pill px-4" onClick={handleExport}>
                        <i className="bi bi-download me-2"></i>Export CSV
                    </button>
                )}
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {/* Batch Selector */}
            <div className="row mb-4">
                <div className="col-md-6">
                    <label className="form-label fw-semibold text-secondary small">Select Batch</label>
                    <select className="form-select form-select-lg" value={selectedBatch}
                        onChange={e => setSelectedBatch(e.target.value)}
                        disabled={batchLoading}>
                        <option value="">-- Select a Batch --</option>
                        {batches.map(b => (
                            <option key={b._id} value={b._id}>{b.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Timetable Grid */}
            {loading ? (
                <div className="text-center py-5"><div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} /></div>
            ) : selectedBatch && timetable.length > 0 ? (
                <div>
                    <div className="card border-0 shadow-sm" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                        <div className="table-responsive">
                            <table className="table table-bordered mb-0 text-center" style={{ minWidth: '700px' }}>
                                <thead>
                                    <tr style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)' }}>
                                        <th className="text-white py-3 fw-bold" style={{ width: '120px' }}>Period ↓ Day →</th>
                                        {DAYS.map(d => <th key={d} className="text-white py-3 fw-bold">{d}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {PERIODS.map(p => (
                                        <tr key={p}>
                                            <td className="fw-bold text-center align-middle py-3"
                                                style={{ background: 'linear-gradient(135deg,#667eea15,#764ba215)' }}>
                                                <div className="small text-muted">Period</div>
                                                <div className="fw-bold" style={{ color: '#667eea' }}>{p}</div>
                                            </td>
                                            {DAYS.map(d => {
                                                const slot = getSlot(d, p);
                                                const color = slot ? subjectColors[slot.subjectId?._id] || '#667eea' : null;
                                                return (
                                                    <td key={d} className="p-1 align-middle" style={{ minHeight: '80px' }}>
                                                        {slot ? (
                                                            <div className="rounded-3 p-2 text-white text-start"
                                                                style={{ background: color, minHeight: '70px' }}>
                                                                <div className="fw-semibold small" style={{ fontSize: '0.75rem', lineHeight: 1.2 }}>
                                                                    {slot.subjectId?.subjectName}
                                                                    {slot.type && <span className="badge bg-white text-dark ms-1 opacity-75 p-1 px-2" style={{ fontSize: '0.6rem' }}>{slot.type}</span>}
                                                                </div>
                                                                <div className="mt-1 d-flex align-items-center" style={{ fontSize: '0.65rem', opacity: 0.9 }}>
                                                                    <i className="bi bi-person-fill me-1"></i>{slot.facultyId?.name}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="text-muted" style={{ fontSize: '1.2rem', opacity: 0.2 }}>—</div>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="mt-3">
                        <h6 className="fw-semibold mb-2 text-muted small">Subject Legend</h6>
                        <div className="d-flex flex-wrap gap-2">
                            {Object.entries(subjectColors).map(([id, color]) => {
                                const subj = timetable.find(t => t.subjectId?._id === id)?.subjectId;
                                return subj ? (
                                    <span key={id} className="badge rounded-pill px-3 py-2"
                                        style={{ background: color, fontSize: '0.8rem' }}>
                                        {subj.subjectName}
                                    </span>
                                ) : null;
                            })}
                        </div>
                    </div>
                </div>
            ) : selectedBatch && !loading ? (
                <div className="text-center py-5 text-muted">
                    <i className="bi bi-table fs-1 d-block mb-2 opacity-25"></i>
                    <p>No timetable generated for this batch yet.</p>
                    {user?.role === 'admin' && (
                        <a href="/generate" className="btn btn-primary rounded-pill px-4">
                            <i className="bi bi-lightning-fill me-2"></i>Generate Now
                        </a>
                    )}
                </div>
            ) : !selectedBatch ? (
                <div className="text-center py-5 text-muted">
                    <i className="bi bi-arrow-up-circle fs-1 d-block mb-2 opacity-25"></i>
                    Please select a batch to view its timetable
                </div>
            ) : null}
        </div>
    );
};

export default TimetableView;
