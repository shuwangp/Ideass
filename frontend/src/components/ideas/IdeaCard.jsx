import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  HeartIcon, 
  ChatBubbleLeftIcon, 
  CalendarIcon,
  TagIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { formatDistanceToNow } from 'date-fns';
import clsx from 'clsx';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { voteService } from '../../services/voteService.js';

/**
 * @param {Object} props
 * @param {import('../../types/index.js').Idea} props.idea
 * @param {(ideaId: string, type: 'up' | 'down') => void} [props.onVote]
 * @param {(ideaId: string) => void} [props.onFavorite]
 */
export const IdeaCard = ({ idea, onVote, onFavorite }) => {
  const queryClient = useQueryClient();
  const [isVoted, setIsVoted] = React.useState(false);
  const [voteCount, setVoteCount] = React.useState(() => (
    typeof idea.totalUpvotes === 'number' ? idea.totalUpvotes : (idea.votes?.length || 0)
  ));

  const ideaId = idea._id || idea.id;

  const voteMutation = useMutation({
    mutationFn: ({ action }) => {
      if (action === 'add') {
        return voteService.vote({ ideaId, type: 'up' });
      }
      return voteService.removeVote(ideaId);
    },
    onSuccess: () => {
      // รีเฟรชรายการไอเดียเพื่อให้ยอดบนการ์ดอื่น ๆ อัปเดตด้วย
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
      queryClient.invalidateQueries({ queryKey: ['idea', ideaId] });
    }
  });
  const [isFavorited, setIsFavorited] = React.useState(false);

  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    published: 'bg-blue-100 text-blue-800',
    archived: 'bg-orange-100 text-orange-800',
  };

  const handleVote = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const nextVoted = !isVoted;
    setIsVoted(nextVoted);
    setVoteCount((prev) => nextVoted ? prev + 1 : Math.max(0, prev - 1));

    // เรียก API จริง
    voteMutation.mutate({ action: nextVoted ? 'add' : 'remove' });
    onVote?.(ideaId, 'up');
  };

  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorited(!isFavorited);
    onFavorite?.(idea._id || idea.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Link to={`/ideas/${idea._id || idea.id}`}>
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {idea.title}
              </h3>
              <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                {idea.description}
              </p>
            </div>
          </div>

          {/* Tags */}
          {idea.tags && idea.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {idea.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700"
                >
                  <TagIcon className="h-3 w-3 mr-1" />
                  {tag}
                </span>
              ))}
              {idea.tags.length > 3 && (
                <span className="text-xs text-gray-500">+{idea.tags.length - 3} more</span>
              )}
            </div>
          )}

          {/* Status and Priority badges */}
          <div className="flex items-center gap-2 mb-4">
            <span
              className={clsx(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                statusColors[idea.status]
              )}
            >
              {idea.status}
            </span>
            <span
              className={clsx(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                priorityColors[idea.priority]
              )}
            >
              {idea.priority} priority
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
              {idea.category}
            </span>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center text-sm text-gray-500">
              <CalendarIcon className="h-4 w-4 mr-1" />
              {formatDistanceToNow(new Date(idea.createdAt), { addSuffix: true })}
            </div>

            <div className="flex items-center space-x-4">
              {/* Views */}
              <div className="flex items-center text-sm text-gray-500">
                <EyeIcon className="h-4 w-4 mr-1" />
                <span>0</span>
              </div>

              {/* Comments */}
              <div className="flex items-center text-sm text-gray-500">
                <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
                <span>{idea.comments?.length || 0}</span>
              </div>

              {/* Vote button */}
              <button
                onClick={handleVote}
                className={clsx(
                  'flex items-center text-sm transition-colors',
                  isVoted ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
                )}
              >
                {isVoted ? (
                  <HeartIconSolid className="h-4 w-4 mr-1" />
                ) : (
                  <HeartIcon className="h-4 w-4 mr-1" />
                )}
                <span>{voteCount}</span>
              </button>

              {/* Favorite button */}
              <button
                onClick={handleFavorite}
                className={clsx(
                  'text-gray-400 hover:text-yellow-500 transition-colors',
                  isFavorited && 'text-yellow-500'
                )}
              >
                <HeartIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};