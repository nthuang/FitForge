import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser, loginUser, registerUser } from "../apis/authApi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem("fitforgeToken"));
    const [loading, setLoading] = useState(Boolean(localStorage.getItem("fitforgeToken")));

    useEffect(() => {
        const loadCurrentUser = async () => {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const data = await getCurrentUser(token);
                setUser(data.user);
            } catch (error) {
                localStorage.removeItem("fitforgeToken");
                setToken(null);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        loadCurrentUser();
    }, [token]);

    const register = async ({ name, email, password }) => {
        const data = await registerUser({ name, email, password });

        localStorage.setItem("fitforgeToken", data.token);
        setToken(data.token);
        setUser(data.user);

        return data.user;
    };

    const login = async ({ email, password }) => {
        const data = await loginUser({ email, password });

        localStorage.setItem("fitforgeToken", data.token);
        setToken(data.token);
        setUser(data.user);

        return data.user;
    };

    const logout = () => {
        localStorage.removeItem("fitforgeToken");
        setToken(null);
        setUser(null);
    };

    const value = {
        user,
        token,
        loading,
        isAuthenticated: Boolean(user && token),
        register,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    return context;
};