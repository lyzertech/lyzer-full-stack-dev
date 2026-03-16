<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            ['name' => 'Super Admin',     'email' => 'superadmin@lyzer.test', 'role' => 'superadmin'],
            ['name' => 'Finance Manager', 'email' => 'finance@lyzer.test',    'role' => 'finance'],
            ['name' => 'Labs Manager',    'email' => 'labs@lyzer.test',       'role' => 'labs'],
            ['name' => 'School Manager',  'email' => 'school@lyzer.test',     'role' => 'school'],
        ];

        foreach ($users as $userData) {
            User::firstOrCreate(
                ['email' => $userData['email']],
                array_merge($userData, ['password' => Hash::make('password')])
            );
        }
    }
}
