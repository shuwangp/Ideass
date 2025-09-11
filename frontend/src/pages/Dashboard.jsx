import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  LightBulbIcon,
  PlusIcon,
  ChartBarIcon,
  EyeIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
} from '@heroicons/react/24/outline';
import { useIdeas } from '../hooks/useIdeas.js';
import { useAuth } from '../hooks/useAuth.js';
import { IdeaCard } from '../components/ideas/IdeaCard.jsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';
import { Button } from '../components/common/Button.jsx';

export const Dashboard = () => {
  const { user } = useAuth();
  const { data: ideasData, isLoading } = useIdeas({ limit: 6, sortBy: 'createdAt', sortOrder: 'desc' });

  const stats = [
    {
      name: 'Total Ideas',
      value: ideasData?.total || 0,
      icon: LightBulbIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Published',
      value: ideasData?.ideas.filter(idea => idea.status === 'published').length || 0,
      icon: EyeIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Total Votes',
      value: ideasData?.ideas.reduce((acc, idea) => acc + (idea.totalUpvotes || 0), 0) || 0,
      icon: HeartIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      name: 'Comments',
      value: ideasData?.ideas.reduce((acc, idea) => acc + (idea.comments?.length || 0), 0) || 0,
      icon: ChatBubbleLeftIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.username}! 👋
            </h1>
            <p className="text-blue-100 text-lg">
              Ready to organize and develop your ideas with AI assistance?
            </p>
          </div>
          <div className="hidden md:block">
            <Link to="/ideas/new">
              <Button variant="secondary" size="lg" className="bg-white text-blue-600 hover:bg-gray-50">
                <PlusIcon className="h-5 w-5 mr-2" />
                New Idea
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center">
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Ideas */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recent Ideas</h2>
          <Link to="/ideas">
            <Button variant="outline" size="sm">
              View All Ideas
            </Button>
          </Link>
        </div>

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
            <LightBulbIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No ideas yet</h3>
            <p className="text-gray-500 mb-6">Create your first idea to get started!</p>
            <Link to="/ideas/new">
              <Button>
                <PlusIcon className="h-5 w-5 mr-2" />
                Create Your First Idea
              </Button>
            </Link>
          </motion.div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Link to="/ideas/new" className="block">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <PlusIcon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="ml-4 text-lg font-medium text-gray-900">Create New Idea</h3>
              </div>
              <p className="text-gray-600">Capture your latest inspiration with AI assistance.</p>
            </div>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Link to="/analytics" className="block">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <ChartBarIcon className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="ml-4 text-lg font-medium text-gray-900">View Analytics</h3>
              </div>
              <p className="text-gray-600">Track your idea creation and engagement patterns.</p>
            </div>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Link to="/categories" className="block">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <LightBulbIcon className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="ml-4 text-lg font-medium text-gray-900">Browse Categories</h3>
              </div>
              <p className="text-gray-600">Explore ideas organized by categories and topics.</p>
            </div>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};