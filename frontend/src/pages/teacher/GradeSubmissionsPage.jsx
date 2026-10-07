import React, { useState } from 'react';
import { gradeSubmission } from '../../api/assignmentApi';

const GradeSubmissionsPage = ({ submissions = [] }) => {
    const [grades, setGrades] = useState({});

    const handleGradeSubmit = async (submissionId) => {
        await gradeSubmission(submissionId, { grade: grades[submissionId] });
        alert('Grade updated successfully!');
    };

    return (
        <div className="page-container">
            <h2>Student Submissions</h2>
            {submissions.map((sub) => (
                <div key={sub.id} className="submission-item">
                    <p>Student: {sub.studentName}</p>
                    <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer">View Submission</a>
                    <input
                        type="number"
                        placeholder="Grade (0-100)"
                        onChange={(e) => setGrades({ ...grades, [sub.id]: e.target.value })}
                    />
                    <button onClick={() => handleGradeSubmit(sub.id)}>Save Grade</button>
                </div>
            ))}
        </div>
    );
};

export default GradeSubmissionsPage;// GradeSubmissionsPage stub
