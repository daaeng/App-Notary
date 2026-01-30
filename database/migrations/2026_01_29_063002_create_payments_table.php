<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            // Relasi ke tabel orders
            $table->foreignId('order_id')->constrained()->onDelete('cascade');

            $table->decimal('amount', 15, 2); // Nominal bayar
            $table->date('payment_date'); // Tanggal bayar
            $table->string('payment_method'); // Transfer/Cash
            $table->string('proof_file')->nullable(); // Foto Bukti Transfer
            $table->text('note')->nullable(); // Catatan (misal: "DP Tahap 1")

            // Mencatat siapa yang menginput (Admin/Bos)
            $table->foreignId('created_by')->constrained('users');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
