import React from 'react';

const MaterialList = ({ materials = [], onDelete, isTeacher = false }) => {
    if (!materials.length) return <p>No materials uploaded yet.</p>;

    return (
        <ul className="material-list">
            {materials.map((file) => (
                <li key={file.id} className="material-item">
                    <span>{file.fileName}</span>
                    <div className="actions">
                        <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">Download</a>
                        {isTeacher && <button onClick={() => onDelete(file.id)}>Delete</button>}
                    </div>
                </li>
            ))}
        </ul>
    );
};

export default MaterialList;// MaterialList component stub
