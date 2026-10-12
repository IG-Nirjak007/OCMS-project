import React from 'react';
import { Navigate, useParams } from 'react-router-dom';

const CreateAssignmentPage = () => {
  const { courseId } = useParams();
  // Redirect to ManageMaterialsPage which has the Create Assignment form
  return <Navigate to={`/courses/${courseId}/materials`} replace />;
};

export default CreateAssignmentPage;