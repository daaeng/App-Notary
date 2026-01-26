<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Pastikan nama tabel di sini adalah 'deed_types' (bukan yang lain)
        Schema::create('deed_types', function (Blueprint $table) {
            $table->id(); // Wajib ada untuk foreign key
            $table->string('code', 10)->unique();
            $table->string('name');
            $table->decimal('base_price', 15, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deed_types');
    }
};
