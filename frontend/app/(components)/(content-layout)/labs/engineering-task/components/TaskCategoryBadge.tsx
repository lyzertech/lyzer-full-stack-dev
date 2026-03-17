import React from 'react'
import type { TaskCategory } from '@/lib/labs/repositories/engineering-task.repository'

interface TaskCategoryBadgeProps {
  category: TaskCategory
}

const TaskCategoryBadge: React.FC<TaskCategoryBadgeProps> = ({ category }) => {
  const getBadgeClass = () => {
    switch (category) {
      case 'daily':
        return 'bg-primary'
      case 'weekly':
        return 'bg-info'
      case 'monthly':
        return 'bg-secondary'
      default:
        return 'bg-secondary'
    }
  }

  const getLabel = () => {
    return category.charAt(0).toUpperCase() + category.slice(1)
  }

  return (
    <span className={`badge ${getBadgeClass()}`}>
      {getLabel()}
    </span>
  )
}

export default TaskCategoryBadge
