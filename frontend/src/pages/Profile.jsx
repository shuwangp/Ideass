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
import { ProfileEditModal } from '../components/common/ProfileEditModal.jsx';

export const Profile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { data: userIdeas, isLoading: ideasLoading } = useIdeas({ 
    author: user?._id || user?.id,
    limit: 12,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const handleProfileUpdate = (updatedUser) => {
    updateUser(updatedUser);
  };

  const tabs = [
    { id: 'overview', name: 'ภาพรวม', icon: UserIcon },
    { id: 'ideas', name: 'ไอเดียของฉัน', icon: LightBulbIcon },
    { id: 'activity', name: 'กิจกรรม', icon: ChartBarIcon },
    { id: 'settings', name: 'การตั้งค่า', icon: CogIcon },
  ];

  const stats = [
    {
      name: 'ไอเดียทั้งหมด',
      value: userIdeas?.total || 0,
      icon: LightBulbIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'เผยแพร่แล้ว',
      value: userIdeas?.ideas?.filter(idea => idea.status === 'published').length || 0,
      icon: GlobeAltIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'คะแนนรวม',
      value: userIdeas?.ideas?.reduce((acc, idea) => acc + (idea.totalUpvotes || 0), 0) || 0,
      icon: HeartIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      name: 'ความคิดเห็น',
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">ข้อมูลโปรไฟล์</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">ชื่อผู้ใช้</p>
                      <p className="font-medium text-gray-900">{user?.username || 'ยังไม่ได้ตั้งค่า'}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">อีเมล</p>
                      <p className="font-medium text-gray-900">{user?.email || 'ยังไม่ได้ตั้งค่า'}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">สมาชิกตั้งแต่</p>
                      <p className="font-medium text-gray-900">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('th-TH') : 'ไม่ทราบ'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">เกี่ยวกับ</h3>
              <p className="text-gray-600 leading-relaxed">
                {user?.bio || 'ยังไม่มีประวัติส่วนตัว คลิกแก้ไขเพื่อเพิ่มประวัติส่วนตัวและบอกผู้อื่นเกี่ยวกับตัวคุณ'}
              </p>
            </div>
          </div>
        );

      case 'ideas':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">ไอเดียของฉัน</h3>
              <Link to="/ideas/new">
                <Button size="sm">
                  <PencilIcon className="h-4 w-4 mr-2" />
                  ไอเดียใหม่
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">ยังไม่มีไอเดีย</h3>
                <p className="text-gray-500 mb-6">เริ่มสร้างไอเดียแรกของคุณ!</p>
                <Link to="/ideas/new">
                  <Button>
                    <PencilIcon className="h-5 w-5 mr-2" />
                    สร้างไอเดียแรกของคุณ
                  </Button>
                </Link>
              </div>
            )}
          </div>
        );

      case 'activity':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">กิจกรรมล่าสุด</h3>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-center py-12">
                <ChartBarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">การติดตามกิจกรรมกำลังจะมา</h3>
                <p className="text-gray-500">
                  เรากำลังทำงานเกี่ยวกับการติดตามการสร้างไอเดีย การโหวต และการแสดงความคิดเห็นของคุณ
                </p>
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">การตั้งค่าบัญชี</h3>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="space-y-6">
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">การตั้งค่าโปรไฟล์</h4>
                  <p className="text-gray-600 mb-4">จัดการข้อมูลโปรไฟล์และการตั้งค่าของคุณ</p>
                  <Button 
                    variant="outline"
                    onClick={() => setIsEditModalOpen(true)}
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    แก้ไขโปรไฟล์
                  </Button>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-2">การตั้งค่าความเป็นส่วนตัว</h4>
                  <p className="text-gray-600 mb-4">ควบคุมว่าใครสามารถเห็นไอเดียและกิจกรรมของคุณได้</p>
                  <Button variant="outline">
                    <CogIcon className="h-4 w-4 mr-2" />
                    การตั้งค่าความเป็นส่วนตัว
                  </Button>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-2">การแจ้งเตือน</h4>
                  <p className="text-gray-600 mb-4">จัดการการตั้งค่าการแจ้งเตือนของคุณ</p>
                  <Button variant="outline">
                    <EnvelopeIcon className="h-4 w-4 mr-2" />
                    การตั้งค่าการแจ้งเตือน
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
            <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center overflow-hidden">
              {user?.avatar ? (
                <img
                  src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserIcon className="h-12 w-12 text-white" />
              )}
            </div>
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="absolute -bottom-2 -right-2 bg-white text-purple-600 p-2 rounded-full shadow-lg hover:bg-gray-50 transition-colors"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">
              {user?.username || 'โปรไฟล์ผู้ใช้'}
            </h1>
            <p className="text-purple-100 text-lg mb-2">@{user?.username}</p>
            <p className="text-purple-100">
              {user?.bio || 'ยินดีต้อนรับสู่โปรไฟล์ของคุณ! เพิ่มประวัติส่วนตัวเพื่อบอกผู้อื่นเกี่ยวกับตัวคุณ'}
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

      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        onProfileUpdate={handleProfileUpdate}
      />
    </div>
  );
};
