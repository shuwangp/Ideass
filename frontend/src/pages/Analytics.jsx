import React from 'react';
import { analyticsService } from '../services/analyticsService.js';
import { useQuery } from '@tanstack/react-query';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';

export const Analytics = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => analyticsService.getAnalytics(),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">No data available</h3>
          <p className="text-gray-500">Analytics data will appear here once available.</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Ideas',
      value: data.totalIdeas ?? 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      change: '+12%',
      changeColor: 'text-green-600',
    },
    {
      label: 'Total Comments',
      value: data.totalComments ?? 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      change: '+8%',
      changeColor: 'text-green-600',
    },
    {
      label: 'Total Upvotes',
      value: data.totalUpvotes ?? 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
        </svg>
      ),
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      change: '+15%',
      changeColor: 'text-green-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="relative overflow-hidden bg-white shadow-sm border-b border-gray-200">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Track your platform's performance and engagement metrics
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden"
              style={{
                animationDelay: `${index * 150}ms`,
                animation: 'fadeInUp 0.6s ease-out forwards',
              }}
            >
              {/* Background gradient */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-10 rounded-full -translate-y-8 translate-x-8 group-hover:scale-110 transition-transform duration-500`}></div>
              
              <div className="relative p-8">
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-14 h-14 ${stat.bgColor} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <div className={stat.iconColor}>
                    {stat.icon}
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                    {stat.label}
                  </p>
                  <div className="flex items-end space-x-3">
                    <p className="text-3xl font-bold text-gray-900">
                      {stat.value.toLocaleString()}
                    </p>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${stat.changeColor} bg-green-100`}>
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
                      </svg>
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">vs last month</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info Section */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">Performance Overview</h3>
            <p className="text-gray-600 mt-1">Your platform metrics at a glance</p>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-xl">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Engagement Rate</p>
                  <p className="text-sm text-gray-600">
                    {data.totalComments > 0 && data.totalIdeas > 0 
                      ? `${Math.round((data.totalComments / data.totalIdeas) * 100)}% average`
                      : 'No data yet'
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-xl">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Popular Ideas</p>
                  <p className="text-sm text-gray-600">
                    {data.totalUpvotes > 0 && data.totalIdeas > 0 
                      ? `${Math.round(data.totalUpvotes / data.totalIdeas)} avg upvotes per idea`
                      : 'No data yet'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};