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

    public function index(): JsonResponse
    {
        $students = Student::latest()->paginate(15);
        return response()->json($students);
    }

    public function store(StudentRequest $request): JsonResponse
    {
        $student = $this->service->createStudent($request->validated());
        return response()->json($student, 201);
    }

    public function show(Student $student): JsonResponse
    {
        return response()->json($student);
    }

    public function update(StudentRequest $request, Student $student): JsonResponse
    {
        $updated = $this->service->updateStudent($student, $request->validated());
        return response()->json($updated);
    }

    public function destroy(Student $student): JsonResponse
    {
        $student->delete();
        return response()->json(['message' => 'Student deleted.']);
    }
}
