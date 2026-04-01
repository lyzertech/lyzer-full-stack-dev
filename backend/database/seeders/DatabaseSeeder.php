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
            ['first_name' => 'Super', 'last_name' => 'Admin', 'display_name' => 'Super Admin', 'email' => 'superadmin@lyzer.test', 'role' => 'superadmin'],
            ['first_name' => 'Finance', 'last_name' => 'Manager', 'display_name' => 'Finance Manager', 'email' => 'finance@lyzer.test', 'role' => 'finance'],
            ['first_name' => 'Labs', 'last_name' => 'Manager', 'display_name' => 'Labs Manager', 'email' => 'labs@lyzer.test', 'role' => 'labs'],
            ['first_name' => 'School', 'last_name' => 'Manager', 'display_name' => 'School Manager', 'email' => 'school@lyzer.test', 'role' => 'school'],
        ];

        foreach ($users as $userData) {
            $roleSlug = $userData['role'];
            unset($userData['role']);

            // 1. Ensure the role exists
            $roleId = \Illuminate\Support\Facades\DB::table('auth_roles')->where('slug', $roleSlug)->value('id');
            if (!$roleId) {
                $roleId = \Illuminate\Support\Facades\DB::table('auth_roles')->insertGetId([
                    'name' => ucfirst($roleSlug),
                    'slug' => $roleSlug,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // 2. Create the user
            $user = User::firstOrCreate(
                ['email' => $userData['email']],
                array_merge($userData, [
                    'password' => Hash::make('password'),
                    'email_verified' => 1,
                    'is_active' => 1,
                ])
            );

            // 3. Attach the user role
            \Illuminate\Support\Facades\DB::table('auth_user_roles')->updateOrInsert(
                ['user_id' => $user->id, 'role_id' => $roleId],
                [
                    'assigned_at' => now(),
                    'is_active' => 1,
                    'created_at' => now(),
                    'updated_at' => now()
                ]
            );
        }
    }
}
