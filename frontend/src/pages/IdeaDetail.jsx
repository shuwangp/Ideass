import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useIdea, useDeleteIdea } from '../hooks/useIdeas.js';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';
import { Button } from '../components/common/Button.jsx';
import { commentService } from '../services/commentService.js';
import { voteService } from '../services/voteService.js';
import { useAuth } from '../hooks/useAuth.js';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const IdeaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: idea, isLoading } = useIdea(id);
  const deleteIdea = useDeleteIdea();

  const { data: comments, isLoading: loadingComments } = useQuery({
    queryKey: ['comments', id],
    queryFn: () => commentService.getComments(id),
    enabled: !!id,
  });

  const { data: voteStats } = useQuery({
    queryKey: ['vote-stats', id],
    queryFn: () => voteService.getVoteStats(id),
    enabled: !!id,
  });

  const [commentText, setCommentText] = React.useState('');
  const [userVoted, setUserVoted] = React.useState(false);

  const commentMutation = useMutation({
    mutationFn: () => commentService.createComment({ ideaId: id, content: commentText }),
    onSuccess: () => {
      setCommentText('');
      queryClient.invalidateQueries({ queryKey: ['comments', id] });
    }
  });

  const voteMutation = useMutation({
    mutationFn: (action) => action === 'add' ? voteService.vote({ ideaId: id, type: 'up' }) : voteService.removeVote(id),
    onSuccess: () => {
      setUserVoted(!userVoted);
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
      queryClient.invalidateQueries({ queryKey: ['idea', id] });
      queryClient.invalidateQueries({ queryKey: ['vote-stats', id] });
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading idea details...</p>
        </div>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Idea not found</h3>
            <p className="text-gray-500">This idea may have been removed or doesn't exist.</p>
          </div>
          <Link to="/ideas" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            ← Back to Ideas
          </Link>
        </div>
      </div>
    );
  }

  // Enhanced permission check
  const canEdit = !!user && (
    user.role === 'admin' ||
    user.role === 'moderator' ||
    (idea.author && (
      idea.author._id === (user.id || user._id) ||
      idea.author === (user.id || user._id)
    )) ||
    idea.authorId === (user.id || user._id)
  );

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Unknown date';
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': 'bg-gray-100 text-gray-700',
      'medium': 'bg-orange-100 text-orange-700',
      'high': 'bg-red-100 text-red-700',
      'urgent': 'bg-red-200 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link 
            to="/ideas" 
            className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors group"
          >
            <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Ideas
          </Link>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-8 border-b border-gray-200">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-bold text-gray-900 mb-4 break-words">
                  {idea.title}
                </h1>
                
                {/* Meta Information */}
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  {idea.status && (
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${getStatusColor(idea.status)}`}>
                      {idea.status}
                    </span>
                  )}
                  {idea.priority && (
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${getPriorityColor(idea.priority)}`}>
                      {idea.priority} priority
                    </span>
                  )}
                  {idea.category && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {idea.category}
                    </span>
                  )}
                </div>

                {/* Author and Date */}
                <div className="flex items-center text-sm text-gray-600 space-x-4">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    by {idea.author?.username || idea.authorName || 'Unknown Author'}
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatDate(idea.createdAt)}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 flex-shrink-0">
                {canEdit && (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate(`/ideas/${id}/edit`)}
                      className="flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </Button>
                    <Button 
                      variant="danger"
                      onClick={async () => {
                        if (!confirm('Delete this idea? This cannot be undone.')) return;
                        try {
                          await deleteIdea.mutateAsync(id);
                          navigate('/ideas');
                        } catch (e) {
                          // toast แสดงจาก hook แล้ว ถ้ายังอยากโชว์ซ้ำ ให้ alert ได้
                        }
                      }}
                      isLoading={deleteIdea.isPending}
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a2 2 0 012-2h4a2 2 0 012 2m-8 0h8" />
                      </svg>
                      Delete
                    </Button>
                  </>
                )}
                <Button 
                  onClick={() => voteMutation.mutate(userVoted ? 'remove' : 'add')}
                  className={`flex items-center gap-2 transition-all ${
                    userVoted ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  isLoading={voteMutation.isPending}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                  {voteStats?.upVotes ?? idea.totalUpvotes ?? 0}
                </Button>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="px-8 py-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {idea.description || 'No description provided.'}
              </p>
            </div>
          </div>

          {/* Comments Section */}
          <div className="bg-gray-50 px-8 py-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Comments ({comments?.length || 0})
              </h2>
            </div>

            {/* Comments List */}
            <div className="space-y-4 mb-8">
              {loadingComments ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : comments && comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment._id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                          {(comment.author?.username || 'U')[0].toUpperCase()}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <p className="font-medium text-gray-900">
                            {comment.author?.username || 'Unknown User'}
                          </p>
                          <span className="text-gray-400">•</span>
                          <p className="text-sm text-gray-500">
                            {formatDate(comment.createdAt)}
                          </p>
                          {user && (comment.author?._id === (user.id || user._id)) && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                fetch(`/api/comments/${comment._id}`, {
                                  method: 'DELETE',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
                                  }
                                }).then(() => {
                                  queryClient.invalidateQueries({ queryKey: ['comments', id] });
                                });
                              }}
                              className="ml-3 text-xs text-red-600 hover:underline"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-gray-500">No comments yet. Be the first to share your thoughts!</p>
                </div>
              )}
            </div>

            {/* Add Comment Form */}
            {user ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!commentText.trim()) return;
                  commentMutation.mutate();
                }}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-medium">
                      {(user.username || user.email || 'Y')[0].toUpperCase()}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Share your thoughts on this idea..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-sm text-gray-500">
                        {commentText.length}/500 characters
                      </p>
                      <Button 
                        type="submit" 
                        isLoading={commentMutation.isPending}
                        disabled={!commentText.trim() || commentText.length > 500}
                        className="px-6"
                      >
                        Post Comment
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
                <p className="text-gray-600 mb-4">Please log in to leave a comment</p>
                <Link 
                  to="/login" 
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Log In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};