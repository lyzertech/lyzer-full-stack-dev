"use client"

import React, { useEffect, useRef } from 'react';
import { Card } from 'react-bootstrap';
import { MonitoringEvent } from '../utils/mockDataGenerator';

interface EventLogProps {
    events: MonitoringEvent[];
    maxEvents?: number;
}

const EventLog: React.FC<EventLogProps> = ({ events, maxEvents = 50 }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    // Get icon based on event type
    const getEventIcon = (type: string): string => {
        switch (type) {
            case 'error':
                return 'bi-exclamation-circle-fill text-danger';
            case 'warning':
                return 'bi-exclamation-triangle-fill text-warning';
            case 'info':
            default:
                return 'bi-info-circle-fill text-info';
        }
    };

    // Get background color based on event type
    const getEventBgColor = (type: string): string => {
        switch (type) {
            case 'error':
                return 'rgba(239, 68, 68, 0.1)';
            case 'warning':
                return 'rgba(245, 158, 11, 0.1)';
            case 'info':
            default:
                return 'rgba(59, 130, 246, 0.1)';
        }
    };

    // Format timestamp
    const formatTime = (date: Date): string => {
        return new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        }).format(date);
    };

    // Get limited events and reverse order (newest first)
    const displayEvents = events.slice(-maxEvents).reverse();

    return (
        <Card className="custom-card h-100">
            <Card.Header className="d-flex justify-content-between align-items-center">
                <div className="card-title mb-0">
                    <i className="bi bi-clock-history me-2 text-warning"></i>
                    Event Log
                </div>
                <span className="badge bg-secondary-transparent">{displayEvents.length}</span>
            </Card.Header>
            <Card.Body className="p-0">
                <div
                    ref={containerRef}
                    className="event-log-container"
                    style={{
                        height: '600px',
                        overflowY: 'auto',
                        overflowX: 'hidden',
                    }}
                >
                    {displayEvents.length === 0 ? (
                        <div className="text-center text-muted p-4">
                            <i className="bi bi-inbox fs-40 d-block mb-3 opacity-50"></i>
                            <p className="mb-0">No events to display</p>
                        </div>
                    ) : (
                        <div className="list-group list-group-flush">
                            {displayEvents.map((event) => (
                                <div
                                    key={event.id}
                                    className="list-group-item border-0 py-3 px-4"
                                    style={{
                                        backgroundColor: getEventBgColor(event.type),
                                        borderLeft: `3px solid ${event.type === 'error'
                                            ? '#ef4444'
                                            : event.type === 'warning'
                                                ? '#f59e0b'
                                                : '#3b82f6'
                                            }`,
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    <div className="d-flex align-items-start">
                                        <div className="me-3 mt-1">
                                            <i className={`${getEventIcon(event.type)} fs-18`}></i>
                                        </div>
                                        <div className="flex-grow-1">
                                            <p className="mb-1 fw-semibold fs-13">{event.message}</p>
                                            <p className="mb-0 text-muted fs-11">
                                                <i className="bi bi-clock me-1"></i>
                                                {formatTime(event.timestamp)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Card.Body>

            <style jsx>{`
        .event-log-container::-webkit-scrollbar {
          width: 6px;
        }
        .event-log-container::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        .event-log-container::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        .event-log-container::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        .list-group-item:hover {
          transform: translateX(2px);
        }
      `}</style>
        </Card>
    );
};

export default EventLog;
