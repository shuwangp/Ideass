import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useIdea, useDeleteIdea } from "../hooks/useIdeas.js";
import { LoadingSpinner } from "../components/common/LoadingSpinner.jsx";
import { Button } from "../components/common/Button.jsx";
import { commentService } from "../services/commentService.js";
import { voteService } from "../services/voteService.js";
import { useAuth } from "../hooks/useAuth.js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AIAssistant } from "../components/ai/AIAssistant.jsx";
import clsx from "clsx";

export const IdeaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: idea, isLoading } = useIdea(id);
  const deleteIdea = useDeleteIdea();

  const { data: comments, isLoading: loadingComments } = useQuery({
    queryKey: ["comments", id],
    queryFn: () => commentService.getComments(id),
    enabled: !!id,
  });

  const { data: voteStats } = useQuery({
    queryKey: ["vote-stats", id],
    queryFn: () => voteService.getVoteStats(id),
    enabled: !!id,
  });

  const [commentText, setCommentText] = useState("");
  const [userVoted, setUserVoted] = useState(false);

  const commentMutation = useMutation({
    mutationFn: () =>
      commentService.createComment({ ideaId: id, content: commentText }),
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["comments", id] });
    },
  });

  const voteMutation = useMutation({
    mutationFn: (action) =>
      action === "add"
        ? voteService.vote({ ideaId: id, type: "up" })
        : voteService.removeVote(id),
    onSuccess: () => {
      setUserVoted(!userVoted);
      queryClient.invalidateQueries({ queryKey: ["ideas"] });
      queryClient.invalidateQueries({ queryKey: ["idea", id] });
      queryClient.invalidateQueries({ queryKey: ["vote-stats", id] });
    },
  });

  // Helper
  const formatDate = (date) =>
    new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const canEdit =
    user &&
    (["admin", "moderator"].includes(user.role) ||
      idea?.author?._id === user._id ||
      idea?.author?._id === user.id ||
      idea?.author === user._id ||
      idea?.author === user.id ||
      idea?.author?.id === user._id ||
      idea?.author?.id === user.id);

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );

  if (!idea)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-3">
          <p className="text-lg font-semibold text-gray-700">
            ❌ Idea not found
          </p>
          <Link
            to="/ideas"
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            ← Back to Ideas
          </Link>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">{idea.title}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-gray-500">
            <span>by {idea.author?.username || "Unknown"}</span>
            <span>• {formatDate(idea.createdAt)}</span>
            {idea.status && (
              <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs">
                {idea.status}
              </span>
            )}
            {idea.priority && (
              <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs">
                {idea.priority}
              </span>
            )}
          </div>
          {/* Actions */}
          <div className="flex gap-3 mt-4">
            {canEdit && (
              <>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/ideas/${id}/edit`)}
                >
                  ✏️ Edit
                </Button>
                <Button
                  variant="danger"
                  onClick={async () => {
                    if (confirm("Delete this idea?")) {
                      await deleteIdea.mutateAsync(id);
                      navigate("/ideas");
                    }
                  }}
                >
                  🗑 Delete
                </Button>
              </>
            )}
            <Button
              onClick={() => voteMutation.mutate(userVoted ? "remove" : "add")}
              isLoading={voteMutation.isPending}
              className={clsx(
                "flex items-center gap-2",
                userVoted
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700"
              )}
            >
              👍 {voteStats?.upVotes ?? idea.totalUpvotes ?? 0}
            </Button>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
          <h2 className="font-semibold mb-2">Description</h2>
          <p className="text-gray-700 whitespace-pre-wrap">
            {idea.description || "No description provided."}
          </p>
        </div>

        {/* AI Assistant */}
        {user && (
          <AIAssistant 
            idea={idea} 
            onSuggestionUpdate={(field, value) => {
              // Handle suggestion updates - could be used for editing
              console.log(`AI suggestion for ${field}:`, value);
            }}
          />
        )}

        {/* Comments */}
        <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
          <h2 className="font-semibold mb-4">
            Comments ({comments?.length || 0})
          </h2>
          {loadingComments ? (
            <LoadingSpinner />
          ) : comments?.length ? (
            <div className="space-y-4">
              {comments.map((c) => (
                <div
                  key={c._id}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">
                      {c.author?.username || "User"}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDate(c.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {c.content}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No comments yet.</p>
          )}

          {/* Add Comment */}
          {user ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (commentText.trim()) commentMutation.mutate();
              }}
              className="mt-4"
            >
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="w-full border p-3 rounded-lg"
                rows={3}
              />
              <div className="flex justify-end mt-2">
                <Button type="submit" disabled={!commentText.trim()}>
                  Post Comment
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-center mt-4">
              <Link
                to="/login"
                className="px-4 py-2 bg-blue-600 text-white rounded-md"
              >
                Log in to comment
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
