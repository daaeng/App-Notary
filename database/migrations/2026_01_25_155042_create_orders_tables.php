<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Tabel Utama Order (Pekerjaan)
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained()->onDelete('cascade'); // Siapa kliennya
            $table->foreignId('service_id')->constrained()->onDelete('restrict'); // Apa layanannya

            // Identitas Akta
            $table->string('order_number')->unique();
            $table->string('akta_number')->nullable();
            $table->date('akta_date')->nullable();
            $table->string('description')->nullable();

            // Status Pengerjaan (Workflow)
            $table->string('status')->default('new');

            // --- RINCIAN KEUANGAN BARU ---
            $table->decimal('service_price', 15, 2)->default(0);
            $table->decimal('plotting_fee', 15, 2)->default(0);
            $table->decimal('pnbp_fee', 15, 2)->default(0);
            $table->decimal('validation_fee', 15, 2)->default(0);
            $table->decimal('bphtb_fee', 15, 2)->default(0);
            $table->decimal('pph_fee', 15, 2)->default(0);
            $table->decimal('measurement_fee', 15, 2)->default(0); // Penataan Batas
            $table->decimal('location_check_fee', 15, 2)->default(0); // Pengecekan Lokasi
            $table->decimal('area_measurement_fee', 15, 2)->default(0); // Pengukuran Luas
            $table->decimal('tax_deposit', 15, 2)->default(0); // Balik Nama SPPT / Titipan
            $table->decimal('total_amount', 15, 2)->default(0); // Total Tagihan

            // --- PENYIMPANAN TEKS DINAMIS (Sharlock, No HP, Materai, dll) ---
            $table->json('additional_info')->nullable();

            // Status Pembayaran
            $table->string('payment_status')->default('unpaid');

            $table->timestamps();
        });

        // 2. Detail Khusus PPAT
        Schema::create('order_ppat_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');

            $table->text('seller_name')->nullable(); // Pihak Mengalihkan / A.n Sertifikat
            $table->text('buyer_name')->nullable(); // Pihak Menerima
            $table->string('certificate_number')->nullable();
            $table->text('object_address')->nullable();
            $table->double('land_area')->default(0);
            $table->double('building_area')->default(0);

            $table->decimal('njop', 15, 2)->default(0);
            $table->decimal('transaction_value', 15, 2)->default(0);
            $table->decimal('ssp_amount', 15, 2)->default(0);
            $table->decimal('ssb_amount', 15, 2)->default(0);

            $table->timestamps();
        });

        // 3. Tracking History
        Schema::create('order_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->string('status');
            $table->text('note')->nullable();
            $table->foreignId('user_id')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_histories');
        Schema::dropIfExists('order_ppat_details');
        Schema::dropIfExists('orders');
    }
};
