import React from 'react'
import type { WikiPriority } from '@/lib/labs/repositories/engineering-wiki.repository'

interface PriorityBadgeProps {
  priority: WikiPriority
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const getBadgeClass = () => {
    switch (priority) {
      case 'low':
        return 'bg-success'
      case 'medium':
        return 'bg-info'
      case 'high':
        return 'bg-warning'
      case 'critical':
        return 'bg-danger'
      default:
        return 'bg-secondary'
    }
  }

  const getLabel = () => {
    return priority.charAt(0).toUpperCase() + priority.slice(1)
  }

  return (
    <span className={`badge ${getBadgeClass()}`}>
      {getLabel()}
    </span>
  )
}

export default PriorityBadge

