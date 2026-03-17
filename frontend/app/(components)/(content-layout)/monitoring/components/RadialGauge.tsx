"use client"

import React from 'react';
import { Card } from 'react-bootstrap';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface RadialGaugeProps {
    value: number;
    min: number;
    max: number;
    label: string;
    unit: string;
    icon?: string;
    thresholds?: {
        good: [number, number];
        warning: [number, number];
        critical: [number, number];
    };
}

const RadialGauge: React.FC<RadialGaugeProps> = ({
    value,
    min,
    max,
    label,
    unit,
    icon,
    thresholds,
}) => {
    // Calculate percentage for gauge
    const percentage = ((value - min) / (max - min)) * 100;

    // Determine color based on thresholds
    const getColor = (): string => {
        if (!thresholds) return '#10b981';

        const [goodMin, goodMax] = thresholds.good;
        const [warnMin, warnMax] = thresholds.warning;

        if (value >= goodMin && value <= goodMax) return '#10b981'; // Green
        if (value >= warnMin && value <= warnMax) return '#f59e0b'; // Amber
        return '#ef4444'; // Red
    };

    const color = getColor();

    // Data for the gauge (filled portion and empty portion)
    const data = [
        { name: 'filled', value: percentage },
        { name: 'empty', value: 100 - percentage },
    ];

    const COLORS = [color, 'rgba(255, 255, 255, 0.1)'];

    return (
        <Card className="custom-card text-center">
            <Card.Body className="p-4">
                {icon && (
                    <div className="mb-3">
                        <i className={`${icon} fs-24`} style={{ color }}></i>
                    </div>
                )}

                <h6 className="text-muted mb-4 text-uppercase fw-semibold fs-13">{label}</h6>

                {/* Radial Gauge */}
                <div className="position-relative" style={{ height: '200px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                startAngle={180}
                                endAngle={0}
                                innerRadius="70%"
                                outerRadius="90%"
                                dataKey="value"
                                stroke="none"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>

                    {/* Center value */}
                    <div
                        className="position-absolute top-50 start-50 translate-middle"
                        style={{ marginTop: '20px' }}
                    >
                        <h2 className="mb-0 fw-bold" style={{ color, fontSize: '2.5rem' }}>
                            {value.toFixed(2)}
                        </h2>
                        <p className="text-muted mb-0 fs-14">{unit}</p>
                    </div>
                </div>

                {/* Range indicator */}
                <div className="mt-4 d-flex justify-content-between fs-11 text-muted">
                    <span>{min.toFixed(1)}</span>
                    <span>{max.toFixed(1)}</span>
                </div>

                {/* Status indicator */}
                <div className="mt-3">
                    <span
                        className="badge px-3 py-2"
                        style={{
                            backgroundColor: `${color}20`,
                            color: color,
                            fontSize: '0.75rem',
                        }}
                    >
                        {percentage >= 40 && percentage <= 60
                            ? 'OPTIMAL'
                            : percentage > 60 && percentage < 80
                                ? 'GOOD'
                                : percentage >= 80
                                    ? 'WARNING'
                                    : 'LOW'}
                    </span>
                </div>
            </Card.Body>
        </Card>
    );
};

export default RadialGauge;
