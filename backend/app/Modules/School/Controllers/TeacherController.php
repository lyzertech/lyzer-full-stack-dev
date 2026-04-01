<?php

namespace App\Modules\School\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\School\Models\SchoolTeacher;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TeacherController extends Controller
{
    /**
     * Display a listing of the teachers.
     */
    public function index(): JsonResponse
    {
        $teachers = SchoolTeacher::all()->map(function ($teacher) {
            return [
                'id' => $teacher->id,
                'name' => $teacher->name,
                'degree' => $teacher->degree,
                'email' => $teacher->email,
                'subject' => $teacher->subject,
                'nip' => $teacher->nip,
                'gender' => $teacher->gender,
                'status' => $teacher->status,
                'jobType' => $teacher->job_type,
                'joinDate' => $teacher->join_date,
                'avatar' => $teacher->avatar,
            ];
        });

        return response()->json($teachers);
    }

    /**
     * Store a newly created teacher in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'degree' => 'nullable|string',
            'email' => 'required|email',
            'subject' => 'required|string',
            'nip' => 'nullable|string',
            'gender' => 'nullable|string',
            'status' => 'nullable|string',
            'jobType' => 'nullable|string',
            'joinDate' => 'nullable|date',
            'avatar' => 'nullable|string',
        ]);

        $teacher = SchoolTeacher::create([
            'name' => $validated['name'],
            'degree' => $validated['degree'] ?? '',
            'email' => $validated['email'],
            'subject' => $validated['subject'],
            'nip' => $validated['nip'] ?? null,
            'gender' => $validated['gender'] ?? 'Male',
            'status' => $validated['status'] ?? 'Active',
            'job_type' => $validated['jobType'] ?? 'Permanent',
            'join_date' => $validated['joinDate'] ?? date('Y-m-d'),
            'avatar' => $validated['avatar'] ?? null,
        ]);

        return response()->json([
            'id' => $teacher->id,
            'name' => $teacher->name,
            'degree' => $teacher->degree,
            'email' => $teacher->email,
            'subject' => $teacher->subject,
            'nip' => $teacher->nip,
            'gender' => $teacher->gender,
            'status' => $teacher->status,
            'jobType' => $teacher->job_type,
            'joinDate' => $teacher->join_date,
            'avatar' => $teacher->avatar,
        ], 201);
    }

    /**
     * Display the specified teacher.
     */
    public function show($id): JsonResponse
    {
        $teacher = SchoolTeacher::findOrFail($id);
        
        return response()->json([
            'id' => $teacher->id,
            'name' => $teacher->name,
            'degree' => $teacher->degree,
            'email' => $teacher->email,
            'subject' => $teacher->subject,
            'nip' => $teacher->nip,
            'gender' => $teacher->gender,
            'status' => $teacher->status,
            'jobType' => $teacher->job_type,
            'joinDate' => $teacher->join_date,
            'avatar' => $teacher->avatar,
        ]);
    }

    /**
     * Update the specified teacher in storage.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $teacher = SchoolTeacher::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string',
            'degree' => 'nullable|string',
            'email' => 'sometimes|required|email',
            'subject' => 'sometimes|required|string',
            'nip' => 'nullable|string',
            'gender' => 'nullable|string',
            'status' => 'nullable|string',
            'jobType' => 'nullable|string',
            'joinDate' => 'nullable|date',
            'avatar' => 'nullable|string',
        ]);

        if (isset($validated['jobType'])) {
            $validated['job_type'] = $validated['jobType'];
            unset($validated['jobType']);
        }
        if (isset($validated['joinDate'])) {
            $validated['join_date'] = $validated['joinDate'];
            unset($validated['joinDate']);
        }

        $teacher->update($validated);

        return response()->json([
            'id' => $teacher->id,
            'name' => $teacher->name,
            'degree' => $teacher->degree,
            'email' => $teacher->email,
            'subject' => $teacher->subject,
            'nip' => $teacher->nip,
            'gender' => $teacher->gender,
            'status' => $teacher->status,
            'jobType' => $teacher->job_type,
            'joinDate' => $teacher->join_date,
            'avatar' => $teacher->avatar,
        ]);
    }

    /**
     * Remove the specified teacher from storage.
     */
    public function destroy($id): JsonResponse
    {
        $teacher = SchoolTeacher::findOrFail($id);
        $teacher->delete();
        
        return response()->json(null, 204);
    }
}
