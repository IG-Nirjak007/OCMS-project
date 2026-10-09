
export const hasRole = (user, role) => {
    if (!user || !user.roles) return false;
    return user.roles.some(r => r.name === role || r === role); // Handles object or string
};
