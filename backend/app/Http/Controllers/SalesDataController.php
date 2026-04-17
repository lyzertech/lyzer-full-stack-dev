<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SalesDataController extends Controller
{
    public function customers(): JsonResponse
    {
        $rows = DB::table('sales_customers as sc')
            ->leftJoin('auth_users as su', 'sc.sales_user_id', '=', 'su.id')
            ->whereNull('sc.deleted_at')
            ->select([
                'sc.id',
                'sc.customer_code',
                'sc.name',
                'sc.email',
                'sc.area',
                'sc.address',
                'sc.phone_number',
                'sc.mobile_phone',
                'sc.company',
                'sc.position',
                'sc.status',
                'sc.created_at',
                'sc.updated_at',
                DB::raw("COALESCE(NULLIF(su.display_name, ''), NULLIF(TRIM(CONCAT(COALESCE(su.first_name, ''), ' ', COALESCE(su.last_name, ''))), ''), su.email) as sales"),
            ])
            ->orderByDesc('sc.created_at')
            ->get();

        return response()->json($rows);
    }

    public function visitReports(): JsonResponse
    {
        $rows = DB::table('sales_visit_reports')
            ->whereNull('deleted_at')
            ->orderByDesc('visit_date')
            ->orderByDesc('id')
            ->get();

        $payload = $rows->map(function ($row) {
            $status = $this->normalizeVisitStatus((string) ($row->status ?? ''));
            $prospek = $this->normalizeProspek((string) ($row->prospek ?? ''));
            $visitDate = $row->visit_date ? (string) $row->visit_date : null;
            $visitTime = $row->visit_time ? substr((string) $row->visit_time, 0, 8) : '00:00:00';

            return [
                'id' => (int) $row->id,
                'idVisitReport' => (string) ($row->id_visit_report ?? ''),
                'sales' => (string) ($row->sales ?? '-'),
                'company' => (string) ($row->customer_name ?? '-'),
                'contactPerson' => (string) ($row->contact_person ?? '-'),
                'meetingPoint' => (string) ($row->location ?? '-'),
                'visitDateTime' => $visitDate ? "{$visitDate} {$visitTime}" : '-',
                'purpose' => (string) ($row->purpose ?? '-'),
                'followUpDate' => $row->follow_up_date ? (string) $row->follow_up_date : null,
                'status' => $status,
                'prospek' => $prospek,
            ];
        })->values();

        return response()->json($payload);
    }

    public function products(): JsonResponse
    {
        $rows = DB::table('sales_products')
            ->whereNull('deleted_at')
            ->select([
                'id',
                'sku',
                'brand',
                'name',
                'code',
                'model',
                'type',
                'unit',
                'cost_price',
                'selling_price',
                'stock_qty',
                'is_active',
                'created_at',
                'updated_at',
            ])
            ->orderByDesc('created_at')
            ->get();

        return response()->json($rows);
    }

    public function storeProduct(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'sku' => ['required', 'string', 'max:100', 'unique:sales_products,sku'],
            'brand' => ['nullable', 'string', 'max:255'],
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:100', 'unique:sales_products,code'],
            'model' => ['nullable', 'string', 'max:255'],
            'type' => ['nullable', 'string', 'max:100'],
            'unit' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string'],
            'cost_price' => ['nullable', 'numeric', 'min:0'],
            'selling_price' => ['required', 'numeric', 'min:0'],
            'stock_qty' => ['nullable', 'integer', 'min:0'],
            'track_stock' => ['nullable', 'boolean'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $userId = optional($request->user())->id;
        $now = now();

        $id = DB::table('sales_products')->insertGetId([
            'sku' => $validated['sku'],
            'brand' => $validated['brand'] ?? null,
            'name' => $validated['name'],
            'code' => $validated['code'],
            'model' => $validated['model'] ?? null,
            'type' => $validated['type'] ?? null,
            'unit' => $validated['unit'] ?? null,
            'description' => $validated['description'] ?? null,
            'cost_price' => $validated['cost_price'] ?? 0,
            'selling_price' => $validated['selling_price'],
            'stock_qty' => $validated['stock_qty'] ?? 0,
            'track_stock' => $validated['track_stock'] ?? true,
            'is_active' => $validated['is_active'] ?? true,
            'created_by' => $userId,
            'updated_by' => $userId,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $product = DB::table('sales_products')
            ->where('id', $id)
            ->first();

        return response()->json([
            'message' => 'Product created successfully.',
            'data' => $product,
        ], 201);
    }

    public function storeVisitReport(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_name'       => ['required', 'string', 'max:255'],
            'sales'               => ['required', 'string', 'max:255'],
            'office'              => ['nullable', 'string', 'in:AII,SEP'],
            'location'            => ['nullable', 'string', 'max:255'],
            'contact_person'      => ['nullable', 'string', 'max:255'],
            'contact_number'      => ['nullable', 'string', 'max:50'],
            'visit_date'          => ['nullable', 'date'],
            'visit_time'          => ['nullable', 'date_format:H:i,H:i:s'],
            'purpose'             => ['nullable', 'string'],
            'notes'               => ['nullable', 'string'],
            'customer_feedback'   => ['nullable', 'string'],
            'next_steps'          => ['nullable', 'string'],
            'follow_up_date'      => ['nullable', 'date'],
            'follow_up_date_status' => ['nullable', 'string', 'max:100'],
            'status'              => ['nullable', 'string', 'max:100'],
            'prospek'             => ['nullable', 'string', 'max:100'],
            'ack_manager'         => ['nullable', 'boolean'],
            'ack_director'        => ['nullable', 'boolean'],
            'ack_presdir'         => ['nullable', 'boolean'],
            'response'            => ['nullable', 'string'],
            'image'               => ['nullable', 'string', 'max:255'],
        ]);

        $now = now();

        // Generate next sequential visit-report ID for the given office
        $office = strtoupper($validated['office'] ?? 'AII');
        $prefix = "VR-{$office}-";
        $last = DB::table('sales_visit_reports')
            ->where('id_visit_report', 'like', "{$prefix}%")
            ->orderByDesc('id')
            ->value('id_visit_report');

        $nextSeq = 1;
        if ($last) {
            $parts    = explode('-', $last);
            $nextSeq  = ((int) end($parts)) + 1;
        }

        $idVisitReport = $prefix . str_pad((string) $nextSeq, 6, '0', STR_PAD_LEFT);

        $id = DB::table('sales_visit_reports')->insertGetId([
            'id_visit_report'       => $idVisitReport,
            'customer_name'         => $validated['customer_name'],
            'sales'                 => $validated['sales'],
            'office'                => $office,
            'location'              => $validated['location'] ?? null,
            'contact_person'        => $validated['contact_person'] ?? null,
            'contact_number'        => $validated['contact_number'] ?? null,
            'visit_date'            => $validated['visit_date'] ?? null,
            'visit_time'            => $validated['visit_time'] ?? null,
            'purpose'               => $validated['purpose'] ?? null,
            'notes'                 => $validated['notes'] ?? null,
            'customer_feedback'     => $validated['customer_feedback'] ?? null,
            'next_steps'            => $validated['next_steps'] ?? null,
            'follow_up_date'        => $validated['follow_up_date'] ?? null,
            'follow_up_date_status' => $validated['follow_up_date_status'] ?? null,
            'status'                => $this->normalizeVisitStatus($validated['status'] ?? 'Planned'),
            'prospek'               => $this->normalizeProspek($validated['prospek'] ?? 'Unknown'),
            'ack_manager'           => (bool) ($validated['ack_manager'] ?? false),
            'ack_director'          => (bool) ($validated['ack_director'] ?? false),
            'ack_presdir'           => (bool) ($validated['ack_presdir'] ?? false),
            'response'              => $validated['response'] ?? null,
            'image'                 => $validated['image'] ?? null,
            'created_at'            => $now,
            'updated_at'            => $now,
        ]);

        $row = DB::table('sales_visit_reports')->where('id', $id)->first();

        $visitDate = $row->visit_date ? (string) $row->visit_date : null;
        $visitTime = $row->visit_time ? substr((string) $row->visit_time, 0, 8) : '00:00:00';

        return response()->json([
            'message' => 'Visit report created successfully.',
            'data'    => [
                'id'            => (int) $row->id,
                'idVisitReport' => (string) $row->id_visit_report,
                'sales'         => (string) $row->sales,
                'company'       => (string) $row->customer_name,
                'contactPerson' => (string) ($row->contact_person ?? '-'),
                'meetingPoint'  => (string) ($row->location ?? '-'),
                'visitDateTime' => $visitDate ? "{$visitDate} {$visitTime}" : '-',
                'purpose'       => (string) ($row->purpose ?? '-'),
                'followUpDate'  => $row->follow_up_date ? (string) $row->follow_up_date : null,
                'status'        => (string) $row->status,
                'prospek'       => (string) $row->prospek,
            ],
        ], 201);
    }

    private function normalizeVisitStatus(string $status): string
    {
        $map = [
            'completed' => 'Completed',
            'checked' => 'Checked',
            'reviewed' => 'Reviewed',
            'submitted' => 'Submitted',
            'planned' => 'Planned',
            'cancelled' => 'Cancelled',
            'canceled' => 'Cancelled',
        ];

        $key = strtolower(trim($status));
        return $map[$key] ?? 'Planned';
    }

    private function normalizeProspek(string $prospek): string
    {
        $key = strtolower(trim($prospek));
        if (in_array($key, ['yes', 'y', 'true', '1'], true)) {
            return 'Yes';
        }
        if (in_array($key, ['no', 'n', 'false', '0'], true)) {
            return 'No';
        }
        return 'Unknown';
    }
}
