import React from 'react'
import type { WikiStatus } from '@/lib/labs/repositories/engineering-wiki.repository'

interface StatusBadgeProps {
  status: WikiStatus
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getBadgeClass = () => {
    switch (status) {
      case 'open':
        return 'bg-primary'
      case 'monitoring':
        return 'bg-warning'
      case 'solved':
        return 'bg-success'
      case 'closed':
        return 'bg-secondary'
      default:
        return 'bg-secondary'
    }
  }

  const getLabel = () => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  return (
    <span className={`badge ${getBadgeClass()}`}>
      {getLabel()}
    </span>
  )
}

export default StatusBadge

