<?php

namespace App\Modules\School\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\School\Models\Student;
use App\Modules\School\Requests\StudentRequest;
use App\Modules\School\Services\SchoolService;
use Illuminate\Http\JsonResponse;

class StudentController extends Controller
{
    public function __construct(protected SchoolService $service) {}

    public function index(\Illuminate\Http\Request $request): JsonResponse
    {
        $simple = $request->query('simple');
        if ($simple === '1') {
            $students = Student::orderBy('name', 'asc')->get()->map(function ($s) {
                return [
                    'id' => $s->id,
                    'nis' => $s->student_id,
                    'name' => $s->name,
                    'grade' => $s->class,
                    'room' => null, // Not in migration
                    'status' => 'Active', // Not in migration
                ];
            });
            return response()->json($students);
        }

        $students = Student::orderBy('name', 'asc')->get()->map(function ($s) {
            return [
                'id' => $s->id,
                'nis' => $s->student_id,
                'name' => $s->name,
                'gender' => ucfirst($s->gender),
                'date_of_birth' => $s->date_of_birth ? $s->date_of_birth->format('Y-m-d') : null,
                'grade' => $s->class,
                'room' => null,
                'parent_name' => '-', // Missing from migration
                'parent_phone' => $s->phone,
                'address' => $s->address,
                'status' => 'Active',
            ];
        });
        return response()->json($students);
    }

    public function store(\Illuminate\Http\Request $request): JsonResponse
    {
        // Frontend sends: name, gender, nis, sometimes date_of_birth, grade, etc.
        $data = $request->validate([
            'name' => 'required|string',
            'gender' => 'nullable|string',
            'nis' => 'nullable|string',
            'date_of_birth' => 'nullable|date',
            'grade' => 'nullable|string',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
        ]);

        $nis = $data['nis'] ?? null;
        if (!$nis) {
            $ymd = date('Ymd');
            $maxId = Student::max('id') ?? 0;
            $nextId = $maxId + 1;
            $nis = $ymd . str_pad($nextId, 4, '0', STR_PAD_LEFT);
        }

        $student = Student::create([
            'name' => $data['name'],
            'student_id' => $nis,
            'gender' => strtolower($data['gender'] ?? 'male'),
            'date_of_birth' => $data['date_of_birth'] ?? date('Y-m-d'),
            'class' => $data['grade'] ?? '1',
            'phone' => $data['phone'] ?? null,
            'address' => $data['address'] ?? null,
            'email' => null,
        ]);

        return response()->json([
            'id' => $student->id,
            'nis' => $student->student_id,
            'name' => $student->name,
            'gender' => ucfirst($student->gender),
            'date_of_birth' => $student->date_of_birth ? $student->date_of_birth->format('Y-m-d') : null,
            'grade' => $student->class,
            'status' => 'Active',
        ], 201);
    }

    public function show($id): JsonResponse
    {
        $s = Student::findOrFail($id);
        return response()->json([
            'id' => $s->id,
            'nis' => $s->student_id,
            'name' => $s->name,
            'gender' => ucfirst($s->gender),
            'date_of_birth' => $s->date_of_birth ? $s->date_of_birth->format('Y-m-d') : null,
            'grade' => $s->class,
            'room' => null,
            'parent_name' => '-',
            'parent_phone' => $s->phone,
            'address' => $s->address,
            'status' => 'Active',
        ]);
    }

    public function update(\Illuminate\Http\Request $request, $id): JsonResponse
    {
        $student = Student::findOrFail($id);
        
        $data = $request->validate([
            'name' => 'sometimes|required|string',
            'gender' => 'nullable|string',
            'nis' => 'nullable|string',
            'date_of_birth' => 'nullable|date',
            'grade' => 'nullable|string',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
        ]);

        if (isset($data['nis'])) $student->student_id = $data['nis'];
        if (isset($data['gender'])) $student->gender = strtolower($data['gender']);
        if (isset($data['grade'])) $student->class = $data['grade'];
        
        $student->fill($request->only(['name', 'date_of_birth', 'phone', 'address']))->save();

        return response()->json([
            'id' => $student->id,
            'nis' => $student->student_id,
            'name' => $student->name,
            'gender' => ucfirst($student->gender),
            'date_of_birth' => $student->date_of_birth ? $student->date_of_birth->format('Y-m-d') : null,
            'grade' => $student->class,
            'status' => 'Active',
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $student = Student::findOrFail($id);
        $student->delete();
        return response()->json(['message' => 'Student deleted.']);
    }
}
