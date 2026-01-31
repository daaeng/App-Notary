<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->string('name')->default('KANTOR NOTARIS & PPAT');
            $table->string('notary_name');
            $table->string('address');
            $table->string('phone');
            $table->string('email')->nullable();

            // [BARU] Tambahan Kolom
            $table->string('bank_account')->nullable(); // Nama Bank & No Rek
            $table->string('logo_path')->nullable();    // Lokasi file logo

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('companies');
    }
};
