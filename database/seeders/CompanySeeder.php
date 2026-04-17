<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Company;

class CompanySeeder extends Seeder
{
    public function run(): void
    {
        if (Company::count() == 0) {
            Company::create([
                'name'           => 'KANTOR NOTARIS',
                'notary_name'    => 'Orista Miranti Irpada Adam, S.H., M.Kn.',
                'sk_number'      => 'AHU-111.AH.02.01. TAHUN 2026', // Data SK Baru!
                'address'        => 'Jalan Sudirman No. 50 RT. 03 RW. 01 Air Kolek, Ranai Kabupaten Natuna',
                'phone'          => '0812 3001 5677',
                'email'          => 'oristanotaris@gmail.com',

                // Data Rekening
                'bank_name'      => 'BNI ',
                'account_number' => '2026287478',
                'account_name'   => 'Orista Miranti irpada adam',
            ]);
        }
    }
}
