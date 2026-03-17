"use client"

import React from 'react';
import { Button, ButtonGroup, Form } from 'react-bootstrap';
import SpkButton from '@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-buttons';
import SpkDatepickr from '@/shared/@spk-reusable-components/reusable-plugins/spk-datepicker';

interface ControlPanelProps {
    isLive: boolean;
    onToggleLive: () => void;
    onExportCSV: () => void;
    dateRange: {
        start: Date | null;
        end: Date | null;
    };
    onDateRangeChange: (start: Date | null, end: Date | null) => void;
    refreshRate?: number;
    onRefreshRateChange?: (rate: number) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
    isLive,
    onToggleLive,
    onExportCSV,
    dateRange,
    onDateRangeChange,
    refreshRate = 1000,
    onRefreshRateChange,
}) => {
    return (
        <div className="mb-4 p-4 rounded" style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
            <div className="row g-3 align-items-center">
                {/* Live/Pause Toggle */}
                <div className="col-auto">
                    <Button
                        variant={isLive ? 'success' : 'secondary'}
                        onClick={onToggleLive}
                        className="btn-wave d-flex align-items-center"
                        style={{
                            minWidth: '120px',
                            transition: 'all 0.3s ease',
                        }}
                    >
                        {isLive ? (
                            <>
                                <span className="pulse-indicator me-2"></span>
                                <i className="bi bi-pause-fill me-2"></i>
                                LIVE
                            </>
                        ) : (
                            <>
                                <i className="bi bi-play-fill me-2"></i>
                                PAUSED
                            </>
                        )}
                    </Button>
                </div>

                {/* Refresh Rate Selector */}
                {onRefreshRateChange && (
                    <div className="col-auto">
                        <Form.Select
                            size="sm"
                            value={refreshRate}
                            onChange={(e) => onRefreshRateChange(Number(e.target.value))}
                            disabled={!isLive}
                            className="form-select"
                            style={{
                                minWidth: '120px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                color: 'inherit',
                            }}
                        >
                            <option value={500}>0.5s refresh</option>
                            <option value={1000}>1s refresh</option>
                            <option value={2000}>2s refresh</option>
                            <option value={5000}>5s refresh</option>
                        </Form.Select>
                    </div>
                )}

                {/* Date Range Picker */}
                <div className="col-auto d-flex align-items-center gap-2">
                    <label className="text-muted mb-0 me-2 fs-13">Historical Data:</label>
                    <div className="custom-picker" style={{ minWidth: '150px' }}>
                        <SpkDatepickr
                            className="form-control form-control-sm"
                            selected={dateRange.start}
                            onChange={(date) => onDateRangeChange(date, dateRange.end)}
                            placeholderText="Start Date"
                            disabled={isLive}
                        />
                    </div>
                    <span className="text-muted">to</span>
                    <div className="custom-picker" style={{ minWidth: '150px' }}>
                        <SpkDatepickr
                            className="form-control form-control-sm"
                            selected={dateRange.end}
                            onChange={(date) => onDateRangeChange(dateRange.start, date)}
                            placeholderText="End Date"
                            disabled={isLive}
                        />
                    </div>
                </div>

                {/* Spacer */}
                <div className="col"></div>

                {/* Export CSV Button */}
                <div className="col-auto">
                    <SpkButton
                        Buttonvariant="primary-light"
                        Customclass="btn-wave d-flex align-items-center"
                        onClick={onExportCSV}
                    >
                        <i className="bi bi-download me-2"></i>
                        Export CSV
                    </SpkButton>
                </div>

                {/* Refresh Button */}
                <div className="col-auto">
                    <Button
                        variant="outline-secondary"
                        size="sm"
                        className="btn-wave"
                        onClick={() => window.location.reload()}
                    >
                        <i className="bi bi-arrow-clockwise"></i>
                    </Button>
                </div>
            </div>

            <style jsx>{`
        .pulse-indicator {
          width: 8px;
          height: 8px;
          background-color: #10b981;
          border-radius: 50%;
          display: inline-block;
          animation: pulse-glow 2s infinite;
        }

        @keyframes pulse-glow {
          0% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
          }
          70% {
            box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
          }
        }

        .form-select:disabled {
          opacity: 0.5;
        }
      `}</style>
        </div>
    );
};

export default ControlPanel;
