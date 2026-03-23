import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const adminLinks = [
        { to: '/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
        { to: '/faculty', icon: 'bi-people-fill', label: 'Faculty' },
        { to: '/subjects', icon: 'bi-book-fill', label: 'Subjects' },
        { to: '/mappings', icon: 'bi-diagram-3-fill', label: 'Mappings' },
        { to: '/timetable', icon: 'bi-table', label: 'Batch View' },
        { to: '/faculty-timetable', icon: 'bi-person-badge', label: 'Faculty View' },
    ];
    const facultyLinks = [
        { to: '/my-timetable', icon: 'bi-person-badge', label: 'My Timetable' },
        { to: '/timetable', icon: 'bi-table', label: 'Batch View' },
    ];
    const studentLinks = [
        { to: '/timetable', icon: 'bi-table', label: 'Batch View' },
    ];

    const links = user?.role === 'admin' ? adminLinks : user?.role === 'faculty' ? facultyLinks : studentLinks;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="d-flex flex-column text-white position-fixed h-100"
            style={{ width: '240px', background: 'linear-gradient(180deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)', top: 0, left: 0, zIndex: 100 }}>
            {/* Logo */}
            <div className="p-4 border-bottom border-white border-opacity-10">
                <div className="d-flex align-items-center">
                    <div className="rounded-circle d-flex align-items-center justify-content-center me-3"
                        style={{ width: 38, height: 38, background: 'linear-gradient(135deg,#667eea,#764ba2)' }}>
                        <img src="/icon.jpeg" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                    </div>
                    <div>
                        <div className="fw-bold" style={{ fontSize: '0.9rem' }}>Schedulix</div>
                        <div className="opacity-50" style={{ fontSize: '0.7rem' }}>Academic Scheduler</div>
                    </div>
                </div>
            </div>

            {/* User Info */}
            <div className="px-4 py-3 border-bottom border-white border-opacity-10">
                <div className="d-flex align-items-center">
                    <div className="rounded-circle d-flex align-items-center justify-content-center me-3 fw-bold"
                        style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.15)', fontSize: '0.9rem' }}>
                        {user?.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                        <div className="fw-semibold small">{user?.name}</div>
                        <span className="badge px-2" style={{ background: 'rgba(255,255,255,0.15)', fontSize: '0.65rem' }}>
                            {user?.role}
                        </span>
                    </div>
                </div>
            </div>

            {/* Nav Links */}
            <div className="flex-grow-1 py-3 overflow-auto">
                {links.map(({ to, icon, label }) => {
                    const active = location.pathname === to;
                    const isExternal = to.startsWith('http');
                    const linkProps = {
                        className: "d-flex align-items-center px-4 py-2 text-white text-decoration-none",
                        style: {
                            background: active ? 'rgba(102,126,234,0.3)' : 'transparent',
                            borderRight: active ? '3px solid #667eea' : '3px solid transparent',
                            transition: 'all 0.2s',
                            fontSize: '0.88rem',
                        },
                        onMouseEnter: e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; },
                        onMouseLeave: e => { if (!active) e.currentTarget.style.background = 'transparent'; }
                    };
                    const innerHtml = (
                        <>
                            <i className={`bi ${icon} me-3`} style={{ fontSize: '1rem', color: active ? '#667eea' : 'rgba(255,255,255,0.7)' }}></i>
                            <span style={{ color: active ? 'white' : 'rgba(255,255,255,0.75)' }}>{label}</span>
                        </>
                    );
                    return isExternal
                        ? <a key={label} href={to} {...linkProps}>{innerHtml}</a>
                        : <Link key={label} to={to} {...linkProps}>{innerHtml}</Link>;
                })}
            </div>

            {/* Logout */}
            <div className="p-4 border-top border-white border-opacity-10">
                <button className="btn w-100 text-white d-flex align-items-center justify-content-center gap-2 py-2"
                    style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px' }}
                    onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right"></i>
                    <span className="small fw-semibold">Logout</span>
                </button>
            </div>
        </nav>
    );
};

export default Sidebar;
