import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
    const isAuth = localStorage.getItem('is_authenticated') === 'true';
    const role = localStorage.getItem('user_role');
    const isAdmin = localStorage.getItem('is_admin') === 'true';

    if (!isAuth) {
        return <Navigate to="/login" replace />;
    }

    // Admin always has access
    if (isAdmin) {
        return <Outlet />;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        // Role not authorized, redirect to home page or unauthorized page
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
