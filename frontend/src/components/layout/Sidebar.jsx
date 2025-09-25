import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  LightBulbIcon,
  PlusIcon,
  ChartBarIcon,
  FolderIcon,
  TagIcon,
  StarIcon,
  ArchiveBoxIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  LightBulbIcon as LightBulbIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  FolderIcon as FolderIconSolid,
} from '@heroicons/react/24/solid';
import clsx from 'clsx';

/**
 * @param {Object} props
 * @param {boolean} [props.isOpen]
 * @param {() => void} [props.onClose]
 */
export const Sidebar = ({ isOpen = true, onClose }) => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, activeIcon: HomeIconSolid },
    { name: 'All Ideas', href: '/ideas', icon: LightBulbIcon, activeIcon: LightBulbIconSolid },
    { name: 'Create Idea', href: '/ideas/new', icon: PlusIcon, activeIcon: PlusIcon },
    { name: 'Tags', href: '/tags', icon: TagIcon, activeIcon: TagIcon },
    { name: 'Favorites', href: '/favorites', icon: StarIcon, activeIcon: StarIcon },
    { name: 'Archive', href: '/archive', icon: ArchiveBoxIcon, activeIcon: ArchiveBoxIcon },
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon, activeIcon: ChartBarIconSolid },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-black bg-opacity-50" onClick={onClose} />
      )}

      {/* Sidebar */}
      <motion.div
        initial={{ x: -280 }}
        animate={{ x: isOpen ? 0 : -280 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className={clsx(
          'fixed md:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col',
          'md:translate-x-0'
        )}
      >
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4 md:hidden mb-5">
            <LightBulbIcon className="h-8 w-8 text-blue-600 mr-2" />
            <span className="text-xl font-bold text-gray-900">IdeaFlow</span>
          </div>
          
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = isActive ? item.activeIcon : item.icon;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={clsx(
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-200',
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                  onClick={onClose}
                >
                  <Icon
                    className={clsx(
                      'mr-3 h-5 w-5',
                      isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User section at bottom */}
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <div className="flex items-center w-full">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-medium text-sm">AI</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">AI Assistant</p>
              <p className="text-xs text-gray-500">Ready to help</p>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};