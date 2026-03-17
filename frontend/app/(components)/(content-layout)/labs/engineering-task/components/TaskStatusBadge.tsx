import React from 'react'
import type { TaskStatus } from '@/lib/labs/repositories/engineering-task.repository'

interface TaskStatusBadgeProps {
  status: TaskStatus
}

const TaskStatusBadge: React.FC<TaskStatusBadgeProps> = ({ status }) => {
  const getBadgeClass = () => {
    switch (status) {
      case 'pending':
        return 'bg-secondary'
      case 'in_progress':
        return 'bg-warning text-dark'
      case 'completed':
        return 'bg-success'
      case 'overdue':
        return 'bg-danger'
      case 'cancelled':
        return 'bg-dark'
      default:
        return 'bg-secondary'
    }
  }

  const getLabel = () => {
    switch (status) {
      case 'in_progress':
        return 'In Progress'
      case 'overdue':
        return 'Overdue'
      default:
        return status.charAt(0).toUpperCase() + status.slice(1)
    }
  }

  return (
    <span className={`badge ${getBadgeClass()}`}>
      {getLabel()}
    </span>
  )
}

export default TaskStatusBadge
