import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../services/api';

const Login = () => {
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await loginUser(form);
            const { token, ...userData } = res.data.data;
            login(userData, token);
            if (userData.role === 'admin') navigate('/dashboard');
            else if (userData.role === 'faculty') navigate('/my-timetable');
            else navigate('/timetable');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center"
            style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-5">
                        <div className="card shadow-lg border-0" style={{ borderRadius: '20px', overflow: 'hidden' }}>
                            {/* Header */}
                            <div className="card-header text-white text-center py-4 border-0"
                                style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                                <div className="mb-2">
                                    <img src="/icon.jpeg" alt="Logo" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '50%', border: '2px solid white' }} />
                                </div>
                                <h3 className="fw-bold mb-1">Schedulix</h3>
                                <p className="mb-0 opacity-75 small">Automated Academic Scheduler</p>
                            </div>

                            {/* Body */}
                            <div className="card-body p-4">
                                <h5 className="text-center mb-4 text-muted fw-semibold">Sign In to Continue</h5>
                                {error && (
                                    <div className="alert alert-danger alert-dismissible fade show" role="alert">
                                        <i className="bi bi-exclamation-triangle-fill me-2"></i>{error}
                                        <button type="button" className="btn-close" onClick={() => setError('')} />
                                    </div>
                                )}
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold text-secondary small">Email Address</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-end-0">
                                                <i className="bi bi-envelope text-primary"></i>
                                            </span>
                                            <input type="email" name="email" className="form-control border-start-0 ps-0"
                                                placeholder="you@university.edu" value={form.email}
                                                onChange={handleChange} required />
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label fw-semibold text-secondary small">Password</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-end-0">
                                                <i className="bi bi-lock text-primary"></i>
                                            </span>
                                            <input type="password" name="password" className="form-control border-start-0 ps-0"
                                                placeholder="Your password" value={form.password}
                                                onChange={handleChange} required />
                                        </div>
                                    </div>
                                    <button type="submit" className="btn w-100 py-2 fw-semibold text-white"
                                        disabled={loading}
                                        style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', borderRadius: '10px' }}>
                                        {loading ? (
                                            <><span className="spinner-border spinner-border-sm me-2" />&nbsp;Signing in...</>
                                        ) : (
                                            <><i className="bi bi-box-arrow-in-right me-2"></i>Sign In</>
                                        )}
                                    </button>
                                    <div className="text-center mt-3">
                                        <small className="text-muted">
                                            New here? <Link to="/register" className="text-primary text-decoration-none fw-semibold">Create an account</Link>
                                        </small>
                                    </div>
                                </form>
                            </div>

                            {/* Footer Hint */}
                            <div className="card-footer text-center bg-light py-3 border-0">
                                <small className="text-muted">
                                    <i className="bi bi-info-circle me-1"></i>
                                    Use role: <strong>admin</strong> | <strong>faculty</strong> | <strong>student</strong>
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
