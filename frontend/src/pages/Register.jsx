import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/api';

const Register = () => {
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'admin' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await registerUser(form);
            setSuccess('Account created! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally { setLoading(false); }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center"
            style={{ background: 'linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)' }}>
            <div className="col-md-5">
                <div className="card shadow-lg border-0" style={{ borderRadius: '20px' }}>
                    <div className="card-header text-white text-center py-4 border-0"
                        style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', borderRadius: '20px 20px 0 0' }}>
                        <i className="bi bi-person-plus-fill" style={{ fontSize: '2.5rem' }}></i>
                        <h3 className="fw-bold mt-2 mb-0">Create Account</h3>
                    </div>
                    <div className="card-body p-4">
                        {error && <div className="alert alert-danger small">{error}</div>}
                        {success && <div className="alert alert-success small">{success}</div>}
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label fw-semibold small text-secondary">Full Name</label>
                                <input type="text" className="form-control" placeholder="Your full name"
                                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-semibold small text-secondary">Email</label>
                                <input type="email" className="form-control" placeholder="your@email.com"
                                    value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-semibold small text-secondary">Password</label>
                                <input type="password" className="form-control" placeholder="Min 6 characters"
                                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                            </div>
                            <div className="mb-4">
                                <label className="form-label fw-semibold small text-secondary">Role</label>
                                <select className="form-select" value={form.role}
                                    onChange={e => setForm({ ...form, role: e.target.value })}>
                                    <option value="admin">Admin</option>
                                    <option value="faculty">Faculty</option>
                                    <option value="student">Student</option>
                                </select>
                            </div>
                            <button type="submit" className="btn w-100 py-2 text-white fw-semibold"
                                disabled={loading}
                                style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', border: 'none', borderRadius: '10px' }}>
                                {loading ? <><span className="spinner-border spinner-border-sm me-2" />Creating...</> : 'Create Account'}
                            </button>
                        </form>
                    </div>
                    <div className="card-footer text-center bg-light py-3 border-0">
                        <small>Already have an account? <Link to="/login" className="fw-semibold" style={{ color: '#667eea' }}>Sign In</Link></small>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
