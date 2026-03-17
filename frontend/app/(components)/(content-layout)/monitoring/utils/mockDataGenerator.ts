// Mock data generator for IIoT electrical measurements
export interface ElectricalData {
    timestamp: Date;
    voltage: {
        l1: number;
        l2: number;
        l3: number;
    };
    current: number;
    activePower: number;
    powerFactor: number;
    frequency: number;
}

export interface MonitoringEvent {
    id: string;
    timestamp: Date;
    type: 'info' | 'warning' | 'error';
    message: string;
}

// Generate realistic three-phase voltage with sine wave variation
export const generateVoltageReading = (baseVoltage = 230): { l1: number; l2: number; l3: number } => {
    const variation = Math.sin(Date.now() / 1000) * 5; // ±5V sine wave
    const randomNoise = () => (Math.random() - 0.5) * 2; // ±1V random noise

    return {
        l1: baseVoltage + variation + randomNoise(),
        l2: baseVoltage + variation + randomNoise(),
        l3: baseVoltage + variation + randomNoise(),
    };
};

// Generate current based on power consumption
export const generateCurrent = (power: number, voltage: number): number => {
    // I = P / (V * √3 * PF) for three-phase
    const powerFactor = 0.85 + Math.random() * 0.1; // 0.85-0.95
    const current = power / (voltage * Math.sqrt(3) * powerFactor);
    return current + (Math.random() - 0.5) * 2; // Add some noise
};

// Generate power factor (typically 0.8-0.95 for industrial loads)
export const generatePowerFactor = (): number => {
    const basePF = 0.88;
    const variation = Math.sin(Date.now() / 5000) * 0.05; // Slow variation
    return Math.max(0.75, Math.min(0.98, basePF + variation + (Math.random() - 0.5) * 0.03));
};

// Generate frequency (nominal 50Hz with small variations)
export const generateFrequency = (): number => {
    const baseFreq = 50;
    const variation = Math.sin(Date.now() / 3000) * 0.2; // ±0.2 Hz
    return baseFreq + variation + (Math.random() - 0.5) * 0.1;
};

// Generate complete electrical data point
export const generateElectricalData = (): ElectricalData => {
    const voltage = generateVoltageReading();
    const avgVoltage = (voltage.l1 + voltage.l2 + voltage.l3) / 3;
    const activePower = 45 + Math.sin(Date.now() / 2000) * 10 + Math.random() * 5; // 40-60 kW
    const current = generateCurrent(activePower * 1000, avgVoltage);

    return {
        timestamp: new Date(),
        voltage,
        current,
        activePower,
        powerFactor: generatePowerFactor(),
        frequency: generateFrequency(),
    };
};

// Generate sparkline data (last N seconds)
export const generateSparklineData = (points: number = 60): number[] => {
    const data: number[] = [];
    for (let i = 0; i < points; i++) {
        const value = 50 + Math.sin(i / 10) * 10 + (Math.random() - 0.5) * 5;
        data.push(value);
    }
    return data;
};

// Event generator for monitoring log
const eventMessages = {
    info: [
        'System operating normally',
        'Data logging active',
        'Monitoring service connected',
        'Routine measurement complete',
    ],
    warning: [
        'Voltage spike detected on L1',
        'Phase imbalance: 3.2%',
        'Power factor below optimal (0.82)',
        'Frequency deviation: 49.7 Hz',
        'Current exceeds 85% threshold',
    ],
    error: [
        'Critical: Voltage out of range on L2',
        'Phase loss detected on L3',
        'Emergency shutdown triggered',
        'Communication error with sensor',
    ],
};

export const generateRandomEvent = (): MonitoringEvent | null => {
    // 5% chance of generating an event
    if (Math.random() > 0.05) return null;

    // Weighted event type selection (info: 60%, warning: 30%, error: 10%)
    let type: 'info' | 'warning' | 'error';
    const rand = Math.random();
    if (rand < 0.6) type = 'info';
    else if (rand < 0.9) type = 'warning';
    else type = 'error';

    const messages = eventMessages[type];
    const message = messages[Math.floor(Math.random() * messages.length)];

    return {
        id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        type,
        message,
    };
};

// Historical data generator
export const generateHistoricalData = (
    startDate: Date,
    endDate: Date,
    intervalMinutes: number = 1
): ElectricalData[] => {
    const data: ElectricalData[] = [];
    let currentTime = new Date(startDate);

    while (currentTime <= endDate) {
        data.push({
            ...generateElectricalData(),
            timestamp: new Date(currentTime),
        });
        currentTime = new Date(currentTime.getTime() + intervalMinutes * 60000);
    }

    return data;
};
