'use client'

import { useMutation, useQuery, UseQueryOptions } from '@tanstack/react-query';
import { generatePosts, healthCheck, validateGitHubUsername, GeneratePostsRequest, GeneratePostsResponse } from './api';

/**
 * Hook to generate LinkedIn posts
 */
export function useGeneratePosts() {
  return useMutation<GeneratePostsResponse, Error, GeneratePostsRequest>({
    mutationFn: generatePosts,
    retry: 1,
    retryDelay: 1000,
  });
}

/**
 * Hook to check backend health
 */
export function useHealthCheck(options?: UseQueryOptions<{ status: string; timestamp: string }, Error>) {
  return useQuery({
    queryKey: ['health'],
    queryFn: healthCheck,
    refetchInterval: 30000, // Check every 30 seconds
    retry: 3,
    ...options,
  });
}

/**
 * Hook to validate GitHub username
 */
export function useValidateUsername(username: string, enabled: boolean = false) {
  return useQuery({
    queryKey: ['validate-username', username],
    queryFn: () => validateGitHubUsername(username),
    enabled: enabled && username.length > 0,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}