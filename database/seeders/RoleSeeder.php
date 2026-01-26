<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Reset cache permission (Wajib biar gak error)
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // 2. Definisikan Permission (Hak Akses Granular)
        $permissions = [
            'view_dashboard',
            'manage_users',     // Hanya Admin
            'manage_clients',   // Admin & Staff
            'manage_deeds',     // Admin & Staff (Create/Edit)
            'approve_deeds',    // Khusus Notaris
            'view_finance',     // Admin & Notaris
            'manage_finance',   // Admin
        ];

        foreach ($permissions as $p) {
            Permission::firstOrCreate(['name' => $p]);
        }

        // 3. Buat Role & Assign Permission

        // A. STAFF (Operasional)
        $roleStaff = Role::firstOrCreate(['name' => 'staff']);
        $roleStaff->givePermissionTo(['view_dashboard', 'manage_clients', 'manage_deeds']);

        // B. NOTARIS (Bos - Approval & Monitoring)
        $roleNotaris = Role::firstOrCreate(['name' => 'notaris']);
        $roleNotaris->givePermissionTo(['view_dashboard', 'approve_deeds', 'view_finance']);

        // C. SUPER ADMIN (IT / Mas Daeng)
        $roleAdmin = Role::firstOrCreate(['name' => 'super_admin']);
        $roleAdmin->givePermissionTo(Permission::all());

        // 4. Buat User Dummy untuk Login

        // User 1: Admin (Mas Daeng)
        $admin = User::firstOrCreate(
            ['email' => 'admin@notary.com'],
            [
                'name' => 'Mas Daeng (Admin)',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        $admin->assignRole($roleAdmin);

        // User 2: Pak Bos Notaris
        $bos = User::firstOrCreate(
            ['email' => 'bos@notary.com'],
            [
                'name' => 'Bapak Notaris',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        $bos->assignRole($roleNotaris);

        // User 3: Staff Karyawan
        $staff = User::firstOrCreate(
            ['email' => 'staff@notary.com'],
            [
                'name' => 'Staff Andalan',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        $staff->assignRole($roleStaff);
    }
}
