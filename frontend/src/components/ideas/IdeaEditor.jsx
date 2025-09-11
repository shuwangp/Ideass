import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { Button } from '../common/Button.jsx';
import { SparklesIcon } from '@heroicons/react/24/outline';

const schema = yup.object({
  title: yup.string().required('Title is required').min(3, 'Title must be at least 3 characters'),
  description: yup.string().required('Description is required').min(10, 'Description must be at least 10 characters'),
  category: yup.string().required('Category is required'),
  tags: yup.array().of(yup.string()).default([]),
  status: yup.string().oneOf(['draft', 'published']).default('draft'),
  priority: yup.string().oneOf(['low', 'medium', 'high']).default('medium'),
});

const categories = [
  'Technology',
  'Business',
  'Marketing',
  'Product',
  'Process Improvement',
  'Cost Reduction',
  'Innovation',
  'Sustainability',
  'Other',
];

const priorities = [
  { value: 'low', label: 'Low Priority' },
  { value: 'medium', label: 'Medium Priority' },
  { value: 'high', label: 'High Priority' },
];

/**
 * @param {Object} props
 * @param {import('../../types/index.js').Idea} [props.idea]
 * @param {(data: any) => void} props.onSubmit
 * @param {boolean} [props.isLoading]
 * @param {() => void} [props.onGenerateAISuggestions]
 */
export const IdeaEditor = ({
  idea,
  onSubmit,
  isLoading = false,
  onGenerateAISuggestions,
}) => {
  const [tagInput, setTagInput] = React.useState('');

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: idea?.title || '',
      description: idea?.description || '',
      category: idea?.category || '',
      tags: idea?.tags || [],
      status: idea?.status || 'draft',
      priority: idea?.priority || 'medium',
    },
  });

  const currentTags = watch('tags') || [];

  const handleSubmitForm = (data) => {
    if (idea) {
      onSubmit({ ...data, id: idea._id || idea.id });
    } else {
      onSubmit(data);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !currentTags.includes(tagInput.trim())) {
      setValue('tags', [...currentTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setValue('tags', currentTags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Idea Title *
          </label>
          <input
            {...register('title')}
            type="text"
            id="title"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="What's your brilliant idea?"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description *
            </label>
            {onGenerateAISuggestions && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onGenerateAISuggestions}
                className="flex items-center"
              >
                <SparklesIcon className="h-4 w-4 mr-1" />
                AI Assist
              </Button>
            )}
          </div>
          <textarea
            {...register('description')}
            id="description"
            rows={8}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            placeholder="Describe your idea in detail..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        {/* Category and Priority */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              {...register('category')}
              id="category"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              {...register('priority')}
              id="priority"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              {priorities.map((priority) => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {currentTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagInputKeyDown}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Add tags (press Enter or comma to add)"
            />
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={addTag}
              className="rounded-l-none border-l-0"
            >
              Add
            </Button>
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    {...field}
                    value="draft"
                    checked={field.value === 'draft'}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Save as Draft</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    {...field}
                    value="published"
                    checked={field.value === 'published'}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Publish</span>
                </label>
              </div>
            )}
          />
        </div>

        {/* Submit buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isLoading}
          >
            {idea ? 'Update Idea' : 'Create Idea'}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};