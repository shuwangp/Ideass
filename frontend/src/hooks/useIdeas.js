import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ideaService } from '../services/ideaService.js';
import toast from 'react-hot-toast';

export const useIdeas = (filters) => {
  return useQuery({
    queryKey: ['ideas', filters],
    queryFn: () => ideaService.getIdeas(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useIdea = (id) => {
  return useQuery({
    queryKey: ['idea', id],
    queryFn: () => ideaService.getIdeaById(id),
    enabled: !!id,
  });
};

export const useCreateIdea = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => ideaService.createIdea(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
      toast.success('Idea created successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create idea');
    },
  });
};

export const useUpdateIdea = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => ideaService.updateIdea(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
      queryClient.invalidateQueries({ queryKey: ['idea', data.id] });
      toast.success('Idea updated successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update idea');
    },
  });
};

export const useDeleteIdea = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => ideaService.deleteIdea(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
      toast.success('Idea deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete idea');
    },
  });
};

export const useGenerateAISuggestions = () => {
  return useMutation({
    mutationFn: ({ ideaId, type }) =>
      ideaService.generateAISuggestions(ideaId, type),
    onError: (error) => {
      toast.error(error.message || 'Failed to generate AI suggestions');
    },
  });
};

export const useSearchIdeas = (query) => {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => ideaService.searchIdeas(query),
    enabled: query.length > 2,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};