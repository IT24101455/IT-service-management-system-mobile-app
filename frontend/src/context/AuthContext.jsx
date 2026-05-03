import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) {
            try { setUser(JSON.parse(stored)); } catch { }
        }
        setLoading(false);
    }, []);

    const loginUser = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', userData.token);
    };

    const logoutUser = () => {
        setUser(null);
        localStorage.clear();
    };

    const updateAuthUser = (updatedData) => {
        setUser(prevUser => {
            if (!prevUser) {
                console.warn('Attempted to update auth user when not logged in');
                return prevUser;
            }
            // Ensure ID consistency: if backend returns 'id', we map it to 'userId' for frontend compatibility
            const id = updatedData.id || updatedData.userId || prevUser.id || prevUser.userId;
            const newUser = { 
                ...prevUser, 
                ...updatedData,
                id: id,
                userId: id // Sync both for compatibility
            };
            console.log('Updating auth user state:', newUser);
            localStorage.setItem('user', JSON.stringify(newUser));
            return newUser;
        });
    };

    return (
        <AuthContext.Provider value={{ user, loginUser, logoutUser, updateAuthUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
