import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    constructor() { }

    /**
     * Reads URL query parameters for 'token' and 'user'.
     * If found, sets them into localStorage and cleans the URL.
     */
    syncTokenFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const userStr = urlParams.get('user');

        if (token && userStr) {
            localStorage.setItem('token', token);
            localStorage.setItem('user', userStr);
            // Clean up the URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    private decodeToken(token: string): any {
        try {
            const payload = token.split('.')[1];
            const decoded = atob(payload);
            return JSON.parse(decoded);
        } catch (e) {
            return null;
        }
    }

    isAuthenticated(): boolean {
        this.syncTokenFromUrl();
        return !!this.getToken();
    }

    getUserData() {
        const token = this.getToken();
        if (!token) return null;

        const tokenData = this.decodeToken(token);
        const storedUserStr = localStorage.getItem('user');
        const storedUser = storedUserStr ? JSON.parse(storedUserStr) : {};

        return {
            facultyId: storedUser?.facultyId || tokenData?.id || tokenData?._id || storedUser?._id,
            role: tokenData?.role || storedUser?.role,
            email: tokenData?.email || storedUser?.email,
            name: tokenData?.name || storedUser?.name
        };
    }

    getUserDataFromToken() {
        const token = this.getToken();
        if (!token) return null;
        return this.decodeToken(token);
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Redirect back to the React app login page
        // Passed with ?logout=true so the React app forcibly overrides any active sessions.
        window.location.href = `${environment.reactAppUrl}/login?logout=true`;
    }
}
