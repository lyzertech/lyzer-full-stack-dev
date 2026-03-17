import React from 'react'
import type { TaskPriority } from '@/lib/labs/repositories/engineering-task.repository'

interface TaskPriorityBadgeProps {
  priority: TaskPriority
}

const TaskPriorityBadge: React.FC<TaskPriorityBadgeProps> = ({ priority }) => {
  const getBadgeClass = () => {
    switch (priority) {
      case 'low':
        return 'bg-success'
      case 'normal':
        return 'bg-info'
      case 'high':
        return 'bg-warning text-dark'
      case 'emergency':
        return 'bg-danger'
      default:
        return 'bg-secondary'
    }
  }

  const getLabel = () => {
    return priority.charAt(0).toUpperCase() + priority.slice(1)
  }

  const getIcon = () => {
    switch (priority) {
      case 'emergency':
        return '🔴'
      case 'high':
        return '🟡'
      case 'normal':
        return 'ℹ️'
      case 'low':
        return '🟢'
      default:
        return ''
    }
  }

  return (
    <span className={`badge ${getBadgeClass()}`}>
      <span className="me-1">{getIcon()}</span>
      {getLabel()}
    </span>
  )
}

export default TaskPriorityBadge
