<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Company;

class CompanySeeder extends Seeder
{
    public function run(): void
    {
        // Cek jika data kosong, baru buat
        if (Company::count() == 0) {
            Company::create([
                'name' => 'KANTOR NOTARIS & PPAT CONTOH',
                'notary_name' => 'Mas Daeng, S.H., M.Kn.',
                'address' => 'Jl. Jendral Sudirman No. 123, Natuna',
                'phone' => '0812-3456-7890',
                'email' => 'admin@kantor.com',
                'bank_account' => 'BCA 1234567890 a.n Mas Daeng',
            ]);
        }
    }
}
