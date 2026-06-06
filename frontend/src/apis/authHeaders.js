export const getAuthHeaders = () => {
    const token = localStorage.getItem("fitforgeToken");

    if (!token) {
        return {};
    }

    return {
        Authorization: `Bearer ${token}`,
    };
};