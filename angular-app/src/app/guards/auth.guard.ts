import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);

    // Read token from Angular's parsed route instead of window.location
    const token = route.queryParamMap.get('token');
    const userStr = route.queryParamMap.get('user');

    if (token && userStr) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', userStr);
        // Clean URL to prevent sharing tokens
        window.history.replaceState({}, document.title, window.location.pathname);
    } else {
        // Fallback to window.location just in case router hasn't processed it
        authService.syncTokenFromUrl();
    }

    if (authService.isAuthenticated()) {
        const userData = authService.getUserDataFromToken() || authService.getUserData();
        // Allow access to faculty and students
        if (userData && (userData.role === 'faculty' || userData.role === 'student')) {
            return true;
        }
    }

    // Not authorized, redirect to login page (which resides in the React app at port 3000)
    window.location.href = 'http://localhost:3000/login';
    return false;
};
