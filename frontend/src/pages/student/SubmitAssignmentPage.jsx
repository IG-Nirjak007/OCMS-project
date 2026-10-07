import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { submitAssignment } from '../../api/assignmentApi';

const SubmitAssignmentPage = () => {
    const { assignmentId } = useParams();
    const [file, setFile] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        await submitAssignment(assignmentId, formData);
        navigate('/student');
    };

    return (
        <div className="page-container">
            <h2>Submit Assignment</h2>
            <form onSubmit={handleSubmit}>
                <input type="file" onChange={(e) => setFile(e.target.files[0])} required />
                <button type="submit">Upload & Submit</button>
            </form>
        </div>
    );
};

export default SubmitAssignmentPage;// SubmitAssignmentPage stub
