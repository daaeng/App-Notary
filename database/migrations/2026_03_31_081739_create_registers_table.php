<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('registers', function (Blueprint $blueprint) {
            $blueprint->id();
            // Untuk membedakan: 'akta', 'protes', 'legalisasi'
            $blueprint->string('type')->index();
            $blueprint->string('halaman_buku')->nullable();
            $blueprint->integer('nomor_urut');

            // Kolom Spesifik Buku Daftar Akta (Merah)
            $blueprint->string('nomor_bulanan')->nullable();
            $blueprint->date('tanggal_akta')->nullable();
            $blueprint->string('sifat_akta')->nullable();

            // Kolom Spesifik Buku Daftar Protes (Hitam)
            $blueprint->string('nomor_akta')->nullable();
            $blueprint->date('tanggal')->nullable();
            $blueprint->string('yang_ditagih')->nullable();
            $blueprint->string('yang_menagih')->nullable();
            $blueprint->date('tanggal_wesel')->nullable();
            $blueprint->date('tanggal_jatuh_waktu')->nullable();

            // Kolom Spesifik Buku Daftar Surat Bawah Tangan (Hijau)
            $blueprint->date('tanggal_surat')->nullable();
            $blueprint->date('tanggal_didaftarkan')->nullable();
            $blueprint->string('sifat_surat')->nullable();

            // Kolom Umum
            $blueprint->text('nama_penghadap')->nullable(); // Bisa untuk semua jenis buku
            $blueprint->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('registers');
    }
};
