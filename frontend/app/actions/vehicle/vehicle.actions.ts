'use server'

import { createLaravelModuleFetch } from '@/lib/laravel-server-fetch'

export const vehicleFetch = createLaravelModuleFetch('vehicle')

// ─── Types ───────────────────────────────────────────────────────────────────

export interface VehicleDashboardData {
  vehicleSummary: {
    total_vehicles: number
    active_vehicles: number
    under_maintenance: number
    breakdown: number
    retired: number
  }
  reminderSummary: {
    upcoming: number
    due_today: number
    overdue: number
  }
  monthlyCost: {
    maintenance_cost: number
    fuel_cost: number
    sparepart_cost: number
    total_cost: number
  }
  lowStockCount: number
  workOrderSummary: {
    total: number
    in_progress: number
    pending: number
    completed_this_month: number
  }
  recentWorkOrders: any[]
  upcomingReminders: any[]
  monthlyCostTrend: any[]
  lowStockItems: any[]
  vehicleStatusChart: any[]
  expiringDocuments: any[]
}

export interface Vehicle {
  id: number
  vehicle_code: string
  plate_number?: string
  brand?: string
  model?: string
  year?: number
  vin_number?: string
  engine_number?: string
  vehicle_type_id?: number
  fuel_type?: string
  transmission?: string
  odometer: number
  odometer_unit: string
  purchase_date?: string
  insurance_expiry?: string
  registration_expiry?: string
  assigned_driver_id?: number
  photo_url?: string
  status: 'Active' | 'Maintenance' | 'Breakdown' | 'Retired'
  location?: string
  department?: string
  notes?: string
  vehicle_type?: { id: number; name: string; category?: string }
  driver?: { id: number; name: string; phone?: string }
}

export interface WorkOrder {
  id: number
  work_order_number: string
  vehicle_id: number
  vendor_id?: number
  service_date: string
  completion_date?: string
  odometer_in?: number
  odometer_out?: number
  service_type?: string
  complaint?: string
  diagnosis?: string
  action_taken?: string
  labor_cost: number
  sparepart_cost: number
  other_cost: number
  total_cost: number
  status: 'Draft' | 'Pending' | 'In Progress' | 'Completed' | 'Cancelled'
  notes?: string
  vehicle?: Vehicle
  vendor?: { id: number; workshop_name: string }
  items?: WorkOrderItem[]
}

export interface WorkOrderItem {
  id: number
  work_order_id: number
  sparepart_id?: number
  item_name: string
  item_type: string
  quantity: number
  unit: string
  unit_price: number
  total_price: number
  notes?: string
}

export interface Sparepart {
  id: number
  sparepart_code: string
  name: string
  category?: string
  brand?: string
  unit: string
  stock_quantity: number
  minimum_stock: number
  unit_price: number
  supplier?: string
  replacement_interval_km?: number
  replacement_interval_days?: number
  is_active: boolean
}

export interface Driver {
  id: number
  employee_code?: string
  name: string
  phone?: string
  email?: string
  license_number?: string
  license_type?: string
  license_expiry?: string
  status: 'Active' | 'Inactive' | 'On Leave'
  notes?: string
}

export interface Vendor {
  id: number
  vendor_code?: string
  workshop_name: string
  contact_person?: string
  phone?: string
  email?: string
  address?: string
  city?: string
  vendor_type?: string
  rating?: number
  is_active: boolean
}

export interface FuelLog {
  id: number
  vehicle_id: number
  driver_id?: number
  fuel_date: string
  odometer: number
  liters: number
  unit_price: number
  total_cost: number
  fuel_type?: string
  fuel_station?: string
  km_per_liter?: number
  vehicle?: Vehicle
  driver?: Driver
}

export interface ServiceReminder {
  id: number
  vehicle_id: number
  reminder_type: string
  title: string
  description?: string
  due_odometer?: number
  due_date?: string
  status: 'upcoming' | 'due_today' | 'overdue' | 'completed' | 'dismissed'
  vehicle?: Vehicle
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export async function getVehicleDashboard(): Promise<VehicleDashboardData> {
  try {
    const data = await vehicleFetch('/dashboard')
    return data as VehicleDashboardData
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch vehicle dashboard')
  }
}

// ─── Vehicles ─────────────────────────────────────────────────────────────────

export async function getVehicles(params?: Record<string, any>) {
  const qs = params ? '?' + new URLSearchParams(params as any).toString() : ''
  return vehicleFetch(`/vehicles${qs}`)
}

export async function getVehicle(id: number) {
  return vehicleFetch(`/vehicles/${id}`)
}

export async function createVehicle(data: Partial<Vehicle>) {
  return vehicleFetch('/vehicles', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateVehicle(id: number, data: Partial<Vehicle>) {
  return vehicleFetch(`/vehicles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteVehicle(id: number) {
  return vehicleFetch(`/vehicles/${id}`, { method: 'DELETE' })
}

// ─── Vehicle Types ────────────────────────────────────────────────────────────

export async function getVehicleTypes(params?: Record<string, any>) {
  const qs = params ? '?' + new URLSearchParams(params as any).toString() : ''
  return vehicleFetch(`/vehicle-types${qs}`)
}

export async function createVehicleType(data: any) {
  return vehicleFetch('/vehicle-types', { method: 'POST', body: JSON.stringify(data) })
}

export async function updateVehicleType(id: number, data: any) {
  return vehicleFetch(`/vehicle-types/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function deleteVehicleType(id: number) {
  return vehicleFetch(`/vehicle-types/${id}`, { method: 'DELETE' })
}

// ─── Drivers ─────────────────────────────────────────────────────────────────

export async function getDrivers(params?: Record<string, any>) {
  const qs = params ? '?' + new URLSearchParams(params as any).toString() : ''
  return vehicleFetch(`/drivers${qs}`)
}

export async function createDriver(data: Partial<Driver>) {
  return vehicleFetch('/drivers', { method: 'POST', body: JSON.stringify(data) })
}

export async function updateDriver(id: number, data: Partial<Driver>) {
  return vehicleFetch(`/drivers/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function deleteDriver(id: number) {
  return vehicleFetch(`/drivers/${id}`, { method: 'DELETE' })
}

// ─── Vendors ─────────────────────────────────────────────────────────────────

export async function getVendors(params?: Record<string, any>) {
  const qs = params ? '?' + new URLSearchParams(params as any).toString() : ''
  return vehicleFetch(`/vendors${qs}`)
}

export async function createVendor(data: Partial<Vendor>) {
  return vehicleFetch('/vendors', { method: 'POST', body: JSON.stringify(data) })
}

export async function updateVendor(id: number, data: Partial<Vendor>) {
  return vehicleFetch(`/vendors/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function deleteVendor(id: number) {
  return vehicleFetch(`/vendors/${id}`, { method: 'DELETE' })
}

// ─── Spareparts ───────────────────────────────────────────────────────────────

export async function getSpareparts(params?: Record<string, any>) {
  const qs = params ? '?' + new URLSearchParams(params as any).toString() : ''
  return vehicleFetch(`/spareparts${qs}`)
}

export async function getLowStockSpareparts() {
  return vehicleFetch('/spareparts/low-stock')
}

export async function createSparepart(data: Partial<Sparepart>) {
  return vehicleFetch('/spareparts', { method: 'POST', body: JSON.stringify(data) })
}

export async function updateSparepart(id: number, data: Partial<Sparepart>) {
  return vehicleFetch(`/spareparts/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function deleteSparepart(id: number) {
  return vehicleFetch(`/spareparts/${id}`, { method: 'DELETE' })
}

export async function addSparepartStock(id: number, data: any) {
  return vehicleFetch(`/spareparts/${id}/add-stock`, { method: 'POST', body: JSON.stringify(data) })
}

// ─── Work Orders ──────────────────────────────────────────────────────────────

export async function getWorkOrders(params?: Record<string, any>) {
  const qs = params ? '?' + new URLSearchParams(params as any).toString() : ''
  return vehicleFetch(`/work-orders${qs}`)
}

export async function getWorkOrder(id: number) {
  return vehicleFetch(`/work-orders/${id}`)
}

export async function createWorkOrder(data: any) {
  return vehicleFetch('/work-orders', { method: 'POST', body: JSON.stringify(data) })
}

export async function updateWorkOrder(id: number, data: any) {
  return vehicleFetch(`/work-orders/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function deleteWorkOrder(id: number) {
  return vehicleFetch(`/work-orders/${id}`, { method: 'DELETE' })
}

export async function approveWorkOrder(id: number) {
  return vehicleFetch(`/work-orders/${id}/approve`, { method: 'POST' })
}

// ─── Reminders ────────────────────────────────────────────────────────────────

export async function getReminders(params?: Record<string, any>) {
  const qs = params ? '?' + new URLSearchParams(params as any).toString() : ''
  return vehicleFetch(`/reminders${qs}`)
}

export async function refreshReminders() {
  return vehicleFetch('/reminders/refresh', { method: 'POST' })
}

// ─── Inspections ──────────────────────────────────────────────────────────────

export async function getInspections(params?: Record<string, any>) {
  const qs = params ? '?' + new URLSearchParams(params as any).toString() : ''
  return vehicleFetch(`/inspections${qs}`)
}

export async function createInspection(data: any) {
  return vehicleFetch('/inspections', { method: 'POST', body: JSON.stringify(data) })
}

// ─── Fuel Logs ────────────────────────────────────────────────────────────────

export async function getFuelLogs(params?: Record<string, any>) {
  const qs = params ? '?' + new URLSearchParams(params as any).toString() : ''
  return vehicleFetch(`/fuel-logs${qs}`)
}

export async function createFuelLog(data: any) {
  return vehicleFetch('/fuel-logs', { method: 'POST', body: JSON.stringify(data) })
}

export async function updateFuelLog(id: number, data: any) {
  return vehicleFetch(`/fuel-logs/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function deleteFuelLog(id: number) {
  return vehicleFetch(`/fuel-logs/${id}`, { method: 'DELETE' })
}

export async function getFuelAnalytics(params?: Record<string, any>) {
  const qs = params ? '?' + new URLSearchParams(params as any).toString() : ''
  return vehicleFetch(`/fuel-logs/analytics${qs}`)
}
