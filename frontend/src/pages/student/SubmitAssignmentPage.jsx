import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { submitAssignment } from '../../api/assignmentApi';

const SubmitAssignmentPage = () => {
    const { assignmentId } = useParams();
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
                setError('File size must be under 10MB.');
                return;
            }
            setError('');
            setFile(selectedFile);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a file to submit.');
            return;
        }

        setUploading(true);
        setError('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            await submitAssignment(assignmentId, formData);
            navigate('/student', { state: { message: 'Assignment submitted successfully!' } });
        } catch (err) {
            setError(err.response?.data?.message || 'File upload failed.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="page-container">
            <h2>Submit Assignment</h2>
            {error && <div className="error-alert">{error}</div>}
            <form onSubmit={handleSubmit} className="upload-form">
                <div className="file-input-group">
                    <label htmlFor="file-upload">Select PDF/Document File:</label>
                    <input
                        id="file-upload"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        disabled={uploading}
                    />
                </div>
                {file && <p className="file-info">Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)</p>}
                <button type="submit" disabled={uploading || !file}>
                    {uploading ? 'Uploading...' : 'Submit File'}
                </button>
            </form>
        </div>
    );
};

export default SubmitAssignmentPage;