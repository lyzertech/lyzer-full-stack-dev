'use client'

import React, { useEffect, useState } from 'react'
import { Modal, Button } from 'react-bootstrap'
import QRCode from 'qrcode'

interface Props {
  show: boolean
  onHide: () => void
  student: any
  onRefreshed?: () => void
}

const StudentIDCard: React.FC<Props> = ({
  show,
  onHide,
  student,
  onRefreshed,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!student) return
    // Use stored qr_hash if available, otherwise use nis
    const payload = student.qr_hash
      ? `student:${student.id}|${student.qr_hash}`
      : `student:${student.id}|${student.nis}`
    QRCode.toDataURL(payload, { margin: 1, scale: 7 })
      .then((url: any) => setQrDataUrl(url))
      .catch((err: any) => {
        console.error('Failed to generate QR', err)
        setQrDataUrl(null)
      })
  }, [student])

  const refreshQr = async () => {
    if (!student?.id) return
    setLoading(true)
    try {
      const res = await fetch(
        `/api/school/students/refresh-qr?id=${student.id}`,
        { method: 'POST' }
      )
      const json = await res.json()
      if (res.ok && json.qr_hash) {
        const payload = `student:${student.id}|${json.qr_hash}`
        const url = await QRCode.toDataURL(payload, { margin: 1, scale: 7 })
        setQrDataUrl(url)
        if (onRefreshed) onRefreshed()
      } else {
        alert('Failed to refresh QR')
      }
    } catch (err) {
      console.error(err)
      alert('Failed to refresh QR')
    } finally {
      setLoading(false)
    }
  }

  // fetch school settings for header name
  const [schoolName, setSchoolName] = useState('School Name')

  const [gradeName, setGradeName] = useState<string | null>(null)
  const [roomName, setRoomName] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    fetch('/api/school/settings', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return
        setSchoolName(data?.school_name || data?.short_name || 'School Name')
      })
      .catch((e) => {
        console.error('Failed to load school settings', e)
      })
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!student) {
      setGradeName(null)
      setRoomName(null)
      return
    }
    let mounted = true
    fetch('/api/school/grades', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return
        const gMap = new Map<number, string>()
        const rMap = new Map<number, string>()
        for (const r of data) {
          if (r.id) gMap.set(r.id, r.name)
          if (r.roomId) rMap.set(r.roomId, r.roomName)
        }
        setGradeName(
          student.grade
            ? gMap.get(student.grade) || String(student.grade)
            : null
        )
        setRoomName(
          student.room ? rMap.get(student.room) || String(student.room) : null
        )
      })
      .catch((e) => console.error('Failed to load grades for student card', e))
    return () => {
      mounted = false
    }
  }, [student])

  const handlePrint = () => {
    const name = (student.name || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
    const nis = student.nis || ''
    const grade = gradeName ?? (student.grade ? String(student.grade) : '-')
    const room = roomName ?? (student.room ? String(student.room) : '-')

    const qrHtml = qrDataUrl
      ? `<img src="${qrDataUrl}" alt="qr" width="100" height="100" />`
      : '<div style="width:100px;height:100px;display:flex;align-items:center;justify-content:center;background:#f1f1f1;border-radius:6px;color:#777">No QR</div>'

    const html = `<!doctype html>
      <html>
        <head>
          <title>Student ID Card - ${name}</title>
          ${document.head.innerHTML}
          <style>
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            .cutting-border { display:inline-block; padding:2px; border:1px dashed #333; margin:0 auto; }
            .id-card-wrapper { box-shadow:none !important; background-color:#fff !important; }
            @media print { .print-actions { display: none !important; } }
          </style>
        </head>
        <body class="p-4 bg-light">
          <div class="print-actions mb-3 d-flex justify-content-between align-items-center">
            <h6 class="mb-0">Student ID Card Preview</h6>
            <div>
              <button class="btn btn-sm btn-primary me-2" onclick="window.print()">Print</button>
              <button class="btn btn-sm btn-outline-secondary" onclick="window.close()">Close</button>
            </div>
          </div>

          <div class="cutting-border" style="max-width:444px; margin:0 auto; display:inline-block; padding:2px; border:1px dashed #333;">
            <div class="id-card-wrapper border rounded-3 p-3 bg-white position-relative overflow-hidden" style="max-width:420px; margin:0 auto;">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <div class="fw-bold text-uppercase small text-muted">${schoolName}</div>
                  <div class="fw-bold">Student Identity Card</div>
                </div>
                <div class="text-end">
                  <span class="badge bg-primary">Student</span>
                </div>
              </div>

              <div class="d-flex justify-content-between align-items-center mb-3">
                <div class="d-flex align-items-center">
                  <div class="me-3">
                    <div class="avatar avatar-xl avatar-rounded border" style="width:80px;height:80px;overflow:hidden;">
                      ${
                        student.avatar
                          ? `<img src="${student.avatar}" width="80" height="80" />`
                          : `<div style="width:80px;height:80px;background:#0d6efd;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700">${(
                              student.name || ''
                            )
                              .charAt(0)
                              .toUpperCase()}</div>`
                      }
                    </div>
                  </div>
                  <div>
                    <div class="fw-bold" style="font-size:1.1rem;">${name}</div>
                    <div class="text-muted" style="font-size:0.85rem;">NIS: <span class="fw-semibold">${nis}</span></div>
                    <div class="text-muted" style="font-size:0.85rem;">Grade: ${grade} — Room: ${room}</div>
                  </div>
                </div>

                <div class="text-center ms-3">
                  ${qrHtml}
                </div>
              </div>

              <div class="mt-3 border-top pt-2 d-flex justify-content-between align-items-center text-muted" style="font-size:0.8rem;">
                <span>Generated by School Information System</span>
                <span>ID: ${student.id}</span>
              </div>
            </div>
          </div>
        </body>
      </html>`

    const w = window.open('', '_blank')
    if (!w) return
    w.document.open()
    w.document.write(html)
    w.document.close()
    w.focus()
  }

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Student ID Card</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div
          className="cutting-border"
          style={{
            maxWidth: 444,
            margin: '0 auto',
            display: 'inline-block',
            padding: 2,
            border: '1px dashed #333',
          }}
        >
          <div
            className="id-card-wrapper border rounded-3 p-3 bg-white position-relative overflow-hidden"
            style={{ maxWidth: 420, margin: '0 auto' }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <div className="fw-bold text-uppercase small text-muted">
                  {schoolName}
                </div>
                <div className="fw-bold">Student Identity Card</div>
              </div>
              <div className="text-end">
                <span className="badge bg-primary">Student</span>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center">
                <div className="me-3">
                  <div
                    className="avatar avatar-xl avatar-rounded border"
                    style={{ width: 80, height: 80, overflow: 'hidden' }}
                  >
                    {student.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={student.avatar}
                        alt={student.name}
                        width={80}
                        height={80}
                      />
                    ) : (
                      <div
                        className="d-flex align-items-center justify-content-center bg-primary text-white fw-bold"
                        style={{ width: 80, height: 80 }}
                      >
                        {student.name
                          ? student.name.charAt(0).toUpperCase()
                          : ''}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="fw-bold" style={{ fontSize: '1.1rem' }}>
                    {student.name}
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                    NIS: <span className="fw-semibold">{student.nis}</span>
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                    Grade:{' '}
                    {gradeName ?? (student.grade ? String(student.grade) : '-')}{' '}
                    — Room:{' '}
                    {roomName ?? (student.room ? String(student.room) : '-')}
                  </div>
                </div>
              </div>

              <div className="text-center ms-3">
                {qrDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrDataUrl}
                    alt="qr"
                    width={100}
                    height={100}
                    style={{ borderRadius: 6 }}
                  />
                ) : (
                  <div
                    style={{
                      width: 100,
                      height: 100,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#f1f1f1',
                      borderRadius: 6,
                      color: '#777',
                    }}
                  >
                    No QR
                  </div>
                )}
              </div>
            </div>

            <div className="mt-3">
              <div className="fw-semibold">Parent / Contact</div>
              <div className="small">{student.parent_name || '-'}</div>
              <div className="small mb-2">{student.parent_phone || '-'}</div>

              <div className="fw-semibold mt-2">Address</div>
              <div className="small text-muted">{student.address || '-'}</div>
            </div>

            <div
              className="mt-3 border-top pt-2 d-flex justify-content-between align-items-center text-muted"
              style={{ fontSize: '0.8rem' }}
            >
              <span>Generated by School Information System</span>
              <span>ID: {student.id}</span>
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={loading}>
          Close
        </Button>
        <Button variant="outline-secondary" onClick={handlePrint}>
          Print
        </Button>
        <Button variant="primary" onClick={refreshQr} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh QR'}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default StudentIDCard
