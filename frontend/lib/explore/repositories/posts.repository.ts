import { getPool } from '@/lib/db'
import type { RowDataPacket } from 'mysql2'

export interface ExploreUser {
  id: number
  username: string
  display_name: string
  email: string | null
  bio: string | null
  avatar: string | null
  is_private: boolean
  is_verified: boolean
  is_active: boolean
  followers_count: number
  following_count: number
  posts_count: number
  created_at: Date
  updated_at: Date | null
}

export interface ExplorePost {
  id: number
  user_id: number
  content: string
  media_url: string | null
  reply_to_id: number | null
  repost_of_id: number | null
  is_deleted: boolean
  is_private: boolean
  likes_count: number
  replies_count: number
  reposts_count: number
  created_at: Date
  updated_at: Date | null
}

export interface ExplorePostWithUser extends ExplorePost {
  user_username: string
  user_display_name: string
  user_avatar: string | null
  user_is_verified: boolean
  original_post_id: number | null
  original_post_content: string | null
  original_user_username: string | null
  original_user_display_name: string | null
}

export interface ExploreFeedFilters {
  limit?: number
  offset?: number
  exclude_private?: boolean
}

export class ExplorePostsRepository {
  async findPublicPosts(filters?: ExploreFeedFilters): Promise<ExplorePostWithUser[]> {
    const pool = getPool()
    let query = `
      SELECT 
        p.*,
        u.username as user_username,
        u.display_name as user_display_name,
        u.avatar as user_avatar,
        u.is_verified as user_is_verified,
        op.id as original_post_id,
        op.content as original_post_content,
        ou.username as original_user_username,
        ou.display_name as original_user_display_name
      FROM explore_posts p
      INNER JOIN explore_users u ON p.user_id = u.id
      LEFT JOIN explore_posts op ON p.repost_of_id = op.id
      LEFT JOIN explore_users ou ON op.user_id = ou.id
      WHERE p.is_deleted = false
        AND p.is_private = false
        AND u.is_active = true
    `
    const params: any[] = []

    if (filters?.exclude_private !== false) {
      query += ' AND u.is_private = false'
    }

    query += ' ORDER BY p.created_at DESC'

    // Handle LIMIT - MySQL requires integer values, not parameters for LIMIT/OFFSET
    if (filters?.limit) {
      const limit = Number(filters.limit)
      query += ` LIMIT ${limit}`
      if (filters.offset) {
        const offset = Number(filters.offset)
        query += ` OFFSET ${offset}`
      }
    }

    try {
      const [rows] = await pool.execute<RowDataPacket[]>(query, params)
      return rows as ExplorePostWithUser[]
    } catch (error: any) {
      console.error('Error in findPublicPosts:', error)
      console.error('Query:', query)
      console.error('Params:', params)
      // If table doesn't exist, return empty array instead of throwing
      if (error.code === 'ER_NO_SUCH_TABLE' || error.code === '42S02') {
        console.warn('explore_posts table does not exist yet')
        return []
      }
      throw error
    }
  }

  async findById(id: number): Promise<ExplorePostWithUser | null> {
    const pool = getPool()
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        p.*,
        u.username as user_username,
        u.display_name as user_display_name,
        u.avatar as user_avatar,
        u.is_verified as user_is_verified,
        op.id as original_post_id,
        op.content as original_post_content,
        ou.username as original_user_username,
        ou.display_name as original_user_display_name
      FROM explore_posts p
      INNER JOIN explore_users u ON p.user_id = u.id
      LEFT JOIN explore_posts op ON p.repost_of_id = op.id
      LEFT JOIN explore_users ou ON op.user_id = ou.id
      WHERE p.id = ? AND p.is_deleted = false`,
      [id]
    )
    return (rows[0] as ExplorePostWithUser) || null
  }

  async countPublicPosts(): Promise<number> {
    const pool = getPool()
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT COUNT(*) as count
         FROM explore_posts p
         INNER JOIN explore_users u ON p.user_id = u.id
         WHERE p.is_deleted = false
           AND p.is_private = false
           AND u.is_active = true
           AND u.is_private = false`
      )
      return rows[0] ? Number(rows[0].count) : 0
    } catch (error: any) {
      if (error.code === 'ER_NO_SUCH_TABLE' || error.code === '42S02') {
        return 0
      }
      throw error
    }
  }
}

