<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        // 1. BUAT TIPE LAYANAN
        $notarisId = DB::table('service_types')->insertGetId([
            'name' => 'Notaris', 'slug' => 'notaris', 'created_at' => now(), 'updated_at' => now()
        ]);

        $ppatId = DB::table('service_types')->insertGetId([
            'name' => 'PPAT', 'slug' => 'ppat', 'created_at' => now(), 'updated_at' => now()
        ]);

        // ==========================================
        // A. DATA LAYANAN PPAT (Dari Gambar Sebelumnya)
        // ==========================================

        DB::table('services')->insert([
            'service_type_id' => $ppatId, 'name' => 'Turun Waris', 'default_price' => 8500000,
            'requirements' => json_encode([
                'uploads' => ['Surat Kematian', 'Suket Waris dari Kelurahan/Desa', 'Surat Kuasa (Apabila Dikuasakan)', 'FC Identitas Pemohon/Ahli Waris (KTP/KK)', 'Sertifikat Asli', 'SPPT & PBB Tahun Berjalan'],
                'inputs' => ['Sharlock Lokasi', 'Nomor Telepon', 'Jumlah Materai (Minimal 5)']
            ]),
            'active_fee_fields' => json_encode(['plotting', 'penataan_batas', 'pnbp', 'validasi_pajak', 'bphtb'])
        ]);

        DB::table('services')->insert([
            'service_type_id' => $ppatId, 'name' => 'Akta Pembagian Hak Waris (APHW)', 'default_price' => 0,
            'requirements' => json_encode([
                'uploads' => ['Surat Kematian', 'Suket Waris dari Kelurahan/Desa', 'Surat Kuasa (Apabila Dikuasakan)', 'FC Identitas Pemohon/Ahli Waris (KTP/KK)', 'Sertifikat Asli', 'SPPT & PBB Tahun Berjalan'],
                'inputs' => ['Sharlock Lokasi', 'Nomor Telepon', 'Jumlah Materai (Minimal 16)']
            ]),
            'active_fee_fields' => json_encode(['plotting', 'penataan_batas', 'pnbp', 'validasi_pajak', 'bphtb', 'pph'])
        ]);

        DB::table('services')->insert([
            'service_type_id' => $ppatId, 'name' => 'Akta Jual Beli (AJB)', 'default_price' => 3500000,
            'requirements' => json_encode([
                'uploads' => ['Asli Sertipikat Tanah', 'FC PBB Tahun Berjalan', 'Foto Lokasi Tanah', 'KTP/KK Penjual & Buku Nikah Pasangan', 'NPWP Penjual', 'FC KTP/KK Pembeli', 'NPWP Pembeli'],
                'inputs' => ['Sharlock Lokasi', 'Nomor Telpon Penjual', 'Nomor Telpon Pembeli', 'Jumlah Materai (Minimal 20)']
            ]),
            'active_fee_fields' => json_encode(['plotting', 'penataan_batas', 'pnbp', 'validasi_pajak', 'bphtb', 'pph'])
        ]);

        DB::table('services')->insert([
            'service_type_id' => $ppatId, 'name' => 'Akta Hibah', 'default_price' => 3500000,
            'requirements' => json_encode([
                'uploads' => ['Asli Sertipikat Tanah', 'FC PBB Tahun Berjalan', 'Foto Lokasi Tanah', 'KTP/KK Pemberi Hibah & Buku Nikah', 'NPWP Pemberi Hibah', 'FC KTP/KK Penerima Hibah', 'NPWP Penerima Hibah'],
                'inputs' => ['Sharlock Lokasi', 'Nomor Telpon Pemberi', 'Nomor Telpon Penerima', 'Jumlah Materai (Minimal 20)']
            ]),
            'active_fee_fields' => json_encode(['plotting', 'penataan_batas', 'pnbp', 'validasi_pajak', 'bphtb', 'pph'])
        ]);

        DB::table('services')->insert([
            'service_type_id' => $ppatId, 'name' => 'Peningkatan Hak', 'default_price' => 0,
            'requirements' => json_encode([
                'uploads' => ['Sertipikat Asli', 'FC KTP/KK Pemilik Sertipikat', 'Surat Kuasa (Apabila Dikuasakan)', 'IMB Dilegalisir PTSP', 'SPPT & PBB Tahun Berjalan', 'FC KTP Penerima Kuasa'],
                'inputs' => ['Jumlah Materai (5 Lembar)']
            ]),
            'active_fee_fields' => json_encode(['plotting', 'pnbp'])
        ]);

        DB::table('services')->insert([
            'service_type_id' => $ppatId, 'name' => 'Pemisahan', 'default_price' => 0,
            'requirements' => json_encode([
                'uploads' => ['Surat Kuasa (Apabila Dikuasakan)', 'FC Identitas Pemohon/Ahli Waris (KTP/KK)', 'Sertifikat Asli', 'Suket Tanda Batas', 'KTP Pemilik Tanda Batas (Utara, Timur, Barat, Selatan)', 'Foto Patok Tanah (Aplikasi Geotag)', 'SPPT & PBB Tahun Berjalan'],
                'inputs' => ['Sharelock Lokasi', 'Jumlah Materai 5 Lembar']
            ]),
            'active_fee_fields' => json_encode(['plotting', 'penataan_batas', 'pnbp', 'pengecekan_lokasi', 'pengukuran'])
        ]);


        // ==========================================
        // B. DATA LAYANAN BADAN USAHA (NOTARIS)
        // ==========================================

        DB::table('services')->insert([
            'service_type_id' => $notarisId, 'name' => 'Pendirian Yayasan', 'default_price' => 7500000,
            'requirements' => json_encode([
                'uploads' => ['KTP & NPWP Pembina, Pengawas, Pengurus', 'Surat Keterangan Domisili', 'Suket Tidak Ada Sengketa Tanah'],
                'inputs' => ['Surat Pernyataan Modal', 'Alamat Email Pengurus', 'No HP Pengurus']
            ]),
            'active_fee_fields' => json_encode([])
        ]);

        DB::table('services')->insert([
            'service_type_id' => $notarisId, 'name' => 'Perubahan Yayasan', 'default_price' => 5500000,
            'requirements' => json_encode([
                'uploads' => ['Akta Pendirian & SK', 'Akta Perubahan Terakhir & SK', 'NPWP Badan Yayasan', 'KTP & NPWP Pengurus Baru dan Lama', 'Berita Acara Rapat Pembina', 'Surat Pengunduran Diri / Suket Kematian', 'Scan Pernyataan Domisili', 'Surat Pernyataan (Tidak Konflik/Masih Jalan)'],
                'inputs' => ['Alamat Email', 'No HP']
            ]),
            'active_fee_fields' => json_encode([])
        ]);

        DB::table('services')->insert([
            'service_type_id' => $notarisId, 'name' => 'Pendirian PT (< 1M)', 'default_price' => 7500000,
            'requirements' => json_encode([
                'uploads' => ['KTP & NPWP Pemegang Saham', 'KTP Direksi & Komisaris', 'Suket Domisili Gedung', 'Bukti Kepemilikan/Sewa'],
                'inputs' => ['Nama Perusahaan', 'Bidang Usaha', 'Modal Perseroan', 'Komposisi Saham', 'Email & No HP']
            ]),
            'active_fee_fields' => json_encode([])
        ]);

        DB::table('services')->insert([
            'service_type_id' => $notarisId, 'name' => 'Pendirian CV', 'default_price' => 4500000,
            'requirements' => json_encode([
                'uploads' => ['KTP & NPWP Pengurus'],
                'inputs' => ['Alamat CV', 'Nama CV', 'Modal Awal', 'Tujuan & Kegiatan Usaha', 'No HP & Email']
            ]),
            'active_fee_fields' => json_encode([])
        ]);


        // ==========================================
        // C. DATA LAYANAN PENGESAHAN & SERTIFIKASI (BARU)
        // ==========================================
        // Menggunakan array dan looping agar lebih rapi karena jumlahnya banyak

        $pengesahanServices = [
            'Jasa legalisasi notaris', 'Jasa notaris online', 'Jasa pengacara', 'Jasa salinan resmi',
            'Jasa tanda tangan notaris', 'Konfirmasi notaris Jurat', 'Pengesahan affidavit & sumpah',
            'Pengesahan akta', 'Pengesahan dokumen adopsi', 'Pengesahan dokumen dana jaminan & properti',
            'Pengesahan dokumen hak asuh anak', 'Pengesahan dokumen internasional', 'Pengesahan dokumen pengiriman',
            'Pengesahan dokumen perceraian', 'Pengesahan dokumen surat kuasa', 'Pengesahan kontrak',
            'Pengesahan pembelian kredit mobil', 'Pengesahan pendaftaran properti', 'Pengesahan pernyataan konfirmasi',
            'Pengesahan pinjaman', 'Pengesahan sertifikat apostille', 'Pengesahan sertifikat hukum',
            'Pengesahan surat wasiat & warisan', 'Pengesahan umum', 'Permintaan pengesahan pembayaran',
            'Persiapan dokumen notaris umum', 'Sertifikasi gelar & kualifikasi', 'Sertifikasi keaslian dokumen',
            'Sertifikasi paspor', 'Sertifikasi terjemahan'
        ];

        foreach ($pengesahanServices as $serviceName) {
            DB::table('services')->insert([
                'service_type_id' => $notarisId, // Dimasukkan ke kategori Notaris
                'name' => $serviceName,
                'default_price' => 0, // Dibiarkan 0 agar bisa diinput manual oleh staf
                'requirements' => json_encode([
                    'uploads' => ['Dokumen Asli untuk Dilegalisir/Disahkan'],
                    'inputs' => ['Keterangan Tambahan / Catatan']
                ]),
                'active_fee_fields' => json_encode([]), // Hanya menggunakan field "Honorarium Jasa Utama"
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
