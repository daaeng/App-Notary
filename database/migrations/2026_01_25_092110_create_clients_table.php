<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['perorangan', 'badan_hukum'])->default('perorangan');
            $table->string('name');
            $table->string('nik_or_npwp', 30)->unique()->comment('NIK untuk perorangan, NPWP untuk badan');
            $table->string('phone', 20)->nullable();
            $table->string('email')->nullable();
            $table->text('address');

            // Untuk Badan Hukum
            $table->string('representative_name')->nullable()->comment('Nama Penanggung Jawab jika PT/CV');

            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes(); // Agar data klien tidak hilang permanen saat dihapus
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};
