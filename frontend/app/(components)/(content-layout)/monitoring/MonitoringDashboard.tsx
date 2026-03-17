"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { Col, Row } from 'react-bootstrap';
import MetricCard from './components/MetricCard';
import VoltageChart from './components/VoltageChart';
import RadialGauge from './components/RadialGauge';
import EventLog from './components/EventLog';
import ControlPanel from './components/ControlPanel';
import {
    generateElectricalData,
    generateSparklineData,
    generateRandomEvent,
    generateHistoricalData,
    ElectricalData,
    MonitoringEvent,
} from './utils/mockDataGenerator';
import { exportToCSV, detectVoltageAnomaly } from './utils/csvExporter';

interface MonitoringDashboardProps { }

const MonitoringDashboard: React.FC<MonitoringDashboardProps> = () => {
    // State management
    const [isLive, setIsLive] = useState<boolean>(true);
    const [refreshRate, setRefreshRate] = useState<number>(1000);
    const [currentData, setCurrentData] = useState<ElectricalData>(generateElectricalData());
    const [chartData, setChartData] = useState<any[]>([]);
    const [events, setEvents] = useState<MonitoringEvent[]>([]);
    const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
        start: null,
        end: null,
    });

    // Sparkline data for metric cards
    const [voltageSparkline, setVoltageSparkline] = useState<number[]>(generateSparklineData(60));
    const [currentSparkline, setCurrentSparkline] = useState<number[]>(generateSparklineData(60));
    const [powerSparkline, setPowerSparkline] = useState<number[]>(generateSparklineData(60));

    // Update data in live mode
    useEffect(() => {
        if (!isLive) return;

        const interval = setInterval(() => {
            const newData = generateElectricalData();
            setCurrentData(newData);

            // Update chart data (keep last 60 points)
            setChartData((prev) => {
                const updated = [
                    ...prev,
                    {
                        timestamp: new Date(newData.timestamp).toLocaleTimeString(),
                        l1: newData.voltage.l1,
                        l2: newData.voltage.l2,
                        l3: newData.voltage.l3,
                    },
                ];
                return updated.slice(-60);
            });

            // Update sparklines
            const avgVoltage = (newData.voltage.l1 + newData.voltage.l2 + newData.voltage.l3) / 3;
            setVoltageSparkline((prev) => [...prev.slice(-59), avgVoltage]);
            setCurrentSparkline((prev) => [...prev.slice(-59), newData.current]);
            setPowerSparkline((prev) => [...prev.slice(-59), newData.activePower]);

            // Generate random events
            const newEvent = generateRandomEvent();
            if (newEvent) {
                setEvents((prev) => [...prev, newEvent]);
            }

            // Check for voltage anomalies
            const anomaly = detectVoltageAnomaly(newData.voltage);
            if (anomaly) {
                setEvents((prev) => [
                    ...prev,
                    {
                        id: `evt_${Date.now()}_anomaly`,
                        timestamp: new Date(),
                        type: 'warning',
                        message: anomaly,
                    },
                ]);
            }
        }, refreshRate);

        return () => clearInterval(interval);
    }, [isLive, refreshRate]);

    // Toggle live/pause
    const handleToggleLive = useCallback(() => {
        setIsLive((prev) => !prev);
    }, []);

    // Handle CSV export
    const handleExportCSV = useCallback(() => {
        if (dateRange.start && dateRange.end) {
            // Export historical data
            const historicalData = generateHistoricalData(dateRange.start, dateRange.end, 1);
            exportToCSV(historicalData, { filename: 'monitoring_historical_data' });
        } else {
            // Export chart data
            const exportData: ElectricalData[] = chartData.map((point, idx) => ({
                timestamp: new Date(Date.now() - (chartData.length - idx - 1) * refreshRate),
                voltage: {
                    l1: point.l1,
                    l2: point.l2,
                    l3: point.l3,
                },
                current: currentData.current,
                activePower: currentData.activePower,
                powerFactor: currentData.powerFactor,
                frequency: currentData.frequency,
            }));
            exportToCSV(exportData, { filename: 'monitoring_live_data' });
        }
    }, [chartData, currentData, dateRange, refreshRate]);

    // Handle date range change
    const handleDateRangeChange = useCallback((start: Date | null, end: Date | null) => {
        setDateRange({ start, end });

        // If both dates are selected, load historical data
        if (start && end) {
            const historicalData = generateHistoricalData(start, end, 1);
            const formattedData = historicalData.map((point) => ({
                timestamp: new Date(point.timestamp).toLocaleTimeString(),
                l1: point.voltage.l1,
                l2: point.voltage.l2,
                l3: point.voltage.l3,
            }));
            setChartData(formattedData);
        }
    }, []);

    // Calculate average voltage
    const avgVoltage =
        (currentData.voltage.l1 + currentData.voltage.l2 + currentData.voltage.l3) / 3;

    return (
        <>
            {/* Control Panel */}
            <ControlPanel
                isLive={isLive}
                onToggleLive={handleToggleLive}
                onExportCSV={handleExportCSV}
                dateRange={dateRange}
                onDateRangeChange={handleDateRangeChange}
                refreshRate={refreshRate}
                onRefreshRateChange={setRefreshRate}
            />

            <Row>
                {/* Main Content - 9 columns */}
                <Col xxl={9} xl={8}>
                    {/* Top Row - Bento Box Metric Cards */}
                    <Row className="mb-4">
                        <Col xxl={4} xl={6} lg={6} md={6} className="mb-3">
                            <MetricCard
                                title="Voltage L1"
                                value={currentData.voltage.l1}
                                unit="V"
                                sparklineData={voltageSparkline}
                                trend="neutral"
                                color="#ef4444"
                                icon="bi-lightning-charge"
                            />
                        </Col>
                        <Col xxl={4} xl={6} lg={6} md={6} className="mb-3">
                            <MetricCard
                                title="Voltage L2"
                                value={currentData.voltage.l2}
                                unit="V"
                                sparklineData={voltageSparkline}
                                trend="neutral"
                                color="#eab308"
                                icon="bi-lightning-charge"
                            />
                        </Col>
                        <Col xxl={4} xl={6} lg={6} md={6} className="mb-3">
                            <MetricCard
                                title="Voltage L3"
                                value={currentData.voltage.l3}
                                unit="V"
                                sparklineData={voltageSparkline}
                                trend="neutral"
                                color="#3b82f6"
                                icon="bi-lightning-charge"
                            />
                        </Col>
                        <Col xxl={6} xl={6} lg={6} md={6} className="mb-3">
                            <MetricCard
                                title="Current"
                                value={currentData.current}
                                unit="A"
                                sparklineData={currentSparkline}
                                trend="neutral"
                                color="#8b5cf6"
                                icon="bi-activity"
                            />
                        </Col>
                        <Col xxl={6} xl={6} lg={6} md={6} className="mb-3">
                            <MetricCard
                                title="Active Power"
                                value={currentData.activePower}
                                unit="kW"
                                sparklineData={powerSparkline}
                                trend="neutral"
                                color="#10b981"
                                icon="bi-plug"
                            />
                        </Col>
                    </Row>

                    {/* Main Chart */}
                    <Row>
                        <Col xl={12}>
                            <VoltageChart data={chartData} isLive={isLive} />
                        </Col>
                    </Row>

                    {/* Gauges Row */}
                    <Row className="mt-4">
                        <Col xxl={6} xl={6} className="mb-3">
                            <RadialGauge
                                value={currentData.powerFactor}
                                min={0}
                                max={1}
                                label="Power Factor"
                                unit="cos φ"
                                icon="bi-speedometer2"
                                thresholds={{
                                    good: [0.85, 0.95],
                                    warning: [0.75, 0.85],
                                    critical: [0, 0.75],
                                }}
                            />
                        </Col>
                        <Col xxl={6} xl={6} className="mb-3">
                            <RadialGauge
                                value={currentData.frequency}
                                min={45}
                                max={55}
                                label="Frequency"
                                unit="Hz"
                                icon="bi-graph-up"
                                thresholds={{
                                    good: [49.5, 50.5],
                                    warning: [49, 51],
                                    critical: [45, 55],
                                }}
                            />
                        </Col>
                    </Row>
                </Col>

                {/* Sidebar - Event Log - 3 columns */}
                <Col xxl={3} xl={4}>
                    <EventLog events={events} maxEvents={100} />
                </Col>
            </Row>
        </>
    );
};

export default MonitoringDashboard;
