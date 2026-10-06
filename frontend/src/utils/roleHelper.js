export const ROLES = {
    ADMIN: 'ROLE_ADMIN',
    TEACHER: 'ROLE_TEACHER',
    STUDENT: 'ROLE_STUDENT',
};

export const hasRole = (user, role) => user?.roles?.includes(role);// roleHelper - check ADMIN TEACHER STUDENT role stubs
