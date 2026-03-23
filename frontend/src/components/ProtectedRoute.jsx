import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';


export const ProtectedRoute = ({ children, roles }) => {
    const { user, isAuthenticated } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (roles && !roles.includes(user?.role)) return <Navigate to="/unauthorized" replace />;
    return <Layout>{children}</Layout>;
};


export const PublicRoute = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    if (isAuthenticated) {
        if (user?.role === 'admin') return <Navigate to="/dashboard" replace />;
        if (user?.role === 'faculty') return <Navigate to="/my-timetable" replace />;
        if (user?.role === 'student') return <Navigate to="/timetable" replace />;
        return <Navigate to="/login" replace />;
    }
    return children;
};
