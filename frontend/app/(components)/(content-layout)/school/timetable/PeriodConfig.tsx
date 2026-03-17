import React from 'react'
import { Button, Card, Table } from 'react-bootstrap'
import type { PeriodDef } from './timetableTypes'

interface PeriodConfigProps {
  periods: PeriodDef[]
  onAddPeriod: () => void
  onRemovePeriod: (id: string) => void
}

const PeriodConfig: React.FC<PeriodConfigProps> = ({
  periods,
  onAddPeriod,
  onRemovePeriod,
}) => {
  return (
    <Card className="custom-card">
      <Card.Header className="justify-content-between">
        <div className="card-title">Periods Per Day</div>
        <Button size="sm" variant="primary" onClick={onAddPeriod}>
          + Add Period
        </Button>
      </Card.Header>
      <Card.Body className="p-0">
        <div className="table-responsive">
          <Table className="table mb-0">
            <thead>
              <tr>
                <th>Label</th>
                <th>Time</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {periods.map((p) => (
                <tr key={p.id}>
                  <td>{p.label}</td>
                  <td>{p.time}</td>
                  <td className="text-end">
                    {periods.length > 1 && (
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => onRemovePeriod(p.id)}
                      >
                        Remove
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  )
}

export default PeriodConfig


