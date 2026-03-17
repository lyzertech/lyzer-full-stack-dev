'use client'

import React, { Fragment, useEffect, useState } from 'react'
import Pageheader from '@/shared/layouts-components/pageheader/pageheader'
import Seo from '@/shared/layouts-components/seo/seo'
import { Card, Col, Row } from 'react-bootstrap'
import { getExplorePosts } from '@/app/actions/explore/posts.actions'
import type { ExplorePostWithUser } from '@/lib/explore/repositories/posts.repository'
import Image from 'next/image'

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000)

  if (diffInSeconds < 60) return `${diffInSeconds}s`
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`
  return `${Math.floor(diffInSeconds / 604800)}w`
}

function PostCard({ post }: { post: ExplorePostWithUser }) {
  const isRepost = post.repost_of_id !== null
  const displayPost = isRepost && post.original_post_content ? {
    content: post.original_post_content,
    username: post.original_user_username || 'unknown',
    displayName: post.original_user_display_name || 'Unknown User',
  } : {
    content: post.content,
    username: post.user_username,
    displayName: post.user_display_name,
  }

  return (
    <Card className="custom-card mb-3">
      <Card.Body>
        <div className="d-flex">
          <div className="me-3">
            {post.user_avatar ? (
              <div className="position-relative" style={{ width: 48, height: 48 }}>
                <Image
                  src={post.user_avatar}
                  alt={post.user_display_name}
                  fill
                  className="rounded-circle object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div
                className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-semibold"
                style={{ width: 48, height: 48 }}
              >
                {post.user_display_name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-grow-1">
            <div className="d-flex align-items-center mb-2">
              <span className="fw-semibold me-2">{post.user_display_name}</span>
              {post.user_is_verified && (
                <i className="ri-verified-badge-fill text-primary"></i>
              )}
              <span className="text-muted ms-2">@{post.user_username}</span>
              <span className="text-muted ms-2">·</span>
              <span className="text-muted ms-2">{formatTimeAgo(post.created_at)}</span>
            </div>
            {isRepost && (
              <div className="mb-2 text-muted small">
                <i className="ri-repeat-line me-1"></i>
                Reposted
                {post.original_user_username && (
                  <span> from @{post.original_user_username}</span>
                )}
              </div>
            )}
            {isRepost && post.original_post_content && (
              <Card className="border mb-2 bg-light">
                <Card.Body className="p-3">
                  <div className="d-flex align-items-center mb-2">
                    <span className="fw-semibold me-2">
                      {post.original_user_display_name || 'Unknown User'}
                    </span>
                    <span className="text-muted">@{post.original_user_username || 'unknown'}</span>
                  </div>
                  <div className="text-break">{post.original_post_content}</div>
                </Card.Body>
              </Card>
            )}
            {!isRepost && (
              <div className="mb-2 text-break">{post.content}</div>
            )}
            {post.media_url && (
              <div className="mb-2">
                <img
                  src={post.media_url}
                  alt="Post media"
                  className="rounded"
                  style={{ maxWidth: '100%', height: 'auto', borderRadius: '0.5rem' }}
                />
              </div>
            )}
            <div className="d-flex align-items-center text-muted mt-3">
              <div className="me-4">
                <i className="ri-heart-line me-1"></i>
                <span>{post.likes_count}</span>
              </div>
              <div className="me-4">
                <i className="ri-chat-3-line me-1"></i>
                <span>{post.replies_count}</span>
              </div>
              <div className="me-4">
                <i className="ri-repeat-line me-1"></i>
                <span>{post.reposts_count}</span>
              </div>
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  )
}

export default function ExplorePage() {
  const [posts, setPosts] = useState<ExplorePostWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPosts()
  }, [])

  async function loadPosts() {
    setLoading(true)
    setError(null)
    try {
      const data = await getExplorePosts({ limit: 50, exclude_private: true })
      setPosts(data)
    } catch (err: any) {
      console.error('Error loading explore posts:', err)
      setError(err.message || 'Failed to load explore posts')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Fragment>
        <Seo title="Explore" />
        <Pageheader
          title="Explore"
          subtitle="Discover"
          currentpage="Explore"
          activepage="Explore"
        />
        <Row>
          <Col xl={12}>
            <Card className="custom-card">
              <Card.Body>
                <div className="text-center">Loading...</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Fragment>
    )
  }

  return (
    <Fragment>
      <Seo title="Explore" />
      <Pageheader
        title="Explore"
        subtitle="Discover"
        currentpage="Explore"
        activepage="Explore"
      />

      <Row>
        <Col xl={12}>
          {error ? (
            <Card className="custom-card">
              <Card.Body>
                <div className="alert alert-danger">{error}</div>
              </Card.Body>
            </Card>
          ) : posts.length === 0 ? (
            <Card className="custom-card">
              <Card.Body>
                <div className="text-center py-5">
                  <i className="ri-search-line fs-1 text-muted mb-3"></i>
                  <h5 className="text-muted">No posts found</h5>
                  <p className="text-muted">There are no public posts to explore yet.</p>
                </div>
              </Card.Body>
            </Card>
          ) : (
            <div>
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </Col>
      </Row>
    </Fragment>
  )
}

