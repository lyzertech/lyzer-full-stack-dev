<?php

namespace App\Modules\Vehicle\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Vehicle\Models\Vehicle;
use App\Modules\Vehicle\Models\WorkOrder;
use App\Modules\Vehicle\Models\ServiceReminder;
use App\Modules\Vehicle\Models\Sparepart;
use App\Modules\Vehicle\Models\FuelLog;
use App\Modules\Vehicle\Models\CostRecord;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class VehicleDashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $today = Carbon::today();
        $monthStart = Carbon::now()->startOfMonth();
        $monthEnd = Carbon::now()->endOfMonth();

        // ── Vehicle summary ─────────────────────────────────────
        $vehicleSummary = DB::selectOne("
            SELECT
                COUNT(*) as total_vehicles,
                SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active_vehicles,
                SUM(CASE WHEN status = 'Maintenance' THEN 1 ELSE 0 END) as under_maintenance,
                SUM(CASE WHEN status = 'Breakdown' THEN 1 ELSE 0 END) as breakdown,
                SUM(CASE WHEN status = 'Retired' THEN 1 ELSE 0 END) as retired
            FROM vehicles WHERE deleted_at IS NULL
        ");

        // ── Reminder summary ─────────────────────────────────────
        $reminderSummary = DB::selectOne("
            SELECT
                SUM(CASE WHEN status = 'upcoming' THEN 1 ELSE 0 END) as upcoming,
                SUM(CASE WHEN status = 'due_today' THEN 1 ELSE 0 END) as due_today,
                SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) as overdue
            FROM vehicle_service_reminders
        ");

        // ── Monthly cost ──────────────────────────────────────────
        $monthlyCost = DB::selectOne("
            SELECT
                COALESCE(SUM(CASE WHEN cost_type = 'Maintenance' THEN amount ELSE 0 END), 0) as maintenance_cost,
                COALESCE(SUM(CASE WHEN cost_type = 'Fuel' THEN amount ELSE 0 END), 0) as fuel_cost,
                COALESCE(SUM(CASE WHEN cost_type = 'Sparepart' THEN amount ELSE 0 END), 0) as sparepart_cost,
                COALESCE(SUM(amount), 0) as total_cost
            FROM vehicle_cost_records
            WHERE cost_date BETWEEN ? AND ?
        ", [$monthStart->toDateString(), $monthEnd->toDateString()]);

        // ── Low stock spareparts ──────────────────────────────────
        $lowStockCount = DB::selectOne("
            SELECT COUNT(*) as count FROM vehicle_spareparts
            WHERE stock_quantity <= minimum_stock AND is_active = 1 AND deleted_at IS NULL
        ")->count;

        // ── Work order summary ────────────────────────────────────
        $workOrderSummary = DB::selectOne("
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as in_progress,
                SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'Completed' AND completion_date BETWEEN ? AND ? THEN 1 ELSE 0 END) as completed_this_month
            FROM vehicle_work_orders WHERE deleted_at IS NULL
        ", [$monthStart->toDateString(), $monthEnd->toDateString()]);

        // ── Recent work orders ────────────────────────────────────
        $recentWorkOrders = DB::select("
            SELECT
                wo.id, wo.work_order_number, wo.service_date, wo.status,
                wo.total_cost, wo.service_type,
                v.vehicle_code, v.plate_number, v.brand, v.model,
                vv.workshop_name as vendor_name
            FROM vehicle_work_orders wo
            INNER JOIN vehicles v ON wo.vehicle_id = v.id
            LEFT JOIN vehicle_vendors vv ON wo.vendor_id = vv.id
            WHERE wo.deleted_at IS NULL
            ORDER BY wo.service_date DESC, wo.created_at DESC
            LIMIT 8
        ");

        // ── Upcoming reminders ────────────────────────────────────
        $upcomingReminders = DB::select("
            SELECT
                sr.id, sr.title, sr.due_date, sr.due_odometer, sr.status, sr.reminder_type,
                v.vehicle_code, v.plate_number, v.brand, v.model, v.odometer
            FROM vehicle_service_reminders sr
            INNER JOIN vehicles v ON sr.vehicle_id = v.id
            WHERE sr.status IN ('upcoming', 'due_today', 'overdue')
            ORDER BY
                CASE sr.status WHEN 'overdue' THEN 0 WHEN 'due_today' THEN 1 ELSE 2 END,
                sr.due_date ASC
            LIMIT 10
        ");

        // ── Monthly cost trend (last 6 months) ────────────────────
        $monthlyCostTrend = DB::select("
            SELECT
                DATE_FORMAT(cost_date, '%Y-%m') as month,
                SUM(CASE WHEN cost_type = 'Maintenance' THEN amount ELSE 0 END) as maintenance,
                SUM(CASE WHEN cost_type = 'Fuel' THEN amount ELSE 0 END) as fuel,
                SUM(amount) as total
            FROM vehicle_cost_records
            WHERE cost_date >= ?
            GROUP BY DATE_FORMAT(cost_date, '%Y-%m')
            ORDER BY month ASC
        ", [Carbon::now()->subMonths(6)->startOfMonth()->toDateString()]);

        // ── Low stock items ────────────────────────────────────────
        $lowStockItems = DB::select("
            SELECT id, sparepart_code, name, category, stock_quantity, minimum_stock, unit
            FROM vehicle_spareparts
            WHERE stock_quantity <= minimum_stock AND is_active = 1 AND deleted_at IS NULL
            ORDER BY (stock_quantity - minimum_stock) ASC
            LIMIT 8
        ");

        // ── Vehicle status chart data ─────────────────────────────
        $vehicleStatusChart = DB::select("
            SELECT status, COUNT(*) as count
            FROM vehicles WHERE deleted_at IS NULL
            GROUP BY status
        ");

        // ── Documents expiring this month ─────────────────────────
        $expiringDocuments = DB::select("
            SELECT id, vehicle_code, plate_number, brand, model,
                   insurance_expiry, registration_expiry
            FROM vehicles
            WHERE deleted_at IS NULL AND (
                insurance_expiry BETWEEN ? AND ?
                OR registration_expiry BETWEEN ? AND ?
            )
            ORDER BY LEAST(
                COALESCE(insurance_expiry, '9999-12-31'),
                COALESCE(registration_expiry, '9999-12-31')
            ) ASC
            LIMIT 5
        ", [
            $today->toDateString(),
            $today->copy()->addDays(30)->toDateString(),
            $today->toDateString(),
            $today->copy()->addDays(30)->toDateString(),
        ]);

        return response()->json([
            'vehicleSummary'     => $vehicleSummary,
            'reminderSummary'    => $reminderSummary,
            'monthlyCost'        => $monthlyCost,
            'lowStockCount'      => (int) $lowStockCount,
            'workOrderSummary'   => $workOrderSummary,
            'recentWorkOrders'   => $recentWorkOrders,
            'upcomingReminders'  => $upcomingReminders,
            'monthlyCostTrend'   => $monthlyCostTrend,
            'lowStockItems'      => $lowStockItems,
            'vehicleStatusChart' => $vehicleStatusChart,
            'expiringDocuments'  => $expiringDocuments,
        ]);
    }
}
