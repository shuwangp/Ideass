import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { useIdeas } from '../hooks/useIdeas.js';
import { IdeaCard } from '../components/ideas/IdeaCard.jsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';
import { Button } from '../components/common/Button.jsx';

export const Ideas = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { data: ideasData, isLoading } = useIdeas(filters);

  const categories = [
    'All Categories',
    'Technology',
    'Business',
    'Creative',
    'Personal',
    'Research',
    'Product',
    'Marketing',
    'Other',
  ];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    handleFilterChange('search', searchQuery);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Ideas</h1>
          <p className="text-gray-600 mt-2">
            {ideasData ? `${ideasData.total} ideas found` : 'Loading ideas...'}
          </p>
        </div>
        <Link to="/ideas/new">
          <Button>
            <PlusIcon className="h-5 w-5 mr-2" />
            New Idea
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search ideas..."
              />
            </div>
          </form>

          {/* Filter toggle */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center"
          >
            <FunnelIcon className="h-5 w-5 mr-2" />
            Filters
          </Button>
        </div>

        {/* Filter options */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200"
          >
            {/* Category filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category} value={category === 'All Categories' ? '' : category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Status filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Priority filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={filters.priority || ''}
                onChange={(e) => handleFilterChange('priority', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            {/* Sort filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-');
                  handleFilterChange('sortBy', sortBy);
                  handleFilterChange('sortOrder', sortOrder);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="updatedAt-desc">Recently Updated</option>
                <option value="votes-desc">Most Votes</option>
                <option value="comments-desc">Most Comments</option>
              </select>
            </div>
          </motion.div>
        )}
      </div>

      {/* Ideas Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : ideasData?.ideas && ideasData.ideas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ideasData.ideas.map((idea) => (
            <IdeaCard key={idea._id || idea.id} idea={idea} />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 bg-white rounded-xl border border-gray-200"
        >
          <div className="text-gray-400 mb-4">
            <MagnifyingGlassIcon className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No ideas found</h3>
          <p className="text-gray-500 mb-6">
            Try adjusting your search criteria or create a new idea.
          </p>
          <Link to="/ideas/new">
            <Button>
              <PlusIcon className="h-5 w-5 mr-2" />
              Create New Idea
            </Button>
          </Link>
        </motion.div>
      )}

      {/* Pagination */}
      {ideasData && ideasData.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 mt-8">
          <Button
            variant="outline"
            disabled={filters.page === 1}
            onClick={() => handleFilterChange('page', (filters.page || 1) - 1)}
          >
            Previous
          </Button>
          <span className="text-gray-600">
            Page {filters.page || 1} of {ideasData.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={filters.page === ideasData.totalPages}
            onClick={() => handleFilterChange('page', (filters.page || 1) + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};