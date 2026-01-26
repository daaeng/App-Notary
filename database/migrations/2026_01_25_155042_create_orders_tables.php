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
            $table->string('order_number')->unique(); // No Order Sistem (Generate Auto)
            $table->string('akta_number')->nullable(); // No Akta Resmi (01/2026)
            $table->date('akta_date')->nullable(); // Tgl Akta
            $table->string('description')->nullable(); // Judul/Keterangan (Misal: Jual Beli Tanah di Kemang)

            // Status Pengerjaan (Workflow)
            // Enum: 'new', 'draft', 'process', 'minuta', 'binding', 'done', 'cancel'
            $table->string('status')->default('new');

            // Keuangan (Pemisahan Honor vs Titipan Negara)
            $table->decimal('service_price', 15, 2)->default(0); // Jasa Notaris
            $table->decimal('tax_deposit', 15, 2)->default(0); // Titipan Pajak (PPH/BPHTB)
            $table->decimal('total_amount', 15, 2)->default(0); // Total Tagihan

            // Status Pembayaran
            // Enum: 'unpaid', 'partial', 'paid'
            $table->string('payment_status')->default('unpaid');

            $table->timestamps();
        });

        // 2. Detail Khusus PPAT (Sesuai Referensi Gambar Mas Daeng)
        Schema::create('order_ppat_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');

            // Pihak (Kompleksitas PPAT: Ada Penjual & Pembeli selain Klien Utama)
            $table->text('seller_name')->nullable(); // Pihak Mengalihkan
            $table->text('buyer_name')->nullable(); // Pihak Menerima

            // Objek Tanah/Bangunan
            $table->string('certificate_number')->nullable(); // No SHM/HGB
            $table->text('object_address')->nullable(); // Letak Tanah
            $table->double('land_area')->default(0); // Luas Tanah (m2)
            $table->double('building_area')->default(0); // Luas Bangunan (m2)

            // Nilai Transaksi & Pajak
            $table->decimal('njop', 15, 2)->default(0); // NJOP
            $table->decimal('transaction_value', 15, 2)->default(0); // Harga Transaksi
            $table->decimal('ssp_amount', 15, 2)->default(0); // PPH Final
            $table->decimal('ssb_amount', 15, 2)->default(0); // BPHTB

            $table->timestamps();
        });

        // 3. Tracking History (Log Perubahan Status)
        Schema::create('order_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->string('status'); // Status saat itu
            $table->text('note')->nullable(); // Catatan (misal: "Berkas kurang KTP")
            $table->foreignId('user_id')->nullable(); // Siapa staff yang update
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
