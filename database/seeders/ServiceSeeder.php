<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        $notarisId = DB::table('service_types')->insertGetId([
            'name' => 'Notaris', 'slug' => 'notaris', 'created_at' => now(), 'updated_at' => now()
        ]);

        $ppatId = DB::table('service_types')->insertGetId([
            'name' => 'PPAT', 'slug' => 'ppat', 'created_at' => now(), 'updated_at' => now()
        ]);

        // =========================================================================
        // A. DATA LAYANAN PPAT (Sesuai File "PERSYARATAN BERKAS PPAT TERBARU.pdf")
        // =========================================================================

        DB::table('services')->insert([
            'service_type_id' => $ppatId, 'name' => 'Turun Waris', 'default_price' => 8500000,
            'requirements' => json_encode([
                'uploads' => ['Surat Kematian', 'Surat keterangan waris dari kelurahan/desa', 'Surat Kuasa (Apabila Dikuasakan)', 'Fotokopi identitas pemohon/para ahli waris (KTP/KK) dan kuasa', 'Sertifikat Asli', 'SPPT & PBB Tahun Berjalan'],
                'inputs' => ['Sharlock Lokasi', 'Nomor Telepon']
            ]),
            'active_fee_fields' => json_encode(['plotting', 'penataan_batas', 'pnbp', 'tax_deposit', 'validasi_pajak', 'bphtb', 'pph'])
        ]);

        DB::table('services')->insert([
            'service_type_id' => $ppatId, 'name' => 'Pemisahan', 'default_price' => 0,
            'requirements' => json_encode([
                'uploads' => ['Surat Kuasa (Apabila Dikuasakan)', 'Fotokopi identitas pemohon/para ahli waris (KTP/KK) dan kuasa', 'Sertifikat Asli', 'Suket tanda batas', 'KTP pemilik tanda batas (utara, timur, barat, selatan)', 'Foto patok tanah (pakai aplikasi geotag)', 'SPPT & PBB Tahun Berjalan'],
                'inputs' => ['Sharelock Lokasi']
            ]),
            'active_fee_fields' => json_encode(['plotting', 'penataan_batas', 'pnbp', 'tax_deposit', 'location_check_fee', 'area_measurement_fee'])
        ]);

        DB::table('services')->insert([
            'service_type_id' => $ppatId, 'name' => 'Akta Jual Beli (AJB)', 'default_price' => 3500000,
            'requirements' => json_encode([
                'uploads' => ['Asli Sertipikat Tanah', 'FC PBB Tahun Berjalan', 'Foto Lokasi Tanah', 'KTP/KK Penjual & Pembeli (Jika menikah lampirkan buku nikah & KTP/KK Pasangan)', 'NPWP Penjual & Pembeli', 'FC KTP & KK Penjual & Pembeli', 'NPWP Penjual & Pembeli', 'BPJS Penjual & Pembeli', 'Kwitansi Penjualan'],
                'inputs' => ['Sharlock Lokasi', 'Nomor Telpon Penjual', 'Nomor Telpon Pembeli']
            ]),
            'active_fee_fields' => json_encode(['plotting', 'penataan_batas', 'pnbp', 'tax_deposit', 'validasi_pajak', 'bphtb', 'pph'])
        ]);

        DB::table('services')->insert([
            'service_type_id' => $ppatId, 'name' => 'Akta Hibah', 'default_price' => 3500000,
            'requirements' => json_encode([
                'uploads' => ['Asli Sertipikat Tanah', 'FC PBB Tahun Berjalan', 'Foto Lokasi Tanah', 'KTP/KK Pemberi Hibah (Jika menikah lampirkan buku nikah & KTP/KK Pasangan)', 'NPWP Pemberi Hibah', 'FC KTP & KK Penerima Hibah', 'NPWP Penerima Hibah'],
                'inputs' => ['Sharlock Lokasi', 'Nomor Telpon Pemberi Hibah', 'Nomor Telpon Penerima Hibah']
            ]),
            'active_fee_fields' => json_encode(['plotting', 'penataan_batas', 'pnbp', 'tax_deposit', 'validasi_pajak', 'bphtb', 'pph'])
        ]);

        DB::table('services')->insert([
            'service_type_id' => $ppatId, 'name' => 'Akta Pembagian Hak Waris (APHW)', 'default_price' => 8500000,
            'requirements' => json_encode([
                'uploads' => ['Surat Kematian', 'Surat keterangan waris dari kelurahan/desa', 'Surat Kuasa (Apabila Dikuasakan)', 'Fotokopi identitas pemohon/para ahli waris (KTP/KK) dan kuasa', 'Sertifikat Asli', 'SPPT & PBB Tahun Berjalan'],
                'inputs' => ['Sharlock Lokasi', 'Nomor Telepon']
            ]),
            'active_fee_fields' => json_encode(['plotting', 'penataan_batas', 'pnbp', 'tax_deposit', 'validasi_pajak', 'bphtb', 'pph'])
        ]);

        DB::table('services')->insert([
            'service_type_id' => $ppatId, 'name' => 'Peningkatan Hak', 'default_price' => 0,
            'requirements' => json_encode([
                'uploads' => ['Sertipikat Asli', 'FC KTP/KK Pemilik Sertipikat', 'Surat Kuasa (Apabila Dikuasakan)', 'IMB di legalisir PTSP', 'SPPT & PBB Tahun Berjalan', 'FC KTP Penerima Kuasa'],
                'inputs' => []
            ]),
            'active_fee_fields' => json_encode(['plotting', 'pnbp'])
        ]);


        // =======================================================================
        // B. DATA LAYANAN NOTARIS (Sesuai File "PERSYARATAN BERKAS NOTARIS.pdf")
        // =======================================================================

        // 1. Perseroan Terbatas (PT)
        DB::table('services')->insert([
            'service_type_id' => $notarisId, 'name' => 'Pendirian PT (Modal dibawah 1M)', 'default_price' => 7500000,
            'requirements' => json_encode([
                'uploads' => ['Fotokopi KTP, NPWP pribadi pemegang saham', 'Fotokopi KTP direksi dan komisaris', 'Surat keterangan domisili dari pengelola Gedung', 'Bukti kepemilikan / surat sewa menyewa'],
                'inputs' => ['Nama perusahaan', 'Alamat dan nomor telepon Kantor', 'Bidang Usaha', 'Modal perseroan', 'Komposisi saham', 'Susunan direksi', 'Alamat email dan no HP pengurus']
            ]), 'active_fee_fields' => json_encode([])
        ]);

        DB::table('services')->insert([
            'service_type_id' => $notarisId, 'name' => 'Pendirian PT (Modal diatas 1M)', 'default_price' => 9000000,
            'requirements' => json_encode([
                'uploads' => ['Fotokopi KTP, NPWP pribadi pemegang saham', 'Fotokopi KTP direksi dan komisaris', 'Surat keterangan domisili dari pengelola Gedung', 'Bukti kepemilikan / surat sewa menyewa'],
                'inputs' => ['Nama perusahaan', 'Alamat dan nomor telepon Kantor', 'Bidang Usaha', 'Modal perseroan', 'Komposisi saham', 'Susunan direksi', 'Alamat email dan no HP pengurus']
            ]), 'active_fee_fields' => json_encode([])
        ]);

        DB::table('services')->insert([
            'service_type_id' => $notarisId, 'name' => 'Perubahan Anggaran Dasar PT', 'default_price' => 8500000,
            'requirements' => json_encode([
                'uploads' => ['Fotokopi KTP dan NPWP Organ Perseroan (Pemegang Saham, Direksi, Komisaris)', 'Akta Pendirian PT dan Perubahan Terakhir', 'Surat Keterangan Domisili', 'Notulen RUPS', 'Dokumen pendukung lainnya'],
                'inputs' => ['Uraian mengenai perubahan data PT']
            ]), 'active_fee_fields' => json_encode([])
        ]);

        DB::table('services')->insert([
            'service_type_id' => $notarisId, 'name' => 'Perubahan Data Perseroan PT', 'default_price' => 6850000,
            'requirements' => json_encode(['uploads' => ['Dokumen Akta Terakhir', 'Identitas Pengurus Baru'], 'inputs' => ['Uraian Data Perubahan']]), 'active_fee_fields' => json_encode([])
        ]);

        DB::table('services')->insert([
            'service_type_id' => $notarisId, 'name' => 'Pendirian PMA', 'default_price' => 25000000,
            'requirements' => json_encode(['uploads' => ['Dokumen Identitas Asing/Lokal', 'Suket Domisili', 'Izin Prinsip/Investasi'], 'inputs' => ['Data Pemegang Saham', 'Modal PMA']]), 'active_fee_fields' => json_encode([])
        ]);

        DB::table('services')->insert([
            'service_type_id' => $notarisId, 'name' => 'Pembubaran PT / Yayasan / Perkumpulan', 'default_price' => 10000000,
            'requirements' => json_encode([
                'uploads' => ['Fotokopi KTP dan NPWP Pengurus', 'Akta Pendirian dan Perubahan Terakhir dengan SK Menteri', 'NPWP perusahaan dan NIB', 'PKP (jika ada)', 'Bukti laporan pajak bulanan dan tahunan'],
                'inputs' => ['Alasan Pembubaran']
            ]), 'active_fee_fields' => json_encode([])
        ]);

        // 2. Yayasan
        DB::table('services')->insert([
            'service_type_id' => $notarisId, 'name' => 'Pendirian Yayasan', 'default_price' => 7500000,
            'requirements' => json_encode([
                'uploads' => ['KTP & NPWP: pembina, pengawas, pengurus', 'Surat Keterangan Domisili', 'Suket Tidak Ada Sengketa Tanah'],
                'inputs' => ['Surat Pernyataan Modal (Dibuat Notaris)', 'Alamat Email Pengurus', 'No HP Pengurus']
            ]), 'active_fee_fields' => json_encode([])
        ]);

        DB::table('services')->insert([
            'service_type_id' => $notarisId, 'name' => 'Perubahan Yayasan', 'default_price' => 7000000,
            'requirements' => json_encode([
                'uploads' => ['Akta Pendirian & SK', 'Akta Perubahan Terakhir & SK', 'NPWP Badan Yayasan', 'KTP & NPWP Pengurus (Baru dan Lama)', 'Berita Acara Rapat Pembina', 'Surat Pengunduran Diri / Suket Kematian', 'Scan Pernyataan Domisili', 'Surat Pernyataan (Tidak Konflik/Masih Jalan)'],
                'inputs' => []
            ]), 'active_fee_fields' => json_encode([])
        ]);

        // 3. CV, FIRMA, UD
        DB::table('services')->insert([
            'service_type_id' => $notarisId, 'name' => 'Pendirian CV, FIRMA, UD', 'default_price' => 4500000,
            'requirements' => json_encode([
                'uploads' => ['KTP & NPWP Pengurus'],
                'inputs' => ['Alamat Usaha', 'Nama Usaha', 'Modal Awal', 'Tujuan & Kegiatan Usaha', 'No HP & Email Pengurus']
            ]), 'active_fee_fields' => json_encode([])
        ]);

        DB::table('services')->insert([
            'service_type_id' => $notarisId, 'name' => 'Perubahan CV, FIRMA, UD', 'default_price' => 4000000,
            'requirements' => json_encode([
                'uploads' => ['Akta Pendirian dan Perubahan Sebelumnya', 'KTP & NPWP Para Persero', 'Surat Keterangan Domisili', 'Dokumen Pendukung Lainnya'],
                'inputs' => ['No HP & Email Pengurus']
            ]), 'active_fee_fields' => json_encode([])
        ]);

        DB::table('services')->insert([
            'service_type_id' => $notarisId, 'name' => 'Pembubaran Badan Usaha (CV, FIRMA, UD)', 'default_price' => 3500000,
            'requirements' => json_encode(['uploads' => ['Akta Pendirian & Perubahan', 'Identitas Persero'], 'inputs' => ['Keterangan Pembubaran']]), 'active_fee_fields' => json_encode([])
        ]);

        // 4. Koperasi & Perkumpulan
        DB::table('services')->insert([
            'service_type_id' => $notarisId, 'name' => 'Pendirian Koperasi', 'default_price' => 3500000,
            'requirements' => json_encode(['uploads' => ['Identitas Pengurus', 'Berita Acara Rapat'], 'inputs' => ['Data Koperasi']]), 'active_fee_fields' => json_encode([])
        ]);

        DB::table('services')->insert([
            'service_type_id' => $notarisId, 'name' => 'Perubahan Koperasi', 'default_price' => 4000000,
            'requirements' => json_encode(['uploads' => ['Akta Terakhir', 'Identitas Pengurus Baru'], 'inputs' => ['Data Perubahan']]), 'active_fee_fields' => json_encode([])
        ]);

        DB::table('services')->insert([
            'service_type_id' => $notarisId, 'name' => 'Pendirian Perkumpulan', 'default_price' => 6500000,
            'requirements' => json_encode([
                'uploads' => ['KTP & NPWP Pengurus', 'NPWP Perkumpulan', 'Anggaran Dasar', 'Surat Keterangan Domisili', 'Suket Tidak Sengketa Tanah', 'Daftar Hadir BA Rapat Pembentukan'],
                'inputs' => ['Nama dan Alamat Lengkap Perkumpulan', 'Surat Pernyataan Modal (Dari Notaris)']
            ]), 'active_fee_fields' => json_encode([])
        ]);

        DB::table('services')->insert([
            'service_type_id' => $notarisId, 'name' => 'Perubahan Perkumpulan', 'default_price' => 5000000,
            'requirements' => json_encode(['uploads' => ['Akta Terakhir', 'Berita Acara Rapat'], 'inputs' => ['Keterangan Perubahan']]), 'active_fee_fields' => json_encode([])
        ]);

        DB::table('services')->insert([
            'service_type_id' => $notarisId, 'name' => 'Pendirian Lembaga Non Badan Hukum', 'default_price' => 2500000,
            'requirements' => json_encode(['uploads' => ['Identitas Pendiri'], 'inputs' => ['Data Lembaga']]), 'active_fee_fields' => json_encode([])
        ]);

        // 5. JASA HUKUM LAINNYA
        $otherServices = [
            ['name' => 'Legalisasi', 'price' => 1000000],
            ['name' => 'Waarmerking', 'price' => 600000],
            ['name' => 'Keterangan Waris (Notaris)', 'price' => 8500000],
            ['name' => 'Wasiat', 'price' => 7500000],
            ['name' => 'Perjanjian Nikah', 'price' => 3000000],
            ['name' => 'Perjanjian Kerjasama', 'price' => 2500000],
            ['name' => 'Perjanjian Pengikatan Jual Beli (PPJB)', 'price' => 3500000],
            ['name' => 'Kuasa', 'price' => 3000000],
            ['name' => 'Pernyataan', 'price' => 2500000],
            ['name' => 'Pelepasan Hak', 'price' => 4000000],
            ['name' => 'Undian', 'price' => 2000000],
            ['name' => 'Bortoch, Cessie, Gadai', 'price' => 4500000],
            ['name' => 'Surat Kuasa Membebankan Hak Tanggungan', 'price' => 1500000],
            ['name' => 'Pengakuan Hutang', 'price' => 1500000],
            ['name' => 'Akta Pelimpahan', 'price' => 1500000],
            ['name' => 'Akta Lain-lain', 'price' => 2000000],
        ];

        foreach ($otherServices as $svc) {
            DB::table('services')->insert([
                'service_type_id' => $notarisId,
                'name' => $svc['name'],
                'default_price' => $svc['price'],
                'requirements' => json_encode([
                    'uploads' => ['Dokumen Terkait (KTP/KK/Sertifikat)'],
                    'inputs' => ['Keterangan Objek / Catatan Tambahan']
                ]),
                'active_fee_fields' => json_encode([]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
