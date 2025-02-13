import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function ProjectDetails() {
  const { id } = useParams(); // Get project ID from the route
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const projectRef = doc(db, 'projects', id!);
        const projectSnap = await getDoc(projectRef);
        if (projectSnap.exists()) {
          setProject({ id: projectSnap.id, ...projectSnap.data() });
        } else {
          console.error('Project not found!');
        }
      } catch (error) {
        console.error('Error fetching project:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading project details...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Project not found!</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{project.topic}</h1>

        {/* Display content details */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Generated Content</h2>
          <p className="text-gray-600 whitespace-pre-line">{project.content}</p>
        </section>

        {/* Display other project details */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Details</h2>
          <ul className="list-disc list-inside text-gray-600">
            <li><strong>Type:</strong> {project.type}</li>
            <li><strong>Tone:</strong> {project.tone}</li>
            <li><strong>Keywords:</strong> {project.keywords}</li>
            <li><strong>Length:</strong> {project.length}</li>
            <li><strong>Created At:</strong> {new Date(project.createdAt).toLocaleString()}</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
