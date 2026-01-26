<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('deeds', function (Blueprint $table) {
            $table->id();
            $table->string('deed_number')->nullable()->unique()->comment('Nomor Akta (Null saat draft)');
            $table->date('deed_date')->nullable();

            // Foreign Keys
            $table->foreignId('deed_type_id')->constrained('deed_types')->onDelete('restrict');
            $table->foreignId('client_id')->constrained('clients')->onDelete('cascade');
            $table->foreignId('pic_id')->constrained('users')->comment('Staff Penanggung Jawab');

            $table->text('description')->nullable();

            // Status Flow
            $table->enum('status', ['draft', 'process', 'waiting_approval', 'approved', 'finalized'])->default('draft');

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deeds');
    }
};
