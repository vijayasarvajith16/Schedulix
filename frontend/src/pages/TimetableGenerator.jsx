import React, { useState } from 'react';
import { generateTimetable } from '../services/api';

const TimetableGenerator = () => {
    const [status, setStatus] = useState('idle'); // idle | loading | success | error
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        setStatus('loading');
        setError('');
        setResult(null);
        try {
            const res = await generateTimetable();
            setResult(res.data);
            setStatus('success');
        } catch (err) {
            setError(err.response?.data?.message || 'Timetable generation failed');
            setStatus('error');
        }
    };

    return (
        <div>
            <div className="mb-4">
                <h2 className="fw-bold mb-1">Timetable Generator</h2>
                <p className="text-muted mb-0">Automatically generate a conflict-free timetable for all 12 batches</p>
            </div>

            {/* Info Banner */}
            <div className="alert border-0 mb-4" style={{ background: 'linear-gradient(135deg,#667eea15,#764ba215)', borderRadius: '14px' }}>
                <h6 className="fw-bold mb-2"><i className="bi bi-info-circle-fill me-2 text-primary"></i>How it works</h6>
                <ul className="mb-0 small text-secondary">
                    <li>The system reads all faculty-subject-batch mappings you have created</li>
                    <li>It allocates time slots (Mon–Fri, 8 periods/day) respecting subject hours/week</li>
                    <li>A faculty cannot be scheduled for two batches at the same time</li>
                    <li>A batch cannot have two subjects at the same time</li>
                    <li>Previously generated timetable will be <strong>replaced</strong></li>
                </ul>
            </div>

            {/* Constraints Summary */}
            <div className="row g-3 mb-4">
                {[
                    { icon: 'bi-calendar-week', label: 'Working Days', value: 'Mon – Fri (5 days)', color: '#667eea' },
                    { icon: 'bi-clock-history', label: 'Periods/Day', value: '8 Periods', color: '#f5576c' },
                    { icon: 'bi-calculator', label: 'Total Slots', value: '40 / batch / week', color: '#43e97b' },
                    { icon: 'bi-grid-3x3-gap', label: 'Batches', value: '12 (1N–4Q)', color: '#4facfe' },
                ].map(({ icon, label, value, color }) => (
                    <div className="col-md-3" key={label}>
                        <div className="card border-0 shadow-sm text-center py-3" style={{ borderRadius: '14px', borderTop: `3px solid ${color}` }}>
                            <i className={`bi ${icon} fs-2 mb-1`} style={{ color }}></i>
                            <p className="mb-0 small text-muted">{label}</p>
                            <p className="mb-0 fw-bold">{value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Generate Button */}
            <div className="text-center py-4">
                <div className="mb-4">
                    {status === 'idle' && (
                        <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                            style={{ width: 100, height: 100, background: 'linear-gradient(135deg,#667eea22,#764ba222)' }}>
                            <i className="bi bi-lightning-charge-fill fs-1" style={{ color: '#667eea' }}></i>
                        </div>
                    )}
                    {status === 'loading' && (
                        <div className="mb-3">
                            <div className="spinner-border text-primary" style={{ width: '4rem', height: '4rem' }} />
                            <p className="mt-3 text-muted">Generating timetable, please wait...</p>
                        </div>
                    )}
                    {status === 'success' && (
                        <div className="mb-3">
                            <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                                style={{ width: 100, height: 100, background: 'linear-gradient(135deg,#43e97b22,#38f9d722)' }}>
                                <i className="bi bi-check-circle-fill fs-1 text-success"></i>
                            </div>
                            <div className="alert alert-success border-0 d-inline-block px-5" style={{ borderRadius: '14px' }}>
                                <strong>{result?.message}</strong>
                            </div>
                        </div>
                    )}
                    {status === 'error' && (
                        <div className="mb-3">
                            <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                                style={{ width: 100, height: 100, background: '#f5576c22' }}>
                                <i className="bi bi-x-circle-fill fs-1 text-danger"></i>
                            </div>
                            <div className="alert alert-danger border-0 d-inline-block px-5" style={{ borderRadius: '14px' }}>
                                <strong>Error:</strong> {error}
                            </div>
                        </div>
                    )}
                </div>

                <button className="btn text-white px-5 py-3 fw-semibold fs-5"
                    onClick={handleGenerate}
                    disabled={status === 'loading'}
                    style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', border: 'none', borderRadius: '14px', boxShadow: '0 8px 25px rgba(102,126,234,0.4)' }}>
                    {status === 'loading' ? (
                        <><span className="spinner-border spinner-border-sm me-2" />Generating...</>
                    ) : (
                        <><i className="bi bi-lightning-fill me-2"></i>Generate Timetable</>
                    )}
                </button>

                {status === 'success' && (
                    <div className="mt-3">
                        <a href="/timetable" className="btn btn-outline-success rounded-pill px-4">
                            <i className="bi bi-table me-2"></i>View Timetable
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TimetableGenerator;
