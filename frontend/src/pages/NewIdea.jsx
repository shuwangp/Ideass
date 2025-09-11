import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IdeaEditor } from '../components/ideas/IdeaEditor.jsx';
import { useCreateIdea, useGenerateAISuggestions } from '../hooks/useIdeas.js';
import { useAuth } from '../hooks/useAuth.js';
import toast from 'react-hot-toast';

export const NewIdea = () => {
  const navigate = useNavigate();
  const createIdea = useCreateIdea();
  const generateAISuggestions = useGenerateAISuggestions();
  const { user } = useAuth(); // เพิ่มบรรทัดนี้

 
  const handleSubmit = async (data) => {
    try {
      const newIdea = await createIdea.mutateAsync({
        ...data,
        author: user.id, // เพิ่ม author
      });
      navigate(`/ideas/${newIdea.id}`);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleGenerateAISuggestions = () => {
    toast.success('AI suggestions feature coming soon!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Idea</h1>
        <p className="text-gray-600">
          Capture your inspiration and let AI help you develop it further.
        </p>
      </motion.div>

      <IdeaEditor
        onSubmit={handleSubmit}
        isLoading={createIdea.isPending}
        onGenerateAISuggestions={handleGenerateAISuggestions}
      />
    </div>
  );
};