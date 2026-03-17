"use client"

import React from 'react';
import { Card } from 'react-bootstrap';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

interface VoltageDataPoint {
    timestamp: string;
    l1: number;
    l2: number;
    l3: number;
}

interface VoltageChartProps {
    data: VoltageDataPoint[];
    isLive?: boolean;
}

const VoltageChart: React.FC<VoltageChartProps> = ({ data, isLive = true }) => {
    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div
                    className="custom-tooltip p-3 rounded"
                    style={{
                        background: 'rgba(0, 0, 0, 0.85)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                >
                    <p className="text-white mb-2 fw-semibold fs-12">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} className="mb-1 fs-11" style={{ color: entry.color }}>
                            {entry.name}: {entry.value.toFixed(2)} V
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <Card className="custom-card">
            <Card.Header className="d-flex justify-content-between align-items-center">
                <div className="card-title mb-0">
                    <i className="bi bi-graph-up me-2 text-primary"></i>
                    Three-Phase Voltage Monitor
                </div>
                {isLive && (
                    <div className="d-flex align-items-center">
                        <span className="badge bg-success-transparent d-flex align-items-center">
                            <span className="pulse-dot me-2"></span>
                            LIVE
                        </span>
                    </div>
                )}
            </Card.Header>
            <Card.Body>
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart
                        data={data}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis
                            dataKey="timestamp"
                            stroke="rgba(255,255,255,0.5)"
                            tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }}
                        />
                        <YAxis
                            stroke="rgba(255,255,255,0.5)"
                            tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }}
                            domain={[200, 250]}
                            label={{ value: 'Voltage (V)', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.7)' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            wrapperStyle={{ paddingTop: '10px' }}
                            iconType="line"
                        />
                        <Line
                            type="monotone"
                            dataKey="l1"
                            stroke="#ef4444"
                            strokeWidth={2}
                            name="L1 (Red)"
                            dot={false}
                            animationDuration={300}
                        />
                        <Line
                            type="monotone"
                            dataKey="l2"
                            stroke="#eab308"
                            strokeWidth={2}
                            name="L2 (Yellow)"
                            dot={false}
                            animationDuration={300}
                        />
                        <Line
                            type="monotone"
                            dataKey="l3"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            name="L3 (Blue)"
                            dot={false}
                            animationDuration={300}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </Card.Body>

            <style jsx>{`
        .pulse-dot {
          width: 8px;
          height: 8px;
          background-color: #10b981;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
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
      `}</style>
        </Card>
    );
};

export default VoltageChart;
