<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_files', function (Blueprint $table) {
            $table->id();
            // Hubungkan dengan tabel orders
            $table->foreignId('order_id')->constrained()->onDelete('cascade');

            $table->string('file_name'); // Nama asli file (misal: KTP_Klien.pdf)
            $table->string('file_path'); // Lokasi file di dalam storage
            $table->string('file_type')->nullable(); // Jenis file (pdf/jpg)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_files');
    }
};
