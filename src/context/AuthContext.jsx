import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage for existing session token
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            // Try to parse as JSON, but handle non-JSON responses
            let data;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                // If response is not JSON, treat it as a generic error
                const text = await response.text();
                console.error('[AUTH] Non-JSON response:', text);
                throw new Error('Server error. Please try again later.');
            }

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            return data.user;
        } catch (error) {
            console.error('[AUTH] Login error:', error);
            throw error;
        }
    };

    const register = async (name, email, password) => {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            // Try to parse as JSON, but handle non-JSON responses
            let data;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                // If response is not JSON, treat it as a generic error
                const text = await response.text();
                console.error('[AUTH] Non-JSON response:', text);
                throw new Error('Server error. Please try again later.');
            }

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }
            return true;
        } catch (error) {
            console.error('[AUTH] Registration error:', error);
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    // Inactivity Logout logic
    useEffect(() => {
        let inactivityTimer;
        const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutes

        const resetTimer = () => {
            if (inactivityTimer) clearTimeout(inactivityTimer);
            if (user) {
                inactivityTimer = setTimeout(() => {
                    console.log('Logging out due to inactivity');
                    logout();
                }, INACTIVITY_LIMIT);
            }
        };

        const activityEvents = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];

        if (user) {
            resetTimer();
            activityEvents.forEach(event => {
                window.addEventListener(event, resetTimer);
            });
        }

        return () => {
            if (inactivityTimer) clearTimeout(inactivityTimer);
            activityEvents.forEach(event => {
                window.removeEventListener(event, resetTimer);
            });
        };
    }, [user]);

    // Helper for authenticated requests that handles 401/403
    const authFetch = async (url, options = {}) => {
        const token = localStorage.getItem('token');
        const headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        };

        const response = await fetch(url, { ...options, headers });

        if (response.status === 401 || response.status === 403) {
            logout();
            throw new Error('Session expired. Please log in again.');
        }

        // Check if response is JSON before parsing
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return response;
        } else {
            // If response is not JSON, log and return response as-is
            console.warn('[AUTH] Non-JSON response from:', url);
            return response;
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, authFetch, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
