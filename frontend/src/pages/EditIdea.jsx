import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useIdea, useUpdateIdea } from '../hooks/useIdeas.js';
import { IdeaEditor } from '../components/ideas/IdeaEditor.jsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';

export const EditIdea = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: idea, isLoading } = useIdea(id);
  const updateIdea = useUpdateIdea();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!idea) {
    return <div className="text-center text-gray-600">Idea not found</div>;
  }

  const handleSubmit = async (data) => {
    try {
      await updateIdea.mutateAsync({ id, ...data });
      navigate(`/ideas/${id}`);
    } catch (e) {
      console.error('EditIdea - Update error:', e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Idea</h1>
      <IdeaEditor idea={idea} onSubmit={handleSubmit} isLoading={updateIdea.isPending} />
    </div>
  );
};


