'use server'

import {
  ExplorePostsRepository,
  type ExploreFeedFilters,
} from '@/lib/explore/repositories/posts.repository'

const postsRepo = new ExplorePostsRepository()

export async function getExplorePosts(filters?: ExploreFeedFilters) {
  try {
    return await postsRepo.findPublicPosts(filters)
  } catch (error: any) {
    console.error('Error fetching explore posts:', error)
    const errorMessage = error?.message || 'Failed to fetch explore posts'
    throw new Error(errorMessage)
  }
}

export async function getExplorePostById(id: number) {
  try {
    return await postsRepo.findById(id)
  } catch (error) {
    console.error('Error fetching explore post:', error)
    throw new Error('Failed to fetch explore post')
  }
}

export async function getExplorePostsCount() {
  try {
    return await postsRepo.countPublicPosts()
  } catch (error) {
    console.error('Error counting explore posts:', error)
    return 0
  }
}

