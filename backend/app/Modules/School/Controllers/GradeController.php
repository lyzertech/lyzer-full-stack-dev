<?php

namespace App\Modules\School\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\School\Models\SchoolGrade;
use App\Modules\School\Models\SchoolRoom;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GradeController extends Controller
{
    public function index(): JsonResponse
    {
        $rows = DB::table('school_grades as g')
            ->leftJoin('school_rooms as r', 'r.grade_id', '=', 'g.id')
            ->leftJoin('school_teachers as t', 't.id', '=', 'r.teacher_id')
            ->select([
                'g.id',
                'g.name',
                'g.level',
                'g.description',
                'g.status',
                'g.created_at as createdAt',
                'g.updated_at as updatedAt',
                'r.id as roomId',
                'r.name as roomName',
                'r.capacity as roomCapacity',
                'r.teacher_id as roomTeacherId',
                't.name as roomTeacherName',
            ])
            ->orderBy('g.level')
            ->orderBy('g.name')
            ->orderBy('r.name')
            ->get();

        return response()->json($rows);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'level' => 'required|integer',
            'description' => 'nullable|string',
            'status' => 'nullable|in:Active,Inactive',
            'rooms' => 'nullable|array',
            'rooms.*.name' => 'required_with:rooms|string|max:100',
            'rooms.*.capacity' => 'nullable|integer|min:0',
            'rooms.*.teacherId' => 'nullable|integer|exists:school_teachers,id',
        ]);

        $grade = SchoolGrade::create([
            'name' => $validated['name'],
            'level' => $validated['level'],
            'description' => $validated['description'] ?? null,
            'status' => $validated['status'] ?? 'Active',
        ]);

        foreach ($validated['rooms'] ?? [] as $roomData) {
            SchoolRoom::create([
                'grade_id' => $grade->id,
                'name' => $roomData['name'],
                'capacity' => $roomData['capacity'] ?? null,
                'teacher_id' => $roomData['teacherId'] ?? null,
            ]);
        }

        $grade->load('rooms.teacher');

        return response()->json($this->formatGrade($grade), 201);
    }

    public function patch(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'roomId' => 'required|integer|exists:school_rooms,id',
            'teacherId' => 'nullable|integer|exists:school_teachers,id',
            'capacity' => 'nullable|integer|min:0',
        ]);

        $room = SchoolRoom::findOrFail($validated['roomId']);

        if (array_key_exists('teacherId', $validated)) {
            $room->teacher_id = $validated['teacherId'];
        }

        if (array_key_exists('capacity', $validated)) {
            $room->capacity = $validated['capacity'];
        }

        $room->save();

        return response()->json(['success' => true]);
    }

    public function destroy(Request $request): JsonResponse
    {
        $id = $request->query('id');

        if (!$id) {
            return response()->json(['error' => 'Grade id is required'], 400);
        }

        $grade = SchoolGrade::findOrFail($id);
        $grade->delete();

        return response()->json(['success' => true]);
    }

    private function formatGrade(SchoolGrade $grade): array
    {
        return [
            'id' => $grade->id,
            'name' => $grade->name,
            'level' => $grade->level,
            'description' => $grade->description,
            'status' => $grade->status,
            'created_at' => $grade->created_at?->toIso8601String(),
            'updated_at' => $grade->updated_at?->toIso8601String(),
            'rooms' => $grade->rooms->map(fn (SchoolRoom $room) => [
                'id' => $room->id,
                'grade_id' => $room->grade_id,
                'name' => $room->name,
                'capacity' => $room->capacity,
                'teacher_id' => $room->teacher_id,
                'teacherId' => $room->teacher_id,
                'teacherName' => $room->teacher?->name,
            ])->values()->all(),
        ];
    }
}
