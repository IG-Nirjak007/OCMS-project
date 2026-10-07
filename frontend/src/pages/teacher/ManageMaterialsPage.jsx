import React, { useState } from 'react';
import { uploadMaterial, deleteMaterial } from '../../api/materialApi';
import MaterialList from '../../components/material/MaterialList';

const ManageMaterialsPage = ({ courseId }) => {
    const [file, setFile] = useState(null);
    const [materials, setMaterials] = useState([]);

    const handleUpload = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('file', file);
        const res = await uploadMaterial(courseId, formData);
        setMaterials([...materials, res.data]);
    };

    const handleDelete = async (materialId) => {
        await deleteMaterial(materialId);
        setMaterials(materials.filter((m) => m.id !== materialId));
    };

    return (
        <div className="page-container">
            <h2>Course Materials Management</h2>
            <form onSubmit={handleUpload}>
                <input type="file" onChange={(e) => setFile(e.target.files[0])} required />
                <button type="submit">Upload File</button>
            </form>
            <MaterialList materials={materials} onDelete={handleDelete} isTeacher={true} />
        </div>
    );
};

export default ManageMaterialsPage;// ManageMaterialsPage stub
