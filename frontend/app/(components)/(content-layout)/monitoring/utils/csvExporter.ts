import { ElectricalData } from './mockDataGenerator';

export interface CSVExportOptions {
    filename?: string;
    includeTimestamp?: boolean;
}

export const exportToCSV = (
    data: ElectricalData[],
    options: CSVExportOptions = {}
): void => {
    const {
        filename = 'monitoring_data',
        includeTimestamp = true,
    } = options;

    // Create CSV header
    const headers = [
        'Timestamp',
        'Voltage L1 (V)',
        'Voltage L2 (V)',
        'Voltage L3 (V)',
        'Current (A)',
        'Active Power (kW)',
        'Power Factor',
        'Frequency (Hz)',
    ];

    // Create CSV rows
    const rows = data.map((item) => [
        item.timestamp.toISOString(),
        item.voltage.l1.toFixed(2),
        item.voltage.l2.toFixed(2),
        item.voltage.l3.toFixed(2),
        item.current.toFixed(2),
        item.activePower.toFixed(2),
        item.powerFactor.toFixed(3),
        item.frequency.toFixed(2),
    ]);

    // Combine headers and rows
    const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.join(',')),
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        const timestamp = includeTimestamp
            ? `_${new Date().toISOString().replace(/[:.]/g, '-')}`
            : '';

        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}${timestamp}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
};

// Format number with units
export const formatValue = (value: number, unit: string, decimals: number = 2): string => {
    return `${value.toFixed(decimals)} ${unit}`;
};

// Calculate average from array
export const calculateAverage = (values: number[]): number => {
    if (values.length === 0) return 0;
    const sum = values.reduce((acc, val) => acc + val, 0);
    return sum / values.length;
};

// Detect anomalies in voltage readings
export const detectVoltageAnomaly = (voltage: { l1: number; l2: number; l3: number }): string | null => {
    const nominal = 230;
    const tolerance = 0.1; // 10%
    const min = nominal * (1 - tolerance);
    const max = nominal * (1 + tolerance);

    const phases = [
        { name: 'L1', value: voltage.l1 },
        { name: 'L2', value: voltage.l2 },
        { name: 'L3', value: voltage.l3 },
    ];

    for (const phase of phases) {
        if (phase.value < min) return `${phase.name} voltage too low: ${phase.value.toFixed(1)}V`;
        if (phase.value > max) return `${phase.name} voltage too high: ${phase.value.toFixed(1)}V`;
    }

    // Check phase imbalance
    const avg = (voltage.l1 + voltage.l2 + voltage.l3) / 3;
    const maxDeviation = Math.max(
        Math.abs(voltage.l1 - avg),
        Math.abs(voltage.l2 - avg),
        Math.abs(voltage.l3 - avg)
    );
    const imbalance = (maxDeviation / avg) * 100;

    if (imbalance > 5) return `Phase imbalance detected: ${imbalance.toFixed(1)}%`;

    return null;
};
