<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventory_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['in', 'out']); // 'in' = Setor/Masuk, 'out' = Ambil/Keluar
            $table->integer('qty'); // Jumlah yang disetor/diambil
            $table->integer('remaining_stock'); // Sisa stok setelah transaksi
            $table->string('actor_name'); // Nama Penyetor / Pengambil
            $table->string('notes')->nullable(); // Keterangan
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_logs');
    }
};
