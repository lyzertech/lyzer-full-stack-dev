'use client'

import React, { useEffect, useState } from 'react'
import SpkTables from '@/shared/@spk-reusable-components/reusable-tables/spk-tables'
import SpkBadge from '@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-badge'
import Image from 'next/image'

export type Teacher = {
  id: number
  name: string
  degree: string
  email: string
  subject: string
  nip: string
  gender: 'Male' | 'Female'
  status: 'Active' | 'On Leave' | 'Inactive'
  jobType: 'Permanent' | 'Contract'
  joinDate: string
  avatar?: string
}

const JobsTable: React.FC<{ teachers?: Teacher[] }> = ({ teachers }) => {
  const [data, setData] = useState<Teacher[]>(teachers || [])

  const [loading, setLoading] = useState(!teachers)
  const [error, setError] = useState<string | null>(null)
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())

  useEffect(() => {
    // If parent provides teachers, always sync to local state
    if (teachers && teachers.length > 0) {
      setData(teachers)
      setLoading(false)
      setError(null)
      return
    }

    // Otherwise, fetch from API
    const fetchTeachers = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/teachers', {
          method: 'GET',
          cache: 'no-store',
        })

        if (!res.ok) {
          throw new Error(`Request failed: ${res.status}`)
        }

        const json = await res.json()
        if (Array.isArray(json)) {
            setData(json)
        } else {
            console.error('API did not return an array:', json)
            setData([])
            setError(json?.error || json?.message || 'Invalid API response format')
        }
      } catch (err: any) {
        console.error(err)
        setError('Failed to load teachers')
      } finally {
        setLoading(false)
      }
    }

    fetchTeachers()
  }, [teachers])

  const handleOpenDetail = async (teacher: Teacher) => {
    if (typeof window === 'undefined') return

    // fetch school settings for header
    let schoolName = 'School Name'
    try {
      const resS = await fetch('/api/school/settings', { cache: 'no-store' })
      if (resS.ok) {
        const sdata = await resS.json()
        schoolName = sdata?.school_name || sdata?.short_name || schoolName
      }
    } catch (e) {
      console.error('Failed to fetch school settings', e)
    }

    const detailWindow = window.open('', '_blank')
    if (!detailWindow) return

    const safeText = (value: string) =>
      value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

    const name = safeText(teacher.name)
    const degree = safeText(teacher.degree)
    const subject = safeText(teacher.subject)
    const nip = safeText(teacher.nip)
    const email = safeText(teacher.email)
    const gender = safeText(teacher.gender)
    const status = safeText(teacher.status)

    const avatarHtml =
      teacher.avatar && !imageErrors.has(teacher.id)
        ? `<img src="${teacher.avatar}" alt="${name}" width="80" height="80" class="rounded w-100 h-100" />`
        : `<div class="w-100 h-100 d-flex align-items-center justify-content-center bg-primary text-white fw-bold rounded">
            ${name.charAt(0).toUpperCase()}
          </div>`

    const statusBadgeClass =
      teacher.status === 'Active'
        ? 'bg-success'
        : teacher.status === 'On Leave'
        ? 'bg-warning'
        : 'bg-danger'

    // QR image URL (uses external qr server). Encodes NIP value.
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
      teacher.nip || ''
    )}`

    detailWindow.document.open()
    detailWindow.document.write(`<!doctype html>
      <html>
        <head>
          <title>Teacher ID Card - ${name}</title>
          ${document.head.innerHTML}
          <style>
            /* Ensure colors print exactly */
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }

            /* Cutting border wrapper */
            .cutting-border {
              display: inline-block;
              padding: 2px;
              border: 1px dashed #333;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              margin: 0 auto;
            }

            /* Keep id card background and remove shadow when printing */
            .id-card-wrapper {
              box-shadow: none !important;
              background-color: #fff !important;
            }

            /* Ensure badges keep background colors on print */
            .badge.bg-primary { background-color: #0d6efd !important; color: #fff !important; }
            .badge.bg-success { background-color: #198754 !important; color: #fff !important; }
            .badge.bg-warning { background-color: #ffc107 !important; color: #212529 !important; }
            .badge.bg-danger  { background-color: #dc3545 !important; color: #fff !important; }

            @media print {
              body {
                margin: 0;
                padding: 0;
              }
              .print-actions {
                display: none !important;
              }
              /* Make sure cutting border and its dash are visible on paper */
              .cutting-border { border-style: dashed !important; border-color: #333 !important; }
            }
          </style>
        </head>
        <body class="p-4 bg-light">
          <div class="print-actions mb-3 d-flex justify-content-between align-items-center">
            <h6 class="mb-0">Teacher ID Card Preview</h6>
            <div>
              <button class="btn btn-sm btn-primary me-2" onclick="window.print()">Print</button>
              <button class="btn btn-sm btn-outline-secondary" onclick="window.close()">Close</button>
            </div>
          </div>

          <div class="cutting-border" style="max-width: 444px; margin: 0 auto; display:inline-block; padding:2px; border:1px dashed #333;">
            <div class="id-card-wrapper border rounded-3 p-3 bg-white position-relative overflow-hidden" style="max-width: 420px; margin: 0 auto;">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div>
                <div class="fw-bold text-uppercase small text-muted">
                  ${schoolName}
                </div>
                <div class="fw-bold">Teacher Identity Card</div>
              </div>
              <div class="text-end">
                <span class="badge bg-primary">Teacher</span>
              </div>
            </div>

            <div class="d-flex justify-content-between align-items-center mb-3">
              <div class="d-flex align-items-center">
                <div class="me-3">
                  <div class="avatar avatar-xl avatar-rounded border" style="width:80px;height:80px;overflow:hidden;">
                    ${avatarHtml}
                  </div>
                </div>
                <div>
                  <div class="fw-bold" style="font-size: 1.2rem;">
                    ${name} <span class="text-muted" style="font-size: 0.9rem;">${degree}</span>
                  </div>
                  <div class="text-muted" style="font-size: 0.8rem; margin-bottom: 0.25rem;">
                    ${subject}
                  </div>
                  <div style="font-size: 0.8rem;">
                    <span class="text-muted">NIP:</span>
                    <span class="fw-semibold">${nip}</span>
                  </div>
                  <div style="font-size: 0.8rem;">
                    <span class="text-muted">Email:</span>
                    ${email}
                  </div>
                </div>
              </div>

              <div class="text-center ms-3">
                <img src="${qrUrl}" alt="QR for ${nip}" width="100" height="100" style="border-radius:6px;" />
              </div>
            </div>

            <div class="text-center mt-3" style="font-size: 0.8rem;">
              <div class="d-inline-block me-5">
                <span class="text-muted d-block">Gender</span>
                <span class="fw-semibold">${gender}</span>
              </div>
              <div class="d-inline-block">
                <span class="text-muted d-block">Status</span>
                <span class="badge rounded-pill px-2 py-1 ${statusBadgeClass}">
                  ${status}
                </span>
              </div>
            </div>

            <div class="mt-3 border-top pt-2 d-flex justify-content-between align-items-center text-muted" style="font-size: 0.7rem;">
              <span>Generated by School Information System</span>
              <span>ID: ${teacher.id}</span>
            </div>
          </div>
          </div>
        </body>
      </html>`)
    detailWindow.document.close()
    detailWindow.focus()
  }

  const formatDate = (date: string) => {
    if (!date) return '-'
    return date.split('T')[0]
  }

  return (
    <>
      <div className="table-responsive">
        <SpkTables
          tableClass="text-nowrap table-striped table-hover"
          header={[
            { title: 'No.' },
            { title: 'Name' },
            { title: 'Degree' },
            { title: 'Subject' },
            { title: 'NIP / Employee Code' },
            { title: 'Gender' },
            { title: 'Status' },
            { title: 'Job Type' },
            { title: 'Join Date' },
            { title: 'Action' },
          ]}
        >
          {loading && !error && (
            <>
              {Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={9}>
                    <div className="placeholder-glow py-2">
                      <span className="placeholder col-2 me-2"></span>
                      <span className="placeholder col-3 me-2"></span>
                      <span className="placeholder col-2 me-2"></span>
                      <span className="placeholder col-2"></span>
                    </div>
                  </td>
                </tr>
              ))}
            </>
          )}

          {!loading &&
            // !error &&
            data.map((t) => (
              <tr key={t.id}>
                {/* No. */}
                <th scope="row">{t.id}</th>

                {/* Name + Email + Avatar */}
                <td>
                  <div className="d-flex align-items-center">
                    <div className="avatar avatar-sm me-2 avatar-rounded">
                      {t.avatar && !imageErrors.has(t.id) ? (
                        <Image
                          src={t.avatar}
                          width={28}
                          height={28}
                          alt={t.name}
                          onError={() => {
                            setImageErrors((prev) => new Set(prev).add(t.id))
                          }}
                        />
                      ) : (
                        <span className="avatar avatar-sm avatar-rounded bg-primary d-flex align-items-center justify-content-center">
                          {t.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="lh-1">
                        <span className="fw-semibold">{t.name}</span>
                      </div>
                      <div className="lh-1">
                        <span className="fs-11 text-muted">{t.email}</span>
                      </div>
                    </div>
                  </div>
                </td>

                {/* Degree */}
                <td>{t.degree}</td>

                {/* Subject */}
                <td>{t.subject}</td>

                {/* NIP / Employee Code */}
                <td>{t.nip}</td>

                {/* Gender */}
                <td>{t.gender}</td>

                {/* Status */}
                <td>
                  <SpkBadge
                    variant={
                      t.status === 'Active'
                        ? 'success'
                        : t.status === 'On Leave'
                        ? 'warning'
                        : 'danger'
                    }
                    Customclass="rounded-pill"
                  >
                    {t.status}
                  </SpkBadge>
                </td>

                {/* Job Type */}
                <td>{t.jobType}</td>

                {/* Join Date */}
                <td>{formatDate(t.joinDate)}</td>

                {/* Action */}
                <td>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => handleOpenDetail(t)}
                    >
                      View
                    </button>
                    <button className="btn btn-sm btn-warning">Edit</button>
                    <button className="btn btn-sm btn-danger">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
        </SpkTables>
      </div>
    </>
  )
}

export default JobsTable
