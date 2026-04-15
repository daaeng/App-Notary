<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->timestamps();
        });

        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_type_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('code')->nullable();
            $table->decimal('default_price', 15, 2)->default(0);

            // --- TAMBAHAN BARU ---
            // Menyimpan array persyaratan: ["Sertifikat Asli", "PBB", dll]
            $table->json('requirements')->nullable();
            // Menyimpan field biaya yang muncul: ["plotting", "pnbp", "pph"]
            $table->json('active_fee_fields')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('services');
        Schema::dropIfExists('service_types');
    }
};
