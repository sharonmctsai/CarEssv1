import React, { useContext, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { UserContext } from '../context/UserContext'; 
import { toast } from 'react-toastify';

const ProtectedRoute = () => {
    const { user } = useContext(UserContext);
    const location = useLocation();

    useEffect(() => {
        if (!user) {
            toast.error('You must be logged in to access this page.', { autoClose: 3000 });
        }
    }, [user]);

    return user ? <Outlet /> : <Navigate to="/login" state={{ from: location }} replace />;
};

export default ProtectedRoute;
