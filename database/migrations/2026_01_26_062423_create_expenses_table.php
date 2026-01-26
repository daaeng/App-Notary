<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->string('title'); // Contoh: "Bayar Listrik", "Beli Kertas A4"
            $table->decimal('amount', 15, 2); // Jumlah uang
            $table->date('transaction_date'); // Tanggal transaksi
            $table->string('category')->nullable(); // Kategori: Operasional, Gaji, ATK, Lainnya
            $table->text('description')->nullable(); // Catatan tambahan
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
