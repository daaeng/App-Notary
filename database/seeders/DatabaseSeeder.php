<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Panggil seeder role di sini
        $this->call([
            RoleSeeder::class,
        ]);
    }
}
