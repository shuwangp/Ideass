import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  UserIcon,
  PencilIcon,
  CogIcon,
  ChartBarIcon,
  LightBulbIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  CalendarIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth.js';
import { useIdeas } from '../hooks/useIdeas.js';
import { Button } from '../components/common/Button.jsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';
import { IdeaCard } from '../components/ideas/IdeaCard.jsx';

export const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const { data: userIdeas, isLoading: ideasLoading } = useIdeas({ 
    author: user?.id,
    limit: 12,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const tabs = [
    { id: 'overview', name: 'Overview', icon: UserIcon },
    { id: 'ideas', name: 'My Ideas', icon: LightBulbIcon },
    { id: 'activity', name: 'Activity', icon: ChartBarIcon },
    { id: 'settings', name: 'Settings', icon: CogIcon },
  ];

  const stats = [
    {
      name: 'Total Ideas',
      value: userIdeas?.total || 0,
      icon: LightBulbIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Published',
      value: userIdeas?.ideas?.filter(idea => idea.status === 'published').length || 0,
      icon: GlobeAltIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Total Votes',
      value: userIdeas?.ideas?.reduce((acc, idea) => acc + (idea.totalUpvotes || 0), 0) || 0,
      icon: HeartIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      name: 'Comments',
      value: userIdeas?.ideas?.reduce((acc, idea) => acc + (idea.comments?.length || 0), 0) || 0,
      icon: ChatBubbleLeftIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Profile Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Username</p>
                      <p className="font-medium text-gray-900">{user?.username || 'Not set'}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{user?.email || 'Not set'}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Member Since</p>
                      <p className="font-medium text-gray-900">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <MapPinIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium text-gray-900">{user?.location || 'Not set'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>
              <p className="text-gray-600 leading-relaxed">
                {user?.bio || 'No bio available. Click edit to add your bio and tell others about yourself.'}
              </p>
            </div>
          </div>
        );

      case 'ideas':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">My Ideas</h3>
              <Link to="/ideas/new">
                <Button size="sm">
                  <PencilIcon className="h-4 w-4 mr-2" />
                  New Idea
                </Button>
              </Link>
            </div>

            {ideasLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : userIdeas?.ideas && userIdeas.ideas.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userIdeas.ideas.map((idea) => (
                  <IdeaCard key={idea._id || idea.id} idea={idea} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <LightBulbIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No ideas yet</h3>
                <p className="text-gray-500 mb-6">Start creating your first idea!</p>
                <Link to="/ideas/new">
                  <Button>
                    <PencilIcon className="h-5 w-5 mr-2" />
                    Create Your First Idea
                  </Button>
                </Link>
              </div>
            )}
          </div>
        );

      case 'activity':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-center py-12">
                <ChartBarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Activity Tracking Coming Soon</h3>
                <p className="text-gray-500">
                  We're working on tracking your idea creation, voting, and commenting activity.
                </p>
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Account Settings</h3>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="space-y-6">
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">Profile Settings</h4>
                  <p className="text-gray-600 mb-4">Manage your profile information and preferences.</p>
                  <Button variant="outline">
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-2">Privacy Settings</h4>
                  <p className="text-gray-600 mb-4">Control who can see your ideas and activity.</p>
                  <Button variant="outline">
                    <CogIcon className="h-4 w-4 mr-2" />
                    Privacy Settings
                  </Button>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-2">Notifications</h4>
                  <p className="text-gray-600 mb-4">Manage your notification preferences.</p>
                  <Button variant="outline">
                    <EnvelopeIcon className="h-4 w-4 mr-2" />
                    Notification Settings
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white"
      >
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <UserIcon className="h-12 w-12 text-white" />
            </div>
            <button className="absolute -bottom-2 -right-2 bg-white text-purple-600 p-2 rounded-full shadow-lg hover:bg-gray-50 transition-colors">
              <PencilIcon className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}` 
                : user?.username || 'User Profile'
              }
            </h1>
            <p className="text-purple-100 text-lg mb-2">@{user?.username}</p>
            <p className="text-purple-100">
              {user?.bio || 'Welcome to your profile! Add a bio to tell others about yourself.'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
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

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <tab.icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </div>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};
