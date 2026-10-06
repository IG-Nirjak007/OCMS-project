// Button.jsx
export const Button = ({ children, onClick, type = 'button', variant = 'primary' }) => (
    <button type={type} className={`btn btn-${variant}`} onClick={onClick}>
        {children}
    </button>
);
