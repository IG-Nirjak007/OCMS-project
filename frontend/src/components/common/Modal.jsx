
// Modal.jsx
export const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>{title}</h3>
                {children}
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
};// Modal reusable component stub
