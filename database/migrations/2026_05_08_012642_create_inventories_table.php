<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventories', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Nama barang (Misal: Kertas A4, Materai)
            $table->string('unit')->default('pcs'); // Satuan (Misal: Rim, Lembar, Box)
            $table->integer('stock')->default(0); // Jumlah stok saat ini
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventories');
    }
};
