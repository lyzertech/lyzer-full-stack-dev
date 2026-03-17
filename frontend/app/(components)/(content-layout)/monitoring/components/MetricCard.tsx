"use client"

import React from 'react';
import { Card } from 'react-bootstrap';
import { Line, LineChart, ResponsiveContainer } from 'recharts';

interface MetricCardProps {
    title: string;
    value: string | number;
    unit: string;
    sparklineData: number[];
    trend?: 'up' | 'down' | 'neutral';
    color?: string;
    icon?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
    title,
    value,
    unit,
    sparklineData,
    trend = 'neutral',
    color = '#10b981',
    icon,
}) => {
    // Format numeric values
    const displayValue = typeof value === 'number' ? value.toFixed(2) : value;

    // Prepare sparkline data for Recharts
    const chartData = sparklineData.map((val, idx) => ({ value: val, index: idx }));

    // Trend icon
    const getTrendIcon = () => {
        if (trend === 'up') return '↑';
        if (trend === 'down') return '↓';
        return '→';
    };

    const getTrendColor = () => {
        if (trend === 'up') return 'text-success';
        if (trend === 'down') return 'text-danger';
        return 'text-muted';
    };

    return (
        <Card className="custom-card overflow-hidden" style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            transition: 'all 0.3s ease',
        }}>
            <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="flex-grow-1">
                        <p className="text-muted mb-1 fs-13 fw-semibold text-uppercase">{title}</p>
                        <div className="d-flex align-items-baseline">
                            <h3 className="mb-0 fw-bold" style={{ fontSize: '2rem', color: color }}>
                                {displayValue}
                            </h3>
                            <span className="ms-2 text-muted fs-14">{unit}</span>
                        </div>
                    </div>
                    {icon && (
                        <div className="avatar avatar-md br-5" style={{
                            background: `linear-gradient(135deg, ${color}20, ${color}40)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <i className={`${icon} fs-20`} style={{ color }}></i>
                        </div>
                    )}
                </div>

                {/* Sparkline */}
                <div className="mb-2" style={{ height: '50px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke={color}
                                strokeWidth={2}
                                dot={false}
                                animationDuration={300}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Trend indicator */}
                <div className="d-flex justify-content-between align-items-center">
                    <span className={`fs-12 fw-semibold ${getTrendColor()}`}>
                        {getTrendIcon()} {trend === 'neutral' ? 'Stable' : trend === 'up' ? 'Increasing' : 'Decreasing'}
                    </span>
                    <span className="text-muted fs-11">Last 60s</span>
                </div>
            </Card.Body>
        </Card>
    );
};

export default MetricCard;
