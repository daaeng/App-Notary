<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('deed_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('deed_id')->constrained('deeds')->cascadeOnDelete();
            $table->string('category')->comment('KTP, KK, Sertifikat, dll');
            $table->string('file_path');
            $table->string('file_name');
            $table->string('mime_type')->nullable();
            $table->bigInteger('size')->default(0);

            $table->foreignId('uploaded_by')->constrained('users');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deed_attachments');
    }
};
