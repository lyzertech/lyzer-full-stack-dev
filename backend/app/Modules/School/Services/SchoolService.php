<?php

namespace App\Modules\School\Services;

use App\Modules\School\Models\Student;

class SchoolService
{
    public function createStudent(array $data): Student
    {
        return Student::create($data);
    }

    public function updateStudent(Student $student, array $data): Student
    {
        $student->update($data);
        return $student->fresh();
    }
}
