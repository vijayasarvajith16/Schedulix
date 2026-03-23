import React, { useState, useEffect } from 'react';
import { getTimetable, getFaculty } from '../services/api';
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

const FacultyTimetable = () => {
    const [facultyList, setFacultyList] = useState([]);
    const [selectedFaculty, setSelectedFaculty] = useState('');
    const [timetable, setTimetable] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getFaculty().then(res => setFacultyList(res.data.data)).catch(() => { });
    }, []);

    useEffect(() => {
        if (!selectedFaculty) { setTimetable([]); return; }
        setLoading(true);
        getTimetable({ facultyId: selectedFaculty })
            .then(res => setTimetable(res.data.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [selectedFaculty]);

    const getSlot = (day, period) => timetable.find(t => t.day === day && t.period === period);

    return (
        <div>
            <div className="mb-4">
                <h2 className="fw-bold mb-1">Faculty Timetable</h2>
                <p className="text-muted mb-0">View a faculty member's complete weekly teaching schedule</p>
            </div>

            <div className="row mb-4">
                <div className="col-md-6">
                    <label className="form-label fw-semibold text-secondary small">Select Faculty</label>
                    <select className="form-select form-select-lg" value={selectedFaculty}
                        onChange={e => setSelectedFaculty(e.target.value)}>
                        <option value="">-- Select Faculty Member --</option>
                        {facultyList.map(f => <option key={f._id} value={f._id}>{f.name} — {f.department}</option>)}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5"><div className="spinner-border" style={{ color: '#4facfe', width: '3rem', height: '3rem' }} /></div>
            ) : selectedFaculty && timetable.length > 0 ? (
                <div>
                    {/* Stats */}
                    <div className="d-flex gap-3 mb-4 flex-wrap">
                        <div className="badge px-3 py-2 fs-6 text-white" style={{ background: 'linear-gradient(135deg,#4facfe,#00f2fe)', borderRadius: '10px' }}>
                            <i className="bi bi-calendar-check me-2"></i>{timetable.length} total classes/week
                        </div>
                        <div className="badge bg-light text-dark px-3 py-2 fs-6" style={{ borderRadius: '10px' }}>
                            <i className="bi bi-clock me-2 text-warning"></i>{timetable.length} hrs/week
                        </div>
                    </div>

                    <div className="card border-0 shadow-sm" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                        <div className="table-responsive">
                            <table className="table table-bordered mb-0 text-center" style={{ minWidth: '700px' }}>
                                <thead>
                                    <tr style={{ background: 'linear-gradient(135deg,#4facfe,#00f2fe)' }}>
                                        <th className="text-white py-3" style={{ width: '120px' }}>Period</th>
                                        {DAYS.map(d => <th key={d} className="text-white py-3 fw-bold">{d}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {PERIODS.map(p => (
                                        <tr key={p}>
                                            <td className="fw-bold align-middle"
                                                style={{ background: 'linear-gradient(135deg,#4facfe15,#00f2fe15)', color: '#4facfe' }}>
                                                P{p}
                                            </td>
                                            {DAYS.map(d => {
                                                const slot = getSlot(d, p);
                                                return (
                                                    <td key={d} className="p-1 align-middle">
                                                        {slot ? (
                                                            <div className="rounded-3 p-2 text-white text-start"
                                                                style={{ background: 'linear-gradient(135deg,#4facfe,#00f2fe)', minHeight: '60px' }}>
                                                                <div className="fw-semibold" style={{ fontSize: '0.75rem' }}>
                                                                    {slot.subjectId?.subjectName}
                                                                    {slot.type && <span className="badge bg-white text-dark ms-1 opacity-75 p-1 px-2" style={{ fontSize: '0.6rem' }}>{slot.type}</span>}
                                                                </div>
                                                                <div style={{ fontSize: '0.65rem', opacity: 0.9 }}>
                                                                    <i className="bi bi-grid-fill me-1"></i>Batch {slot.batchId?.name}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted opacity-25">—</span>
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

                    {/* Batch Summary */}
                    <div className="mt-4">
                        <h6 className="fw-bold mb-3 text-muted">Batch-wise Summary</h6>
                        <div className="d-flex flex-wrap gap-2">
                            {[...new Set(timetable.map(t => t.batchId?.name))].filter(Boolean).map(b => (
                                <span key={b} className="badge px-3 py-2"
                                    style={{ background: 'linear-gradient(135deg,#4facfe22,#00f2fe22)', color: '#4facfe', border: '1px solid #4facfe44', borderRadius: '8px' }}>
                                    Batch {b}: {timetable.filter(t => t.batchId?.name === b).length} classes
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            ) : selectedFaculty ? (
                <div className="text-center py-5 text-muted">
                    <i className="bi bi-calendar-x fs-1 d-block mb-2 opacity-25"></i>
                    No timetable assigned to this faculty yet.
                </div>
            ) : (
                <div className="text-center py-5 text-muted">
                    <i className="bi bi-person-badge fs-1 d-block mb-2 opacity-25"></i>
                    Select a faculty member to view their schedule
                </div>
            )}
        </div>
    );
};

export default FacultyTimetable;
