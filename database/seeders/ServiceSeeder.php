<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Buat Tipe Layanan
        $notarisId = DB::table('service_types')->insertGetId([
            'name' => 'Notaris', 'slug' => 'notaris', 'created_at' => now(), 'updated_at' => now()
        ]);

        $ppatId = DB::table('service_types')->insertGetId([
            'name' => 'PPAT', 'slug' => 'ppat', 'created_at' => now(), 'updated_at' => now()
        ]);

        $jasaId = DB::table('service_types')->insertGetId([
            'name' => 'Pengurusan / Jasa Lain', 'slug' => 'pengurusan', 'created_at' => now(), 'updated_at' => now()
        ]);

        // 2. Isi Layanan Notaris
        $servicesNotaris = [
            'Akta Pendirian PT', 'Akta Perubahan PT', 'Akta Kuasa Menjual', 'Akta Wasiat', 'Legalisasi', 'Waarmerking'
        ];
        foreach ($servicesNotaris as $srv) {
            DB::table('services')->insert([
                'service_type_id' => $notarisId, 'name' => $srv, 'created_at' => now(), 'updated_at' => now()
            ]);
        }

        // 3. Isi Layanan PPAT
        $servicesPPAT = [
            'Akta Jual Beli (AJB)', 'Akta Hibah', 'Akta Pembagian Hak Bersama (APHB)', 'Akta Pemberian Hak Tanggungan (APHT)'
        ];
        foreach ($servicesPPAT as $srv) {
            DB::table('services')->insert([
                'service_type_id' => $ppatId, 'name' => $srv, 'created_at' => now(), 'updated_at' => now()
            ]);
        }
    }
}
