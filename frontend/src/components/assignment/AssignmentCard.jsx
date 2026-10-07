import React from 'react';
import { Link } from 'react-router-dom';

const AssignmentCard = ({ assignment, isTeacher = false }) => {
    return (
        <div className="assignment-card">
            <h4>{assignment.title}</h4>
            <p>{assignment.description}</p>
            <small>Due Date: {new Date(assignment.dueDate).toLocaleDateString()}</small>
            <div className="card-actions">
                {isTeacher ? (
                    <Link to={`/teacher/submissions/${assignment.id}`}>Grade Submissions</Link>
                ) : (
                    <Link to={`/student/submit/${assignment.id}`}>Submit Work</Link>
                )}
            </div>
        </div>
    );
};

export default AssignmentCard;// AssignmentCard component stub
