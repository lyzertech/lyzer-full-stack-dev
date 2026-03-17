import React from 'react'
import { Button, Card, Form, InputGroup } from 'react-bootstrap'
import SpkBadge from '@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-badge'

interface GradeRoomConfigProps {
  grades: string[]
  roomsByGrade: Record<string, string[]>
  selectedGrade: string
  selectedRoom: string
  currentRooms: string[]
  onChangeGrade: (grade: string) => void
  onChangeRoom: (room: string) => void
}

const GradeRoomConfig: React.FC<GradeRoomConfigProps> = ({
  grades,
  roomsByGrade,
  selectedGrade,
  selectedRoom,
  currentRooms,
  onChangeGrade,
  onChangeRoom,
}) => {
  return (
    <Card className="custom-card">
      <Card.Header>
        <div className="card-title">Grades & Rooms</div>
      </Card.Header>
      <Card.Body>
        <Form.Group className="mb-3">
          <Form.Label>Grade</Form.Label>
          <InputGroup>
            <Form.Select
              value={selectedGrade}
              onChange={(e) => onChangeGrade(e.target.value)}
            >
              {grades.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </Form.Select>
          </InputGroup>
          <div className="mt-2 d-flex flex-wrap gap-2">
            {grades.map((g) => (
              <SpkBadge
                key={g}
                variant={g === selectedGrade ? 'primary' : 'secondary'}
                Customclass="d-inline-flex align-items-center"
              >
                {g}
              </SpkBadge>
            ))}
          </div>
        </Form.Group>

        <Form.Group>
          <Form.Label>Room ({selectedGrade})</Form.Label>
          <InputGroup>
            <Form.Select
              value={selectedRoom}
              onChange={(e) => onChangeRoom(e.target.value)}
            >
              {currentRooms.map((room) => (
                <option key={room} value={room}>
                  {/* Room  */}
                  {room}
                </option>
              ))}
            </Form.Select>
          </InputGroup>
          <div className="mt-2 d-flex flex-wrap gap-2">
            {currentRooms.map((room) => (
              <SpkBadge
                key={room}
                variant={room === selectedRoom ? 'primary' : 'secondary'}
                Customclass="d-inline-flex align-items-center"
              >
                {/* Room  */}
                {room}
              </SpkBadge>
            ))}
          </div>
        </Form.Group>
      </Card.Body>
    </Card>
  )
}

export default GradeRoomConfig
