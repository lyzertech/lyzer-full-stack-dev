'use client'

import React, { Fragment, useEffect, useState } from 'react'
import Pageheader from '@/shared/layouts-components/pageheader/pageheader'
import Seo from '@/shared/layouts-components/seo/seo'
import { Button, Card, Col, Row } from 'react-bootstrap'
import { useRouter } from 'next/navigation'
import { getDashboardStats, getWeeklyProgress, getMonthlyCalendar } from '@/app/actions/labs/engineering-task.actions'
import type {
  DashboardStats,
  WeeklyProgressData,
  MonthlyCalendarTask,
} from '@/lib/labs/repositories/engineering-task.repository'

const EngineeringTaskDashboard: React.FC = () => {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgressData[]>([])
  const [calendarData, setCalendarData] = useState<MonthlyCalendarTask[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  async function loadDashboardData() {
    setLoading(true)
    setError(null)
    try {
      const [statsData, progressData, calendarData] = await Promise.all([
        getDashboardStats(),
        getWeeklyProgress(),
        getMonthlyCalendar(new Date().getFullYear(), new Date().getMonth() + 1),
      ])
      setStats(statsData)
      setWeeklyProgress(progressData)
      setCalendarData(calendarData)
    } catch (err: any) {
      console.error('Error loading dashboard:', err)
      setError(err.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Fragment>
      <Seo title="Engineering Task Management" />
      <Pageheader
        title="Labs"
        subtitle="Engineering Task Management"
        currentpage="Dashboard"
        activepage="Engineering Task"
      />

      {error && (
        <Row className="mb-3">
          <Col xl={12}>
            <div className="alert alert-danger">{error}</div>
          </Col>
        </Row>
      )}

      {/* Summary Cards */}
      <Row className="mb-4">
        <Col xl={12}>
          <h4 className="fw-bold py-3 mb-3">Task Overview</h4>
        </Col>

        <Col xxl={3} xl={6} lg={6} md={6} sm={12}>
          <Card className="custom-card">
            <Card.Body>
              <div className="d-flex align-items-top justify-content-between">
                <div className="flex-fill">
                  <p className="fw-semibold mb-1">Unfinished Daily Tasks</p>
                  <h3 className="fw-bold mb-0">
                    {loading ? (
                      <span className="text-muted">...</span>
                    ) : (
                      <span className={stats && stats.unfinished_daily_tasks > 0 ? 'text-danger' : 'text-success'}>
                        {stats?.unfinished_daily_tasks || 0}
                      </span>
                    )}
                  </h3>
                  <p className="text-muted fs-12 mb-0">
                    <Button
                      size="sm"
                      variant="outline-primary"
                      className="mt-2"
                      onClick={() => router.push('/labs/engineering-task/daily')}
                    >
                      View Daily Tasks
                    </Button>
                  </p>
                </div>
                <div className="ms-2">
                  <span className="avatar avatar-md bg-primary svg-white">
                    <i className="ri-task-line fs-20"></i>
                  </span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xxl={3} xl={6} lg={6} md={6} sm={12}>
          <Card className="custom-card">
            <Card.Body>
              <div className="d-flex align-items-top justify-content-between">
                <div className="flex-fill">
                  <p className="fw-semibold mb-1">Weekly Progress</p>
                  <h3 className="fw-bold mb-0">
                    {loading ? (
                      <span className="text-muted">...</span>
                    ) : (
                      <span className={stats && stats.weekly_progress_percent >= 80 ? 'text-success' : 'text-warning'}>
                        {stats?.weekly_progress_percent || 0}%
                      </span>
                    )}
                  </h3>
                  <p className="text-muted fs-12 mb-0">Completion rate this week</p>
                </div>
                <div className="ms-2">
                  <span className="avatar avatar-md bg-warning svg-white">
                    <i className="ri-calendar-check-line fs-20"></i>
                  </span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xxl={3} xl={6} lg={6} md={6} sm={12}>
          <Card className="custom-card">
            <Card.Body>
              <div className="d-flex align-items-top justify-content-between">
                <div className="flex-fill">
                  <p className="fw-semibold mb-1">Monthly Completion</p>
                  <h3 className="fw-bold mb-0">
                    {loading ? (
                      <span className="text-muted">...</span>
                    ) : (
                      <span className={stats && stats.monthly_completion_percent >= 70 ? 'text-success' : 'text-info'}>
                        {stats?.monthly_completion_percent || 0}%
                      </span>
                    )}
                  </h3>
                  <p className="text-muted fs-12 mb-0">Completion rate this month</p>
                </div>
                <div className="ms-2">
                  <span className="avatar avatar-md bg-info svg-white">
                    <i className="ri-calendar-event-line fs-20"></i>
                  </span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xxl={3} xl={6} lg={6} md={6} sm={12}>
          <Card className="custom-card">
            <Card.Body>
              <div className="d-flex align-items-top justify-content-between">
                <div className="flex-fill">
                  <p className="fw-semibold mb-1">Overdue Tasks</p>
                  <h3 className="fw-bold mb-0">
                    {loading ? (
                      <span className="text-muted">...</span>
                    ) : (
                      <span className={stats && stats.overdue_tasks > 0 ? 'text-danger' : 'text-success'}>
                        {stats?.overdue_tasks || 0}
                      </span>
                    )}
                  </h3>
                  <p className="text-muted fs-12 mb-0">
                    {stats && stats.total_completed_today > 0 && (
                      <span className="text-success">+{stats.total_completed_today} completed today</span>
                    )}
                  </p>
                </div>
                <div className="ms-2">
                  <span className="avatar avatar-md bg-danger svg-white">
                    <i className="ri-alarm-warning-line fs-20"></i>
                  </span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Action Buttons */}
      <Row className="mb-4">
        <Col xl={12}>
          <div className="d-flex gap-2">
            <Button
              variant="primary"
              onClick={() => router.push('/labs/engineering-task/daily')}
            >
              <i className="ri-checkbox-circle-line me-1"></i>
              Daily Log
            </Button>
            <Button
              variant="info"
              onClick={() => router.push('/labs/engineering-task/planning')}
            >
              <i className="ri-layout-grid-line me-1"></i>
              Planning Board
            </Button>
            <Button
              variant="success"
              onClick={() => router.push('/labs/engineering-task/reports')}
            >
              <i className="ri-file-chart-line me-1"></i>
              Reports
            </Button>
          </div>
        </Col>
      </Row>

      {/* Weekly Progress Chart */}
      <Row className="mb-4">
        <Col xl={12}>
          <Card className="custom-card">
            <Card.Header>
              <div className="card-title">Weekly Progress (Last 12 Weeks)</div>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <p className="text-center text-muted">Loading chart data...</p>
              ) : weeklyProgress.length === 0 ? (
                <p className="text-center text-muted">No weekly task data available</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead className="table-light">
                      <tr>
                        <th>Week Starting</th>
                        <th>Total Tasks</th>
                        <th>Completed</th>
                        <th>Completion Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {weeklyProgress.map((week, idx) => (
                        <tr key={idx}>
                          <td>
                            {new Date(week.week_start).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </td>
                          <td>{week.total_tasks}</td>
                          <td>{week.completed_tasks}</td>
                          <td>
                            <div className="progress" style={{ height: '20px' }}>
                              <div
                                className={`progress-bar ${Number(week.completion_rate) >= 80
                                    ? 'bg-success'
                                    : Number(week.completion_rate) >= 50
                                      ? 'bg-warning'
                                      : 'bg-danger'
                                  }`}
                                style={{ width: `${week.completion_rate}%` }}
                              >
                                {Number(week.completion_rate).toFixed(0)}%
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Monthly Calendar */}
      <Row>
        <Col xl={12}>
          <Card className="custom-card">
            <Card.Header>
              <div className="card-title">
                Monthly Task Calendar - {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
              </div>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <p className="text-center text-muted">Loading calendar...</p>
              ) : calendarData.length === 0 ? (
                <p className="text-center text-muted">No tasks scheduled this month</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead className="table-light">
                      <tr>
                        <th>Date</th>
                        <th>Total Tasks</th>
                        <th>🟢 Completed</th>
                        <th>🟡 Pending</th>
                        <th>🔴 Overdue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calendarData.map((day, idx) => (
                        <tr key={idx}>
                          <td>
                            {new Date(day.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </td>
                          <td>{day.task_count}</td>
                          <td className="text-success">{day.completed_count}</td>
                          <td className="text-warning">{day.pending_count}</td>
                          <td className="text-danger">{day.overdue_count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Fragment>
  )
}

export default EngineeringTaskDashboard
